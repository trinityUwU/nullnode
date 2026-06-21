// Store-and-forward des envelopes applicatives opaques.
// Map<address, Envelope[]> persistée en JSON (debounce). Le payload n'est JAMAIS lu.

import signale from "signale";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export interface Envelope {
  id: string;
  from: string;
  to: string;
  payload: string;
  at: number;
}

const DATA_FILE = new URL("../data/envelopes.json", import.meta.url).pathname;
const FLUSH_DEBOUNCE_MS = 500;

export class EnvelopeStore {
  private readonly byAddress = new Map<string, Envelope[]>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  add(env: Envelope): void {
    const list = this.byAddress.get(env.to) ?? [];
    list.push(env);
    this.byAddress.set(env.to, list);
    this.scheduleFlush();
  }

  pendingFor(addr: string): Envelope[] {
    return this.byAddress.get(addr) ?? [];
  }

  ack(addr: string, ids: string[]): void {
    const list = this.byAddress.get(addr);
    if (!list) return;
    const toRemove = new Set(ids);
    const kept = list.filter((env) => !toRemove.has(env.id));
    if (kept.length === 0) this.byAddress.delete(addr);
    else this.byAddress.set(addr, kept);
    this.scheduleFlush();
  }

  async load(): Promise<void> {
    try {
      const file = Bun.file(DATA_FILE);
      if (!(await file.exists())) return;
      const raw: unknown = await file.json();
      this.hydrate(raw);
      signale.info(`envelopes loaded: ${this.byAddress.size} address(es)`);
    } catch (err) {
      signale.error("envelope load failed:", err);
    }
  }

  private hydrate(raw: unknown): void {
    if (typeof raw !== "object" || raw === null) return;
    for (const [addr, value] of Object.entries(raw as Record<string, unknown>)) {
      if (Array.isArray(value)) this.byAddress.set(addr, value as Envelope[]);
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      void this.flush();
    }, FLUSH_DEBOUNCE_MS);
  }

  private async flush(): Promise<void> {
    this.flushTimer = null;
    try {
      await mkdir(dirname(DATA_FILE), { recursive: true });
      const obj = Object.fromEntries(this.byAddress);
      await Bun.write(DATA_FILE, JSON.stringify(obj));
    } catch (err) {
      signale.error("envelope flush failed:", err);
    }
  }
}
