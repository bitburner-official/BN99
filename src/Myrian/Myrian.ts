import {
  Bus,
  Device,
  DeviceType,
  ContainerDevice,
  Component,
  ISocket,
  OSocket,
  Reducer,
  Cache,
  Lock,
  BaseDevice,
  DeviceID,
} from "@nsdefs";
import { myrian, myrianSize } from "./Helper";

export interface Myrian {
  vulns: number;
  totalVulns: number;
  devices: Device[];
}

export const distance = (a: Device, b: Device) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export const distanceCoord2D = (a: Device, coord: [number, number]) =>
  Math.abs(a.x - coord[0]) + Math.abs(a.y - coord[1]);

export const adjacent = (a: Device, b: Device) => distance(a, b) === 1;
export const adjacentCoord2D = (a: Device, coord: [number, number]) => distanceCoord2D(a, coord) === 1;

export const inventoryMatches = (a: Component[], b: Component[]) => {
  if (a.length != b.length) return false;
  return a.every((i) => b.includes(i));
};

export const inMyrianBounds = (x: number, y: number) => x >= 0 && x < myrianSize && y >= 0 && y < myrianSize;

export const vulnsMap: Record<Component, number> = {
  // tier 0
  [Component.R0]: 1,
  [Component.G0]: 1,
  [Component.B0]: 1,

  // tier 1
  [Component.R1]: 4,
  [Component.G1]: 4,
  [Component.B1]: 4,

  [Component.Y1]: 4,
  [Component.C1]: 4,
  [Component.M1]: 4,

  // tier 2
  [Component.R2]: 16,
  [Component.G2]: 16,
  [Component.B2]: 16,

  [Component.Y2]: 16,
  [Component.C2]: 16,
  [Component.M2]: 16,

  [Component.W2]: 16,

  // tier 3
  [Component.R3]: 64,
  [Component.G3]: 64,
  [Component.B3]: 64,

  [Component.Y3]: 64,
  [Component.C3]: 64,
  [Component.M3]: 64,

  [Component.W3]: 64,

  // tier 4
  [Component.R4]: 256,
  [Component.G4]: 256,
  [Component.B4]: 256,

  [Component.Y4]: 256,
  [Component.C4]: 256,
  [Component.M4]: 256,

  [Component.W4]: 256,

  // tier 5
  [Component.R5]: 1024,
  [Component.G5]: 1024,
  [Component.B5]: 1024,

  [Component.Y5]: 1024,
  [Component.C5]: 1024,
  [Component.M5]: 1024,

  [Component.W5]: 1024,

  // tier 6
  [Component.Y6]: 4096,
  [Component.C6]: 4096,
  [Component.M6]: 4096,

  [Component.W6]: 4096,

  // tier 7
  [Component.W7]: 16384,
};

export const isDeviceContainer = (device: BaseDevice): device is ContainerDevice => "inventory" in device;

export const isDeviceBus = (d: Device): d is Bus => d.type === DeviceType.Bus;
export const isDeviceISocket = (d: Device): d is ISocket => d.type === DeviceType.ISocket;
export const isDeviceOSocket = (d: Device): d is OSocket => d.type === DeviceType.OSocket;
export const isDeviceReducer = (d: Device): d is Reducer => d.type === DeviceType.Reducer;
export const isDeviceCache = (d: Device): d is Cache => d.type === DeviceType.Cache;
export const isDeviceLock = (d: Device): d is Lock => d.type === DeviceType.Lock;

export const findDevice = (id: DeviceID, type?: DeviceType): Device | undefined =>
  myrian.devices.find(
    (e) => (typeof id === "string" ? e.name === id : e.x === id[0] && e.y === id[1]) && (!type || type === e.type),
  );

export const removeDevice = (id: DeviceID, type?: DeviceType) => {
  myrian.devices = myrian.devices.filter(
    (e) => !((typeof id === "string" ? e.name === id : e.x === id[0] && e.y === id[1]) && (!type || type === e.type)),
  );
};
