// @ts-nocheck
// ============================================================
// 2Life — Phaser Game Factory
// Creates/destroys Phaser game instances.
// StrictMode-safe: tracks instances via WeakMap.
// @ts-nocheck: Phaser uses CJS export= which conflicts with
// verbatimModuleSyntax. Runtime types are correct.
// ============================================================
import * as Phaser from "phaser";
import { WorldScene } from "./WorldScene";

/** @type {WeakMap<Element, import("phaser").Game>} */
const instanceMap = new WeakMap();

/**
 * @param {HTMLDivElement} container
 * @param {import("../types/world.ts").WorldDef} worldDef
 * @param {number} width
 * @param {number} height
 * @returns {import("phaser").Game}
 */
export function createGame(container, worldDef, width, height) {
  if (instanceMap.has(container)) {
    instanceMap.get(container).destroy(true);
    instanceMap.delete(container);
  }

  const config = {
    type:   Phaser.AUTO,
    width,
    height,
    parent: container,
    backgroundColor: "#1e293b",
    physics: {
      default: "arcade",
      arcade:  { debug: false },
    },
    scene: WorldScene,
    scale: {
      mode:       Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      activePointers: 3,
    },
    banner: false,
  };

  const game = new Phaser.Game(config);

  game.events.once(Phaser.Core.Events.READY, () => {
    game.scene.start("WorldScene", { worldDef });
  });

  instanceMap.set(container, game);
  return game;
}

/** @param {HTMLDivElement} container */
export function destroyGame(container) {
  const game = instanceMap.get(container);
  if (game) {
    game.destroy(true);
    instanceMap.delete(container);
  }
}

/**
 * @param {HTMLDivElement} container
 * @param {number} width
 * @param {number} height
 */
export function resizeGame(container, width, height) {
  const game = instanceMap.get(container);
  if (game) {
    game.scale.resize(width, height);
  }
}
