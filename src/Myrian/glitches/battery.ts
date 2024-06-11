import { DeviceType } from "@nsdefs";
import { myrian } from "../Myrian";

const applyBattery = () => {
  myrian.devices.forEach((device) => {
    if (device.type !== DeviceType.Battery) return;
    const up = Math.pow(2, device.tier + 1);
    device.energy = Math.min(device.energy + up, device.maxEnergy);
  });
};

export const startBattery = () => setInterval(applyBattery, 1000);
