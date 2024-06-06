import { EntityType, Item } from "@nsdefs";
import { Factory } from "./Factory";

export const factorySize = 12;

const defaultFactory: Factory = {
  bits: 0,
  entities: [],
};

export const factory: Factory = defaultFactory;

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

export const NewChest = (name: string, x: number, y: number) => {
  factory.entities.push({
    name,
    type: EntityType.Chest,
    inventory: [],
    maxInventory: 1,
    x,
    y,
  });
};

export const NewCrafter = (name: string, x: number, y: number) => {
  factory.entities.push({
    name,
    type: EntityType.Crafter,
    x,
    y,
    inventory: [],
    maxInventory: 2,
    recipe: {
      input: [Item.BasicR, Item.BasicR],
      output: [Item.ComplexR],
    },
  });
};

export const NewDispenser = (name: string, x: number, y: number, dispensing: Item) => {
  factory.entities.push({
    name,
    type: EntityType.Dispenser,
    x,
    y,
    dispensing,
    cooldown: 10000,
    cooldownUntil: 0,
    inventory: [dispensing],
    maxInventory: 1,
  });
};

export const NewDock = (name: string, x: number, y: number) => {
  const potential = [Item.BasicR, Item.BasicG, Item.BasicB];
  factory.entities.push({
    name,
    type: EntityType.Dock,
    x,
    y,
    potentialRequest: [Item.BasicR, Item.BasicG, Item.BasicB],
    potentialRequestCount: 1,
    currentRequest: [potential[Math.floor(Math.random() * potential.length)]],
    inventory: [],
    maxInventory: 1,
  });
};

export const NewWall = (name: string, x: number, y: number) => {
  factory.entities.push({
    name,
    type: EntityType.Wall,
    x,
    y,
  });
};

export const loadFactory = (save: string) => {
  if (!save) return;
  //   const savedFactory = JSON.parse(save);
  //   Object.assign(factory, savedFactory);
};

export const resetFactory = () => {
  factory.bits = 0;
  factory.entities = [];
  Object.assign(factory, defaultFactory);
  NewBot("alice", Math.floor(factorySize / 2), Math.floor(factorySize / 2));
  NewDispenser("disp0", Math.floor(factorySize / 4), 0, Item.BasicR);
  NewDispenser("disp1", Math.floor(factorySize / 2), 0, Item.BasicG);
  NewDispenser("disp2", Math.floor((factorySize * 3) / 4), 0, Item.BasicB);

  NewDock("dock0", Math.floor(factorySize / 4), Math.floor(factorySize - 1));
  NewDock("dock1", Math.floor(factorySize / 2), Math.floor(factorySize - 1));
  NewDock("dock2", Math.floor((factorySize * 3) / 4), Math.floor(factorySize - 1));
  NewWall("wall0", 2, 2);
};

resetFactory();
