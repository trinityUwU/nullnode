// Types & validation des messages du protocole de rendez-vous aveugle.

export interface HelloMessage {
  t: "hello";
  addr: string;
}

export interface SignalInMessage {
  t: "signal";
  to: string;
  payload: string;
}

export interface PingMessage {
  t: "ping";
}

export type ClientMessage = HelloMessage | SignalInMessage | PingMessage;

export interface WelcomeMessage {
  t: "welcome";
  online: string[];
}

export interface PresenceMessage {
  t: "presence";
  addr: string;
  state: "online" | "offline";
}

export interface SignalOutMessage {
  t: "signal";
  from: string;
  payload: string;
}

export interface PongMessage {
  t: "pong";
}

export interface ErrorMessage {
  t: "error";
  code: string;
}

export type ServerMessage =
  | WelcomeMessage
  | PresenceMessage
  | SignalOutMessage
  | PongMessage
  | ErrorMessage;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseClientMessage(raw: unknown): ClientMessage | null {
  if (!isRecord(raw) || typeof raw.t !== "string") return null;
  if (raw.t === "ping") return { t: "ping" };
  if (raw.t === "hello" && typeof raw.addr === "string") {
    return { t: "hello", addr: raw.addr };
  }
  if (raw.t === "signal" && typeof raw.to === "string" && typeof raw.payload === "string") {
    return { t: "signal", to: raw.to, payload: raw.payload };
  }
  return null;
}
