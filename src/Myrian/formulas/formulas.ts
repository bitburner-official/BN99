import { DeviceType } from "@nsdefs";
import { myrian } from "../Helper";
import { componentTiers } from "./components";

export type FactoryFormulaParams = [number, number, number, number];

export const maxContentScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [8, 0.5, 2, 0],
  [DeviceType.ISocket]: [4, 1, 5, 0],
  [DeviceType.OSocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Reducer]: [Infinity, 1, -1, 4095],
  [DeviceType.Cache]: [1.2, 10, 0, 63],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
};

// a^(b*X+c)+d
const exp = (p: FactoryFormulaParams, x: number): number => Math.pow(p[0], p[1] * x + p[2]) + p[3];

export const upgradeMaxContentCost = (type: DeviceType, currentMaxContent: number): number =>
  exp(maxContentScale[type], currentMaxContent);

export const busPrice = (currentBusses: number): number => Math.pow(2, currentBusses + 3);
export const moveSpeed = (level: number) => 1000 / (level + 9);
export const reduceSpeed = (level: number) => 50000 / (level + 9);
export const transferSpeed = (level: number) => 1000 / (level + 9);
export const installSpeed = (level: number) => 100000 / (level + 9);

const countDevices = (type: DeviceType) => myrian.devices.reduce((acc, d) => (d.type === type ? acc + 1 : acc), 0);

export const deviceScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [4, 0.5, 2, 0],
  [DeviceType.ISocket]: [2, 1, 4, 0],
  [DeviceType.OSocket]: [4, 1, 3, 0],
  [DeviceType.Reducer]: [1.5, 1, 2, 0],
  [DeviceType.Cache]: [1.2, 10, 0, 63],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
};

export const deviceCost = (type: DeviceType, count?: number) =>
  exp(deviceScale[type], count === undefined ? countDevices(type) : count);

export const getNextISocketRequest = (tier: number) => {
  const potential = componentTiers.slice(0, tier + 1).flat();
  return new Array(Math.floor(Math.pow(Math.random() * tier, 0.75) + 1))
    .fill(null)
    .map(() => potential[Math.floor(Math.random() * potential.length)]);
};

(() => {
  for (let i = 0; i < 10; i++) {
    console.log(getNextISocketRequest(0));
  }
})();

export const tierScale: Record<DeviceType, FactoryFormulaParams> = {
  [DeviceType.Bus]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.ISocket]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.OSocket]: [2, 1, 3, 0],
  [DeviceType.Reducer]: [1.5, 1, 2, 0],
  [DeviceType.Cache]: [Infinity, Infinity, Infinity, Infinity],
  [DeviceType.Lock]: [Infinity, Infinity, Infinity, Infinity],
};

export const tierCost = (type: DeviceType, tier: number) => exp(tierScale[type], tier);

/**
glitches:

- random walls (higher level more randomly spawning walls, level 0 is no walls)
- moving dock & dispensers (higher level move faster, level 0 does not move)
- dock complexity (higher level more complex, level 0 is repeating request)
- energy consumption (higher level consume more, level 0 is no consumption)
- ugrade degradation (higher level degrade faster, level 0 does not degrade)
- move hinderance (speed) (higher level slower, level 0 is no hinderance)
- connection hinderance (transfer / charge) (higher level slower, level 0 is immediate transfer speed and charge)
- allocation hinderance (craft & build) (higher level slower, level 0 is no hinderance)

special requests like "has red" that increases the reward
*/
