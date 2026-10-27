// ============================================================
// 2Life — Phaser ↔ React Event Bus
// A tiny typed event emitter that both sides share.
// No Phaser types leak into React components.
// ============================================================

type EventMap = {
  /** Phaser → React: player entered a place trigger zone */
  visitPlace: { placeId: string; placeName: string; placeIcon: string };
  /** React → Phaser: world changed, rebuild the map */
  worldChanged: { worldId: string };
  /** React → Phaser: resize the canvas */
  resize: { width: number; height: number };
  /** React → Phaser: clean up */
  destroy: Record<string, never>;
};

type EventKey = keyof EventMap;
type Listener<K extends EventKey> = (data: EventMap[K]) => void;

class GameEventBus {
  private listeners: Partial<{ [K in EventKey]: Listener<K>[] }> = {};

  on<K extends EventKey>(event: K, fn: Listener<K>): () => void {
    if (!this.listeners[event]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.listeners as any)[event] = [];
    }
    (this.listeners[event] as Listener<K>[]).push(fn);
    return () => this.off(event, fn);
  }

  off<K extends EventKey>(event: K, fn: Listener<K>): void {
    const arr = this.listeners[event] as Listener<K>[] | undefined;
    if (arr) {
      const idx = arr.indexOf(fn);
      if (idx !== -1) arr.splice(idx, 1);
    }
  }

  emit<K extends EventKey>(event: K, data: EventMap[K]): void {
    const arr = this.listeners[event] as Listener<K>[] | undefined;
    if (arr) {
      for (const fn of [...arr]) fn(data);
    }
  }

  removeAll(): void {
    this.listeners = {};
  }
}

// Singleton — one bus shared across React and Phaser
export const gameBus = new GameEventBus();
