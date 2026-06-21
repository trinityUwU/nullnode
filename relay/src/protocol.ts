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

export interface RelayInMessage {
  t: "relay";
  to: string;
  payload: string;
}

export interface AckMessage {
  t: "ack";
  ids: string[];
}

export type ClientMessage =
  | HelloMessage
  | SignalInMessage
  | PingMessage
  | RelayInMessage
  | AckMessage;

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

export interface EnvelopeOutMessage {
  t: "envelope";
  id: string;
  from: string;
  payload: string;
}

export interface ErrorMessage {
  t: "error";
  code: string;
}

export type ServerMessage =
  | WelcomeMessage
  | PresenceMessage
  | SignalOutMessage
  | EnvelopeOutMessage
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
  if (raw.t === "relay" && typeof raw.to === "string" && typeof raw.payload === "string") {
    return { t: "relay", to: raw.to, payload: raw.payload };
  }
  if (raw.t === "ack" && isStringArray(raw.ids)) {
    return { t: "ack", ids: raw.ids };
  }
  return null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
