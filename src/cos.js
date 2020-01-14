// https://observablehq.com/@fil/exact-sin-cos
import {abs, cos, halfPi, sign, sin} from "./math.js";

export function Cos(x) {
  x = abs(x);
  return x > 1 && x < 2 ? sin(halfPi - x) : cos(x);
}

export function Sin(x) {
  const s = sign(x);
  x = abs(x);
  return (x > 3 && x < 4 ? Cos(halfPi - x) : sin(x)) * s;
}
