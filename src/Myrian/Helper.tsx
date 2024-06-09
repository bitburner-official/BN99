import { DeviceType, Component, Lock } from "@nsdefs";
import { Myrian } from "./Myrian";
import { getNextISocketRequest } from "./formulas/formulas";

export const myrianSize = 12;

const defaultMyrian: Myrian = {
  vulns: 0,
  totalVulns: 0,
  devices: [],
};

export const myrian: Myrian = defaultMyrian;

export const NewBus = (name: string, x: number, y: number) => {
  myrian.devices.push({
    name,
    type: DeviceType.Bus,
    busy: false,
    x,
    y,
    content: [],
    maxContent: 1,

    moveLvl: 1,
    transferLvl: 1,
    reduceLvl: 1,
    installLvl: 1,
    // energy: 16,
  });
};

export const NewCache = (name: string, x: number, y: number) => {
  myrian.devices.push({
    name,
    type: DeviceType.Cache,
    busy: false,
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
    busy: false,
    x,
    y,
    content: [],
    maxContent: 2,
    tier: 0,
  });
};

export const NewISocket = (name: string, x: number, y: number, dispensing: Component) => {
  myrian.devices.push({
    name,
    type: DeviceType.ISocket,
    busy: false,
    x,
    y,
    emitting: dispensing,
    cooldown: 10000,
    cooldownUntil: 0,
    content: [dispensing],
    maxContent: 1,
  });
};

export const NewOSocket = (name: string, x: number, y: number) => {
  myrian.devices.push({
    name,
    type: DeviceType.OSocket,
    busy: false,
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
    busy: false,
    x,
    y,
  };
  myrian.devices.push(lock);
  return lock;
};

export const loadMyrian = (save: string) => {
  if (!save) return;
  //   const savedFactory = JSON.parse(save);
  //   Object.assign(factory, savedFactory);
};

export const resetMyrian = () => {
  myrian.vulns = 0;
  myrian.devices = [];
  Object.assign(myrian, defaultMyrian);
  NewBus("alice", Math.floor(myrianSize / 2), Math.floor(myrianSize / 2));
  NewISocket("disp0", Math.floor(myrianSize / 4), 0, Component.R0);
  NewISocket("disp1", Math.floor(myrianSize / 2), 0, Component.Y1);
  NewISocket("disp2", Math.floor((myrianSize * 3) / 4), 0, Component.B0);

  NewOSocket("dock0", Math.floor(myrianSize / 4), Math.floor(myrianSize - 1));
  NewOSocket("dock1", Math.floor(myrianSize / 2), Math.floor(myrianSize - 1));
  NewOSocket("dock2", Math.floor((myrianSize * 3) / 4), Math.floor(myrianSize - 1));
};

resetMyrian();
