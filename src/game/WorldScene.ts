// @ts-nocheck
// ============================================================
// 2Life — WorldScene (Phaser 4)
// Phaser uses export= CJS-style types which conflict with
// verbatimModuleSyntax; @ts-nocheck is used here intentionally
// for the Phaser scene only. All game logic is typed via JSDoc.
// ============================================================
import * as Phaser from "phaser";
import { getTheme } from "./art/themes";
import { gameBus }  from "./eventBus";

// Map size in px
const MAP_W = 800;
const MAP_H = 600;
const TILE   = 48;

// Joystick constants
const JOY_OUTER_R = 48;
const JOY_INNER_R = 24;
const JOY_ALPHA   = 0.6;

export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: "WorldScene" });
    /** @type {import("../../types/world.ts").WorldDef} */
    this.worldDef   = null;
    this.player     = null;
    this.playerLabel = null;
    this.speed      = 120;
    this.cursors    = null;
    this.wasd       = null;
    this.joyOuter   = null;
    this.joyInner   = null;
    this.joyActive  = false;
    this.joyOrigin  = { x: 0, y: 0 };
    this.joyVector  = { x: 0, y: 0 };
    this.joyPointerId = -1;
    this.walls      = null;
    /** @type {Array<{zone: any, place: import("../../types/world.ts").WorldPlace}>} */
    this.triggers   = [];
    this.tapTarget  = null;
    this.currentPlaceId = null;
  }

  /** @param {{ worldDef: import("../../types/world.ts").WorldDef }} data */
  init(data) {
    this.worldDef = data.worldDef;
  }

  create() {
    const theme = getTheme(this.worldDef?.artTheme?.tilesetId);

    // Background
    this.cameras.main.setBackgroundColor(theme.skyColor);
    this.add.rectangle(MAP_W / 2, MAP_H / 2, MAP_W, MAP_H, theme.groundColor);

    // Paths
    this._drawPaths(theme.pathColor);

    // Physics
    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);
    this.walls = this.physics.add.staticGroup();

    // Build places from WorldDef
    for (const place of (this.worldDef?.places ?? [])) {
      this._buildPlace(place, theme);
    }

    // Decorative trees
    this._addTrees(theme.treeEmoji);

    // Player
    this.player = this.add.circle(MAP_W / 2, MAP_H / 2, theme.playerRadius, theme.playerColor);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    this.playerLabel = this.add.text(0, 0, "🧍", { fontSize: "20px", resolution: 2 })
      .setOrigin(0.5, 1.2)
      .setDepth(10);

    this.physics.add.collider(this.player, this.walls);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);

    // Keyboard
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        up:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Touch
    this._setupTouchInput();
  }

  _buildPlace(place, theme) {
    const px = place.mapPosition.x * MAP_W;
    const py = place.mapPosition.y * MAP_H;
    const bw = place.width  * TILE;
    const bh = place.height * TILE;

    // Building rectangle
    const building = this.add.rectangle(px, py, bw, bh, theme.buildingColors.fill);
    building.setStrokeStyle(3, theme.buildingColors.stroke);
    this.physics.add.existing(building, true);
    this.walls.add(building);

    // Icon
    this.add.text(px, py, place.icon, { fontSize: "24px", resolution: 2 })
      .setOrigin(0.5).setDepth(2);

    // Name label
    this.add.text(px, py - bh / 2 - 6, place.name, {
      fontSize: "11px",
      color: theme.labelColor,
      stroke: "#000000",
      strokeThickness: 3,
      resolution: 2,
      fontStyle: "bold",
    }).setOrigin(0.5, 1).setDepth(3);

    // Trigger zone
    const zone = this.add.rectangle(px, py, bw + 20, bh + 20);
    zone.setFillStyle(0xffffff, 0);
    this.triggers.push({ zone, place });
  }

  _drawPaths(color) {
    const places = this.worldDef?.places ?? [];
    if (places.length < 2) return;
    const gfx = this.add.graphics();
    gfx.lineStyle(14, color, 0.55);
    gfx.setDepth(-1);
    for (let i = 0; i < places.length - 1; i++) {
      const a = places[i];
      const b = places[i + 1];
      gfx.strokeLineShape(new Phaser.Geom.Line(
        a.mapPosition.x * MAP_W,
        a.mapPosition.y * MAP_H,
        b.mapPosition.x * MAP_W,
        b.mapPosition.y * MAP_H,
      ));
    }
  }

  _addTrees(emoji) {
    const positions = [
      { x: 80, y: 90 }, { x: 400, y: 500 }, { x: 700, y: 450 },
      { x: 150, y: 480 }, { x: 600, y: 90 }, { x: 330, y: 330 },
    ];
    for (const pos of positions) {
      this.add.text(pos.x, pos.y, emoji, { fontSize: "24px", resolution: 2 })
        .setOrigin(0.5, 1);
    }
  }

  _setupTouchInput() {
    this.joyOuter = this.add.circle(80, MAP_H - 80, JOY_OUTER_R, 0x000000, JOY_ALPHA)
      .setScrollFactor(0).setDepth(100);
    this.joyInner = this.add.circle(80, MAP_H - 80, JOY_INNER_R, 0xffffff, JOY_ALPHA)
      .setScrollFactor(0).setDepth(101);

    this.input.on("pointerdown", (p) => {
      if (p.x < this.scale.width * 0.35) {
        this.joyActive = true;
        this.joyPointerId = p.id;
        this.joyOrigin = { x: p.x, y: p.y };
        this.joyOuter.setPosition(p.x, p.y);
        this.joyInner.setPosition(p.x, p.y);
      } else {
        this.tapTarget = new Phaser.Math.Vector2(p.worldX, p.worldY);
      }
    });

    this.input.on("pointermove", (p) => {
      if (!this.joyActive || p.id !== this.joyPointerId) return;
      const dx = p.x - this.joyOrigin.x;
      const dy = p.y - this.joyOrigin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const max = JOY_OUTER_R - JOY_INNER_R;
      const cx = dist > max ? (dx / dist) * max : dx;
      const cy = dist > max ? (dy / dist) * max : dy;
      this.joyInner.setPosition(this.joyOrigin.x + cx, this.joyOrigin.y + cy);
      this.joyVector = { x: cx / max, y: cy / max };
    });

    this.input.on("pointerup", (p) => {
      if (p.id === this.joyPointerId) {
        this.joyActive = false;
        this.joyPointerId = -1;
        this.joyVector = { x: 0, y: 0 };
        this.joyInner.setPosition(this.joyOuter.x, this.joyOuter.y);
      }
    });
  }

  update() {
    if (!this.player?.body) return;

    let vx = 0;
    let vy = 0;

    // Keyboard
    if (this.cursors) {
      if (this.cursors.left.isDown  || this.wasd?.left.isDown)  vx = -this.speed;
      if (this.cursors.right.isDown || this.wasd?.right.isDown) vx =  this.speed;
      if (this.cursors.up.isDown    || this.wasd?.up.isDown)    vy = -this.speed;
      if (this.cursors.down.isDown  || this.wasd?.down.isDown)  vy =  this.speed;
    }

    // Joystick
    if (this.joyActive) {
      vx = this.joyVector.x * this.speed;
      vy = this.joyVector.y * this.speed;
    }

    // Tap-to-move
    if (vx === 0 && vy === 0 && !this.joyActive && this.tapTarget) {
      const dx = this.tapTarget.x - this.player.x;
      const dy = this.tapTarget.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 8) {
        vx = (dx / dist) * this.speed;
        vy = (dy / dist) * this.speed;
      } else {
        this.tapTarget = null;
      }
    }

    this.player.body.setVelocity(vx, vy);
    this.playerLabel?.setPosition(this.player.x, this.player.y);

    // Trigger detection
    let inPlace = null;
    const pb = this.player.getBounds();
    for (const { zone, place } of this.triggers) {
      if (Phaser.Geom.Rectangle.Overlaps(zone.getBounds(), pb)) {
        inPlace = place;
        break;
      }
    }

    if (inPlace && inPlace.id !== this.currentPlaceId) {
      this.currentPlaceId = inPlace.id;
      gameBus.emit("visitPlace", {
        placeId:   inPlace.id,
        placeName: inPlace.name,
        placeIcon: inPlace.icon,
      });
    } else if (!inPlace && this.currentPlaceId !== null) {
      this.currentPlaceId = null;
    }
  }
}
