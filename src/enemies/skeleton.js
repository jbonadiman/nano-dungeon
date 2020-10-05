/* eslint-disable class-methods-use-this */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import dungeon from '../dungeon.js';
import Gem from '../items/gem.js';
import LongSword from '../items/longSword.js';
import Potion from '../items/potion.js';
import turnManager from '../turnManager.js';

const initial = {
  MP: 1,
  AP: 1,
  HP: 4,
};

export default class Skeleton {
  constructor(x, y) {
    this.name = 'Skeleton';
    this.movementPoints = initial.MP;
    this.actionPoints = initial.AP;
    this.healthPoints = initial.HP;
    this.x = x;
    this.y = y;
    this.tile = 26;
    this.type = 'enemy';

    dungeon.initializeEntity(this);
  }

  refresh() {
    this.movementPoints = initial.MP;
    this.actionPoints = initial.AP;
  }

  attack() {
    return 1;
  }

  protection() {
    return 0;
  }

  turn() {
    const oldX = this.x;
    const oldY = this.y;

    const playerX = dungeon.player.x;
    const playerY = dungeon.player.y;
    const grid = new PF.Grid(dungeon.level);
    const finder = new PF.AStarFinder();
    const path = finder.findPath(oldX, oldY, playerX, playerY, grid);

    if (this.movementPoints > 0) {
      if (path.length > 2) {
        dungeon.moveEntityTo(this, path[1][0], path[1][1]);
      }

      this.movementPoints -= 1;
    }

    if (this.actionPoints > 0) {
      if (dungeon.distanceBetweenEntities(this, dungeon.player) <= 2) {
        dungeon.attackEntity(this, dungeon.player);
      }

      this.actionPoints -= 1;
    }
  }

  over() {
    const isOver = this.movementPoints === 0 && this.actionPoints === 0 && !this.moving;
    if (isOver && this.UItext) {
      this.UItext.setColor('#cfc6b8');
    } else {
      this.UItext.setColor('#fff');
    }

    return isOver;
  }

  onDestroy() {
    dungeon.log(`${this.name} was killed.`);
    this.UIsprite.setAlpha(0.2);
    this.UItext.setAlpha(0.2);

    const possibleLoot = [
      false, false,
      Gem,
      LongSword,
      Potion,
    ];

    const lootIndex = Phaser.Math.Between(0, possibleLoot.length - 1);
    if (possibleLoot[lootIndex]) {
      const Item = possibleLoot[lootIndex];
      turnManager.addEntity(new Item(this.x, this.y));
      dungeon.log(`${this.name} drops ${Item.name}.`);
    }
  }

  createUI(config) {
    const {
      scene,
      x,
      y,
    } = config;

    this.UIsprite = scene.add.sprite(x, y, 'tiles', this.tile).setOrigin(0);
    this.UItext = scene.add.text(
      x + 20,
      y,
      this.name,
      { font: '16px Arial', fill: '#cfc6b8' },
    );

    return 30;
  }
}
