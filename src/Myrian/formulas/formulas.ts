import { DeviceType } from "@nsdefs";
import { myrian } from "../Helper";
import { componentTiers } from "./components";
import { pickOne } from "../utils";

type FactoryFormulaParams = [number, number, number, number];

const maxContentScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [8, 0.5, 2, 0],
  [DeviceType.ISocket]: [4, 1, 5, 0],
  [DeviceType.OSocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Reducer]: [Infinity, 1, -1, 4095],
  [DeviceType.Cache]: [1.2, 10, 0, 63],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Battery]: [Infinity, Infinity, Infinity, Infinity],
};

// a^(b*X+c)+d
const exp = (p: FactoryFormulaParams, x: number): number => Math.pow(p[0], p[1] * x + p[2]) + p[3];

export const upgradeMaxContentCost = (type: DeviceType, currentMaxContent: number): number =>
  exp(maxContentScale[type], currentMaxContent);

const countDevices = (type: DeviceType) => myrian.devices.reduce((acc, d) => (d.type === type ? acc + 1 : acc), 0);

const deviceScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [4, 0.5, 2, 0],
  [DeviceType.ISocket]: [2, 1, 4, 0],
  [DeviceType.OSocket]: [4, 1, 3, 0],
  [DeviceType.Reducer]: [1.5, 1, 2, 0],
  [DeviceType.Cache]: [1.2, 10, 0, 63],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Battery]: [1.2, 10, 0, 63],
};

export const deviceCost = (type: DeviceType, count?: number) =>
  exp(deviceScale[type], count === undefined ? countDevices(type) : count);

export const getNextISocketRequest = (tier: number) => {
  const potential = componentTiers.slice(0, tier + 1).flat();
  return new Array(Math.floor(Math.pow(Math.random() * tier, 0.75) + 1)).fill(null).map(() => pickOne(potential));
};

const tierScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.ISocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.OSocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Reducer]: [1.5, 1, 2, 0],
  [DeviceType.Cache]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Battery]: [2, 1, 3, 0],
};

export const tierCost = (type: DeviceType, tier: number) => exp(tierScale[type], tier);

const emissionScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.ISocket]: [2, 1, 3, 0],
  [DeviceType.OSocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Reducer]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Cache]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Battery]: [Infinity, Infinity, Infinity, Infinity],
};

export const emissionCost = (type: DeviceType, emissionLvl: number) => exp(emissionScale[type], emissionLvl);

const moveLvlScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [2, 1, 3, 0],
  [DeviceType.ISocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.OSocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Reducer]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Cache]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Battery]: [Infinity, Infinity, Infinity, Infinity],
};

export const moveLvlCost = (type: DeviceType, moveLvl: number) => exp(moveLvlScale[type], moveLvl);

const transferLvlScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [2, 1, 3, 0],
  [DeviceType.ISocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.OSocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Reducer]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Cache]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Battery]: [Infinity, Infinity, Infinity, Infinity],
};

export const transferLvlCost = (type: DeviceType, transferLvl: number) => exp(transferLvlScale[type], transferLvl);

const reduceLvlScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [2, 1, 3, 0],
  [DeviceType.ISocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.OSocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Reducer]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Cache]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Battery]: [Infinity, Infinity, Infinity, Infinity],
};

export const reduceLvlCost = (type: DeviceType, reduceLvl: number) => exp(reduceLvlScale[type], reduceLvl);

const installLvlScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [2, 1, 3, 0],
  [DeviceType.ISocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.OSocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Reducer]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Cache]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Battery]: [Infinity, Infinity, Infinity, Infinity],
};

export const installLvlCost = (type: DeviceType, installLvl: number) => exp(installLvlScale[type], installLvl);

const maxEnergyScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [2, 1, 3, 0],
  [DeviceType.ISocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.OSocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Reducer]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Cache]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Battery]: [1.1, 1, 3, 8],
};

export const maxEnergyCost = (type: DeviceType, maxEnergy: number) => exp(maxEnergyScale[type], maxEnergy);
