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
};

export const INNINGS_OPTIONS = [3, 5, 7];
export const OUTS_OPTIONS = [1, 2, 3];
