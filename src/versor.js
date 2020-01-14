import {
  abs,
  acos,
  asin,
  atan2,
  degrees,
  hypot,
  radians,
  sqrt,
} from "./math.js";
import { Cos as cos, Sin as sin} from "./cos.js";
import { cartesian, spherical } from "./cartesian.js";

const versor_normalize = q => {
  const n = hypot(...q);
  return q.map(d => d / n);
};

// eq. (198) & (199)
// - axis as (lon, lat) in degrees
// - angle in degrees
// much more precision for small angles!
function versor_toAxisAngle(q) {
  const s = sqrt(
      abs(q[0]) < 0.5
        ? 1 - q[0] * q[0]
        : q[1] * q[1] + q[2] * q[2] + q[3] * q[3]
    ),
    a =
      abs(q[0]) < 0.5
        ? 2 * acos(q[0])
        : q[0] < 0
        ? 2 * Math.PI - 2 * asin(s)
        : 2 * asin(s);
  if (!s) return { axis: [0, 90], angle: 0 };
  const s1 = 1 / s;
  return {
    axis: spherical([q[3] * s1, -q[2] * s1, q[1] * s1]).map(d => d * degrees),
    angle: a * degrees
  };
}

// eq. (175)
// - axis as (lon, lat) in degrees
// - angle in degrees
function versor_fromAxisAngle(axis, angle) {
  const c = cos((angle / 2) * radians),
    s = sin((angle / 2) * radians),
    d = cartesian(axis.map(d => d * radians));
  return [c, d[2] * s, -d[1] * s, d[0] * s];
}

// Euler 123 eq (297)
function versor_fromEulerAngles([l, p, g]) {
  l *= radians / 2;
  p *= radians / 2;
  g = ((g || 0) * radians) / 2;
  const sl = sin(l),
    cl = cos(l),
    sp = sin(p),
    cp = cos(p),
    sg = sin(g),
    cg = cos(g);
  return [
    cl * cp * cg + sl * sp * sg,
    sl * cp * cg - cl * sp * sg,
    cl * sp * cg + sl * cp * sg,
    cl * cp * sg - sl * sp * cg
  ];
}

// eq (290)
function versor_toEulerAngles([q0, q1, q2, q3]) {
  return [
    atan2(2 * q2 * q3 + 2 * q0 * q1, q3 * q3 - q2 * q2 - q1 * q1 + q0 * q0),
    -asin(2 * q1 * q3 - 2 * q0 * q2),
    atan2(2 * q1 * q2 + 2 * q0 * q3, -q3 * q3 - q2 * q2 + q1 * q1 + q0 * q0)
  ].map(d => d * degrees);
}

// https://observablehq.com/@d3/world-tour
function versor_multiply([a1, b1, c1, d1], [a2, b2, c2, d2]) {
  return [
    a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2,
    a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2,
    a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2,
    a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2
  ];
}

export {
  versor_normalize,
  versor_multiply,
  versor_fromEulerAngles,
  versor_toEulerAngles,
  versor_fromAxisAngle,
  versor_toAxisAngle
};
