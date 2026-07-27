export const OUTCOMES = [
  "Single",
  "Double",
  "Triple",
  "HomeRun",
  "Walk",
  "Strikeout",
  "Groundout",
  "Flyout",
  "FoulOut",
];

export const OUTCOME_LABELS = {
  Single: "Single",
  Double: "Double",
  Triple: "Triple",
  HomeRun: "Home Run",
  Walk: "Walk",
  Strikeout: "Strikeout",
  Groundout: "Groundout",
  Flyout: "Flyout",
  FoulOut: "Foul Out",
};

export const OUT_OUTCOMES = new Set([
  "Strikeout",
  "Groundout",
  "Flyout",
  "FoulOut",
]);

export const HIT_OUTCOMES = new Set(["Single", "Double", "Triple", "HomeRun"]);

export const DEFAULT_RULES = {
  innings: 5, // 3 | 5 | 7
  outsPerInning: 3,
  baseRunning: "traditional", // 'traditional' | 'zone'
  walksEnabled: true,
  pitchesUntilOut: 5, // used instead of a walk when walksEnabled is false
  ghostRunners: true, // let the scorekeeper drop a placeholder runner on base
};

export const INNINGS_OPTIONS = [3, 5, 7];
export const OUTS_OPTIONS = [1, 2, 3];
export const PITCHES_OPTIONS = [3, 4, 5, 6, 7, 8];

export const GHOST_RUNNER = "ghost";
