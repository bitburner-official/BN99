import { DeviceType, Component, Lock, Glitch } from "@nsdefs";
import { Myrian } from "./Myrian";
import { getNextISocketRequest } from "./formulas/formulas";

export const myrianSize = 12;

const defaultGlitches = {
  [Glitch.Segmentation]: 0,
  [Glitch.Roaming]: 0,
  [Glitch.Encryption]: 0,
  [Glitch.Magnetism]: 0,
  [Glitch.Rust]: 0,
  [Glitch.Friction]: 0,
  [Glitch.Isolation]: 0,
  [Glitch.Jamming]: 0,
  [Glitch.Virtualization]: 0,
};

const defaultMyrian: Myrian = {
  vulns: 0,
  totalVulns: 0,
  devices: [],
  glitches: { ...defaultGlitches },
};

export const myrian: Myrian = defaultMyrian;

export const NewBus = (name: string, x: number, y: number) => {
  myrian.devices.push({
    name,
    type: DeviceType.Bus,
    isBusy: false,
    x,
    y,
    content: [],
    maxContent: 1,

    moveLvl: 0,
    transferLvl: 0,
    reduceLvl: 0,
    installLvl: 0,
    energy: 16,
    maxEnergy: 16,
  });
};

export const NewCache = (name: string, x: number, y: number) => {
  myrian.devices.push({
    name,
    type: DeviceType.Cache,
    isBusy: false,
    content: [],
    maxContent: 1,
    x,
    y,
  });
};

export const NewReducer = (name: string, x: number, y: number) => {
  myrian.devices.push({
    name,
    type: DeviceType.Reducer,
    isBusy: false,
    x,
    y,
    content: [],
    maxContent: 2,
    tier: 1,
  });
};

export const NewISocket = (name: string, x: number, y: number, dispensing: Component) => {
  myrian.devices.push({
    name,
    type: DeviceType.ISocket,
    isBusy: false,
    x,
    y,
    emitting: dispensing,
    emissionLvl: 0,
    cooldownUntil: 0,
    content: [dispensing],
    maxContent: 1,
  });
};

export const NewOSocket = (name: string, x: number, y: number) => {
  myrian.devices.push({
    name,
    type: DeviceType.OSocket,
    isBusy: false,
    tier: 0,
    x,
    y,
    currentRequest: getNextISocketRequest(0),
    content: [],
    maxContent: 1,
  });
};

export const NewLock = (name: string, x: number, y: number) => {
  const lock: Lock = {
    name,
    type: DeviceType.Lock,
    isBusy: false,
    x,
    y,
  };
  myrian.devices.push(lock);
  return lock;
};

export const NewBattery = (name: string, x: number, y: number) => {
  myrian.devices.push({
    name,
    type: DeviceType.Battery,
    isBusy: false,
    x,
    y,
    tier: 0,
    energy: 64,
    maxEnergy: 64,
  });
};

export const loadMyrian = (save: string) => {
  if (!save) return;
  //   const savedFactory = JSON.parse(save);
  //   Object.assign(factory, savedFactory);
};

export const resetMyrian = () => {
  myrian.vulns = 0;
  myrian.totalVulns = 0;
  myrian.devices = [];
  myrian.glitches = { ...defaultGlitches };

  Object.assign(myrian, defaultMyrian);

  NewBus("alice", Math.floor(myrianSize / 2), Math.floor(myrianSize / 2));

  NewISocket("isocket0", Math.floor(myrianSize / 4), 0, Component.R0);
  NewISocket("isocket1", Math.floor(myrianSize / 2), 0, Component.G0);
  NewISocket("isocket2", Math.floor((myrianSize * 3) / 4), 0, Component.B0);

  NewOSocket("osocket0", Math.floor(myrianSize / 4), Math.floor(myrianSize - 1));
  NewOSocket("osocket1", Math.floor(myrianSize / 2), Math.floor(myrianSize - 1));
  NewOSocket("osocket2", Math.floor((myrianSize * 3) / 4), Math.floor(myrianSize - 1));
};

setInterval(() => {
  myrian.devices.forEach((device) => {
    if (device.type !== DeviceType.Battery) return;
    const up = Math.pow(2, device.tier + 1);
    device.energy = Math.min(device.energy + up, device.maxEnergy);
  });
}, 1000);

resetMyrian();
