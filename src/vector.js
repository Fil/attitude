import { atan, tan } from "./math.js";

export const vectorEquidistant = {
  forward: a => a,
  inverse: a => a
};

export const vectorStereographic = {
  forward: a => tan(a / 4),
  inverse: a => 4 * atan(a)
};

export const vectorGnomonic = {
  forward: a => tan(a / 2),
  inverse: a => 2 * atan(a)
};
