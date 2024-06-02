import { EntityType, Item } from "@nsdefs";
import { Factory } from "./Factory";

export const factorySize = 12;

const defaultFactory: Factory = {
  bits: 0,
  entities: [
    {
      type: EntityType.Dispenser,
      dispensing: Item.BasicR,
      x: Math.floor(factorySize / 4),
      y: 0,
      cooldown: 10000,
      cooldownUntil: 0,
      inventory: [Item.BasicR],
      maxInventory: 1,
    },
    {
      type: EntityType.Dispenser,
      dispensing: Item.BasicG,
      x: Math.floor(factorySize / 2),
      y: 0,
      cooldown: 10000,
      cooldownUntil: 0,
      inventory: [Item.BasicG],
      maxInventory: 1,
    },
    {
      type: EntityType.Dispenser,
      dispensing: Item.BasicB,
      x: Math.floor((factorySize * 3) / 4),
      y: 0,
      cooldown: 10000,
      cooldownUntil: 0,
      inventory: [Item.BasicB],
      maxInventory: 1,
    },
    {
      type: EntityType.Dock,
      x: Math.floor(factorySize / 4),
      y: Math.floor(factorySize - 1),
      potentialRequest: [Item.BasicR, Item.BasicG, Item.BasicB],
      potentialRequestCount: 1,
      currentRequest: [Item.BasicR],
      inventory: [],
      maxInventory: 1,
    },
    {
      type: EntityType.Dock,
      x: Math.floor(factorySize / 2),
      y: Math.floor(factorySize - 1),
      potentialRequest: [Item.BasicR, Item.BasicG, Item.BasicB],
      potentialRequestCount: 1,
      currentRequest: [Item.BasicG],
      inventory: [],
      maxInventory: 1,
    },
    {
      type: EntityType.Dock,
      x: Math.floor((factorySize * 3) / 4),
      y: Math.floor(factorySize - 1),
      potentialRequest: [Item.BasicR, Item.BasicG, Item.BasicB],
      potentialRequestCount: 1,
      currentRequest: [Item.BasicB],
      inventory: [],
      maxInventory: 1,
    },
    {
      type: EntityType.Dock,
      x: 0,
      y: Math.floor(factorySize - 1),
      potentialRequest: [Item.ComplexR],
      potentialRequestCount: 1,
      currentRequest: [Item.ComplexR],
      inventory: [],
      maxInventory: 1,
    },
    {
      type: EntityType.Bot,
      x: Math.floor(factorySize / 2),
      y: Math.floor(factorySize / 2),
      inventory: [],
      energy: 16,
      name: "alice",
      maxInventory: 1,
    },
    {
      type: EntityType.Crafter,
      x: 2,
      y: 2,
      inventory: [],
      maxInventory: 3,
      recipe: {
        input: [Item.BasicR],
        output: [Item.ComplexR],
      },
    },
    {
      type: EntityType.Chest,
      inventory: [Item.BasicR],
      maxInventory: 3,
      x: Math.floor(factorySize / 2) + 1,
      y: Math.floor(factorySize / 2),
    },
  ],
};

export const factory: Factory = defaultFactory;

export const loadFactory = (save: string) => {
  if (!save) return;
  //   const savedFactory = JSON.parse(save);
  //   Object.assign(factory, savedFactory);
};

export const NewBot = (name: string, x: number, y: number) => {
  factory.entities.push({
    type: EntityType.Bot,
    x,
    y,
    inventory: [],
    energy: 16,
    name,
    maxInventory: 1,
  });
};
