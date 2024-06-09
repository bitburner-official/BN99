import { Glitch } from "@nsdefs";

export const glitchMaxLvl: Record<Glitch, number> = {
  [Glitch.Segmentation]: 10,
  [Glitch.Roaming]: 10,
  [Glitch.Encryption]: 7,
  [Glitch.Magnetism]: 10,
  [Glitch.Rust]: 10,
  [Glitch.Friction]: 3,
  [Glitch.Isolation]: 3,
  [Glitch.Virtualization]: 3,
  [Glitch.Jamming]: 3,
};

export const giltchMultCoefficients: Record<Glitch, number> = {
  [Glitch.Segmentation]: 1,
  [Glitch.Roaming]: 0, // 1,
  [Glitch.Encryption]: 0, // 0.1,
  [Glitch.Magnetism]: 0.2,
  [Glitch.Rust]: 1,
  [Glitch.Friction]: 0.2,
  [Glitch.Isolation]: 0.2,
  [Glitch.Virtualization]: 0.2,
  [Glitch.Jamming]: 0.2,
};

export const glitchMult = (glitch: Glitch, lvl: number) => 1 + lvl * giltchMultCoefficients[glitch];

// move hinderance
export const frictionMult = (lvl: number) => Math.pow(1.25, lvl);

// transfer slow down
export const isolationMult = (lvl: number) => Math.pow(2, lvl);

// install/uninstall slow down
export const virtualizationMult = (lvl: number) => Math.pow(3, lvl);

// reduce slow down
export const jammingMult = (lvl: number) => Math.pow(1.3, lvl);

// energy loss
export const magnetismLoss = (lvl: number) => lvl;
