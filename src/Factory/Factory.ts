import { Bot, Entity, EntityType, Item } from "@nsdefs";
import { factory } from "./Helper";

export interface Factory {
  bits: number;
  entities: Entity[];
}

export const distance = (a: Entity, b: Entity) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const adjacent = (a: Entity, b: Entity) => distance(a, b) === 1;

export const findBot = (name: string) =>
  factory.entities.find((e): e is Bot => e.type === EntityType.Bot && e.name === name);

export const findEntityAt = <T extends Entity>(x: number, y: number, type?: EntityType): T | undefined =>
  factory.entities.find((e): e is T => (!type || e.type === type) && e.x === x && e.y === y);

export const bitsMap: Record<Item, number> = {
  [Item.BasicR]: 1,
  [Item.BasicG]: 1,
  [Item.BasicB]: 1,
  [Item.ComplexR]: 4,
  [Item.ComplexG]: 4,
  [Item.ComplexB]: 4,
};
