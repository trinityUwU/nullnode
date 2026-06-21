// Serveur relai de rendez-vous aveugle (Bun.serve websocket). Routing + présence.
// Le payload des messages `signal` est OPAQUE : jamais lu, jamais déchiffré.

import signale from "signale";
import type { ServerWebSocket } from "bun";
import { Registry, type SocketData } from "./registry";
import {
  parseClientMessage,
  type HelloMessage,
  type SignalInMessage,
} from "./protocol";

const PORT = Number(process.env.RELAY_PORT ?? 8791);
const registry = new Registry();

type Socket = ServerWebSocket<SocketData>;

function handleHello(ws: Socket, msg: HelloMessage): void {
  const previous = ws.data.addr;
  if (previous && previous !== msg.addr) registry.remove(previous);
  ws.data.addr = msg.addr;
  registry.register(msg.addr, ws);
  ws.send(JSON.stringify({ t: "welcome", online: registry.online() }));
  registry.broadcastExcept(msg.addr, { t: "presence", addr: msg.addr, state: "online" });
  signale.success(`online: ${msg.addr} (${registry.online().length} total)`);
}

function handleSignal(ws: Socket, msg: SignalInMessage): void {
  const from = ws.data.addr;
  if (!from) {
    ws.send(JSON.stringify({ t: "error", code: "NOT_REGISTERED" }));
    return;
  }
  const delivered = registry.send(msg.to, { t: "signal", from, payload: msg.payload });
  if (!delivered) {
    ws.send(JSON.stringify({ t: "error", code: "PEER_OFFLINE" }));
    signale.warn(`signal ${from} -> ${msg.to}: PEER_OFFLINE`);
    return;
  }
  signale.info(`signal ${from} -> ${msg.to}`);
}

function routeMessage(ws: Socket, raw: string | Buffer): void {
  try {
    const parsed: unknown = JSON.parse(raw.toString());
    const msg = parseClientMessage(parsed);
    if (!msg) {
      ws.send(JSON.stringify({ t: "error", code: "BAD_MESSAGE" }));
      return;
    }
    if (msg.t === "hello") handleHello(ws, msg);
    else if (msg.t === "signal") handleSignal(ws, msg);
    else if (msg.t === "ping") ws.send(JSON.stringify({ t: "pong" }));
  } catch (err) {
    signale.error("parse/route failed:", err);
    try {
      ws.send(JSON.stringify({ t: "error", code: "BAD_MESSAGE" }));
    } catch (sendErr) {
      signale.error("error reply failed:", sendErr);
    }
  }
}

function handleClose(ws: Socket): void {
  const addr = ws.data.addr;
  if (!addr) return;
  registry.remove(addr);
  ws.data.addr = null;
  registry.broadcastExcept(addr, { t: "presence", addr, state: "offline" });
  signale.info(`offline: ${addr} (${registry.online().length} total)`);
}

const server = Bun.serve<SocketData>({
  port: PORT,
  fetch(req, srv): Response | undefined {
    if (srv.upgrade(req, { data: { addr: null } })) return undefined;
    return new Response("NULLNODE blind rendezvous relay", { status: 426 });
  },
  websocket: {
    message: routeMessage,
    close: handleClose,
  },
});

signale.start(`NULLNODE relay listening on ws://127.0.0.1:${server.port}`);
