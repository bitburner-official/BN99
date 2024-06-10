import { DeviceType, Component, Lock, Glitch } from "@nsdefs";
import { Myrian, findDevice, inMyrianBounds } from "./Myrian";
import { getNextISocketRequest } from "./formulas/formulas";
import { decodeBase64 } from "bcryptjs";
import { roamingTime } from "./formulas/glitches";

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
  rust: {},
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
  myrian.rust = {};

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

setInterval(() => {
  const segmentation = myrian.glitches[Glitch.Segmentation];
  for (let i = 0; i < segmentation; i++) {
    const x = Math.floor(Math.random() * myrianSize);
    const y = Math.floor(Math.random() * myrianSize);
    if (findDevice([x, y])) continue;
    NewLock(`lock-${x}-${y}`, x, y);
  }
}, 30000);

setInterval(() => {
  myrian.rust = {};
  const rust = myrian.glitches[Glitch.Rust];
  for (let i = 0; i < rust * 3; i++) {
    const x = Math.floor(Math.random() * myrianSize);
    const y = Math.floor(Math.random() * myrianSize);
    myrian.rust[`${x}:${y}`] = true;
  }
}, 30000);

const clamp = (min: number, v: number, max: number) => Math.min(Math.max(v, min), max);
let globalOffset = 0;
const dirDiff = (v: number): number => {
  globalOffset++;
  const r = Math.random();
  const d = v - (myrianSize - 1) / 2;
  const h = d > 0 ? -1 : 1;

  const dv = Math.floor(r * 3 + h * Math.random() * Math.sin(globalOffset * 0.05) * Math.abs(d)) - 1;
  return clamp(-1, dv, 1);
};

const isEmpty = (x: number, y: number) => {
  if (!inMyrianBounds(x, y)) return false;
  return !findDevice([x, y]);
};

const dirs = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

const applyRoaming = () => {
  const roaming = myrian.glitches[Glitch.Roaming];
  setTimeout(applyRoaming, roamingTime(roaming));
  if (roaming === 0) return;
  myrian.devices.forEach((device) => {
    if (device.type !== DeviceType.OSocket && device.type !== DeviceType.ISocket) return;
    if (device.isBusy) return;
    let canMove = false;
    for (const dir of dirs) {
      const [dx, dy] = dir;
      if (isEmpty(device.x + dx, device.y + dy)) {
        canMove = true;
        break;
      }
    }
    let x = -1;
    let y = -1;
    if (canMove) {
      let dx = dirDiff(device.x);
      let dy = dirDiff(device.y);

      if (dx !== 0 && dy !== 0) {
        if (Math.random() > 0.5) {
          dx = 0;
        } else {
          dy = 0;
        }
      }
      x = device.x + dx;
      y = device.y + dy;
    } else {
      x = Math.floor(Math.random() * myrianSize);
      y = Math.floor(Math.random() * myrianSize);
    }

    if (findDevice([x, y])) return;
    if (!inMyrianBounds(x, y)) return;
    device.x = x;
    device.y = y;
  });
};

setTimeout(applyRoaming, 0);

resetMyrian();
