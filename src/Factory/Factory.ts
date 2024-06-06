import {
  Bot,
  Entity,
  EntityType,
  ContainerEntity,
  Item,
  Dispenser,
  Dock,
  Crafter,
  Chest,
  Wall,
  BaseEntity,
  EntityID,
} from "@nsdefs";
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

export const isEntityContainer = (entity: BaseEntity): entity is ContainerEntity => "inventory" in entity;

export const isEntityBot = (e: Entity): e is Bot => e.type === EntityType.Bot;
export const isEntityDispenser = (e: Entity): e is Dispenser => e.type === EntityType.Dispenser;
export const isEntityDock = (e: Entity): e is Dock => e.type === EntityType.Dock;
export const isEntityCrafter = (e: Entity): e is Crafter => e.type === EntityType.Crafter;
export const isEntityChest = (e: Entity): e is Chest => e.type === EntityType.Chest;
export const isEntityWall = (e: Entity): e is Wall => e.type === EntityType.Wall;

export const findEntity = (id: EntityID, type?: EntityType): Entity | undefined =>
  factory.entities.find(
    typeof id === "string"
      ? (e) => e.name === id && (!type || type === e.type)
      : (e) => e.x === id[0] && e.y === id[1] && (!type || type === e.type),
  );
