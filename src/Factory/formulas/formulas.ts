import { EntityType } from "@nsdefs";

export type FactoryFormulaParams = [number, number, number, number];

export const inventoryScale: Record<EntityType, FactoryFormulaParams> = {
  [EntityType.Bot]: [8, 0.5, 2, 0],
  [EntityType.Dispenser]: [4, 1, 5, 0],
  [EntityType.Dock]: [Infinity, Infinity, Infinity, Infinity],
  [EntityType.Crafter]: [Infinity, 1, -1, 4095],
  [EntityType.Chest]: [1.2, 10, 0, 63],
  [EntityType.Wall]: [Infinity, Infinity, Infinity, Infinity],
};

// a^(b*X+c)+d
const exp = (p: FactoryFormulaParams, x: number): number => Math.floor(Math.pow(p[0], p[1] * x + p[2]) + p[3]);

export const upgradeMaxInventoryCost = (type: EntityType, currentMaxInventory: number): number =>
  exp(inventoryScale[type], currentMaxInventory);

export const botPrice = (currentBots: number): number => Math.pow(2, currentBots + 3);

/**
glitches:

1 - moving dock & dispensers
2 - energy consumption
3 - ugrade degradation
4 - power hinderance (speed & transfer)
5 - dexterity hinderance (craft & build)
6 - dock complexity
7 - random walls



 */
