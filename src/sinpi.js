// https://observablehq.com/@fil/sinpi-cospi
import {asin, atan2, abs, cos, degrees, floor, pi, sign, sin, tan} from "./math.js";

// adapted from https://github.com/math-io/sinpi
export function sinpi(x) {
  if (!isFinite(x)) return NaN;
  const r = x % 2,
    s = sign(r),
    a = abs(r);
  return a == 0 || a == 1
    ? 0 * s
    : a < .25
    ? sin(pi * r)
    : a < .75
    ? cos(pi * (.5 - a)) * s
    : a < 1.25
    ? sin(pi * (s - r))
    : a < 1.75
    ? -s * cos(pi * (a - 1.5))
    : sin(pi * (r - 2 * s));
}


// adapted from https://github.com/math-io/cospi
export function cospi(x) {
  if (!isFinite(x)) return NaN;
  const a = abs(x),
    i = floor(a),
    r = a - i;
  if (r == .5) return 0;
  return (
    (i % 2 == 1 ? -1 : 1) *
    (r < .25 ? cos(pi * r) : r < .75 ? sin(pi * (.5 - r)) : -cos(pi * (1 - r)))
  );
}

export function tanpi(x) {
  // tan(a/2 + pi/4) = tan(a)+sec(a)
  const a = abs(x),
    s = sign(x);
  let i = a % 1;
  return i > .2
    ? ((sinpi(2 * (i -= .25)) + 1) / cospi(2 * i)) * s
    : tan(pi * i) * s;
}

export function cartesiand([l, p]) {
  const cp = cospi(p / 180);
  return [cp * cospi(l / 180), cp * sinpi(l / 180), sinpi(p / 180)];
}

export function sphericald([x, y, z]) {
  return [atan2(y, x) * degrees, asin(z) * degrees];
}

export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}
