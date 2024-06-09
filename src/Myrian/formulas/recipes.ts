import { Component, Recipe } from "@nsdefs";

export const Tier1Recipes: Recipe[] = [
  {
    input: [Component.R0, Component.R0],
    output: Component.R1,
  },
  {
    input: [Component.G0, Component.G0],
    output: Component.G1,
  },
  {
    input: [Component.B0, Component.B0],
    output: Component.B1,
  },

  {
    input: [Component.R0, Component.G0],
    output: Component.Y1,
  },
  {
    input: [Component.G0, Component.B0],
    output: Component.C1,
  },
  {
    input: [Component.B0, Component.R0],
    output: Component.M1,
  },
];

export const Tier2Recipes: Recipe[] = [
  // primary
  {
    input: [Component.R1, Component.R1],
    output: Component.R2,
  },
  {
    input: [Component.G1, Component.G1],
    output: Component.G2,
  },
  {
    input: [Component.B1, Component.B1],
    output: Component.B2,
  },

  // secondary
  {
    input: [Component.R1, Component.G1],
    output: Component.Y2,
  },
  {
    input: [Component.G1, Component.B1],
    output: Component.C2,
  },
  {
    input: [Component.B1, Component.R1],
    output: Component.M2,
  },

  // white
  {
    input: [Component.Y1, Component.C1, Component.M1],
    output: Component.W2,
  },
];

export const Tier3Recipes: Recipe[] = [
  // primary
  {
    input: [Component.R2, Component.R2],
    output: Component.R3,
  },
  {
    input: [Component.G2, Component.G2],
    output: Component.G3,
  },
  {
    input: [Component.B2, Component.B2],
    output: Component.B3,
  },

  // secondary
  {
    input: [Component.R2, Component.G2],
    output: Component.Y3,
  },
  {
    input: [Component.G2, Component.B2],
    output: Component.C3,
  },
  {
    input: [Component.B2, Component.R2],
    output: Component.M3,
  },

  // white
  {
    input: [Component.Y2, Component.C2, Component.M2],
    output: Component.W3,
  },
];

export const Tier4Recipes: Recipe[] = [
  // primary
  {
    input: [Component.R3, Component.R3],
    output: Component.R4,
  },
  {
    input: [Component.G3, Component.G3],
    output: Component.G4,
  },
  {
    input: [Component.B3, Component.B3],
    output: Component.B4,
  },

  // secondary
  {
    input: [Component.R3, Component.G3],
    output: Component.Y4,
  },
  {
    input: [Component.G3, Component.B3],
    output: Component.C4,
  },
  {
    input: [Component.B3, Component.R3],
    output: Component.M4,
  },

  // white
  {
    input: [Component.Y3, Component.C3, Component.M3],
    output: Component.W4,
  },
];

export const Tier5Recipes: Recipe[] = [
  // primary
  {
    input: [Component.R4, Component.R4],
    output: Component.R5,
  },
  {
    input: [Component.G4, Component.G4],
    output: Component.G5,
  },
  {
    input: [Component.B4, Component.B4],
    output: Component.B5,
  },

  // secondary
  {
    input: [Component.R4, Component.G4],
    output: Component.Y5,
  },
  {
    input: [Component.G4, Component.B4],
    output: Component.C5,
  },
  {
    input: [Component.B4, Component.R4],
    output: Component.M5,
  },

  // white
  {
    input: [Component.Y4, Component.C4, Component.M4],
    output: Component.W5,
  },
];

export const Tier6Recipes: Recipe[] = [
  // secondary
  {
    input: [Component.R5, Component.G5],
    output: Component.Y6,
  },
  {
    input: [Component.G5, Component.B5],
    output: Component.C6,
  },
  {
    input: [Component.B5, Component.R5],
    output: Component.M6,
  },

  // white
  {
    input: [Component.Y5, Component.C5, Component.M5],
    output: Component.W6,
  },
];

export const Tier7Recipes: Recipe[] = [
  // white
  {
    input: [Component.Y6, Component.C6, Component.M6],
    output: Component.W7,
  },
];

export const recipes: Recipe[][] = [
  [],
  Tier1Recipes,
  Tier2Recipes,
  Tier3Recipes,
  Tier4Recipes,
  Tier5Recipes,
  Tier6Recipes,
  Tier7Recipes,
];
