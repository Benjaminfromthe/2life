// ============================================================
// 2Life — PhaserWorld React Component
// Mounts the Phaser game into the React tree.
// Bridges gameBus events → Zustand store (visitPlace).
// Safe for React StrictMode: uses a ref-guard.
// ============================================================
import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "../../store/gameStore";
import { createGame, destroyGame } from "../../game/gameFactory";
import { gameBus } from "../../game/eventBus";
import { getWorld } from "../../data/worlds/index";

export default function PhaserWorld() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mountedRef    = useRef(false);   // StrictMode guard

  const { worldId, visitPlace } = useGameStore((s) => ({
    worldId:    s.worldId,
    visitPlace: s.visitPlace,
  }));

  const worldDef = getWorld(worldId ?? "modern");

  // ── Handle visitPlace events from Phaser ──────────────────
  const handleVisitPlace = useCallback(
    (data: { placeId: string; placeName: string; placeIcon: string }) => {
      visitPlace(data.placeId, data.placeName, data.placeIcon);
    },
    [visitPlace],
  );

  // ── Mount / unmount Phaser ────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mountedRef.current) return;
    mountedRef.current = true;

    const { offsetWidth: w, offsetHeight: h } = container;
    createGame(container, worldDef, w || 400, h || 300);

    // Subscribe to place-visit events
    const unsub = gameBus.on("visitPlace", handleVisitPlace);

    // Resize observer
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !container) return;
      const { width, height } = entry.contentRect;
      // Dynamically import to keep factory out of React scope
      import("../../game/gameFactory").then(({ resizeGame }) => {
        resizeGame(container, Math.floor(width), Math.floor(height));
      });
    });
    ro.observe(container);

    return () => {
      mountedRef.current = false;
      unsub();
      ro.disconnect();
      destroyGame(container);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);   // Only run once — worldDef changes handled separately

  // ── Re-init if world changes ──────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mountedRef.current) return;
    destroyGame(container);
    const { offsetWidth: w, offsetHeight: h } = container;
    createGame(container, worldDef, w || 400, h || 300);
  }, [worldId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      id="phaser-world-container"
      className="phaser-world"
      aria-label="Interactive world map"
      role="application"
    />
  );
}
