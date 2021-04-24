import {
  abs,
  acos,
  asin,
  atan2,
  degrees,
  hypot,
  pi,
  sqrt
} from "./math.js";
import { cospi, sinpi, cartesiand, sphericald } from "./sinpi.js";

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
        ? 2 * pi - 2 * asin(s)
        : 2 * asin(s);
  if (!s) return { axis: [0, 90], angle: 0 };
  const s1 = 1 / s;
  return {
    axis: sphericald([q[3] * s1, -q[2] * s1, q[1] * s1]),
    angle: a * degrees
  };
}

// eq. (175)
// - axis as (lon, lat) in degrees
// - angle in degrees
function versor_fromAxisAngle(axis, angle) {
  const c = cospi(angle / 360),
    s = sinpi(angle / 360),
    d = cartesiand(axis);
  return [c, d[2] * s, -d[1] * s, d[0] * s];
}

// Euler 123 eq (297)
function versor_fromEulerAngles([l, p, g]) {

  // fix south pole
  if (p + 90 < 1e-9) p = -90 + 1e-9;
  
  const sl = sinpi(l / 360),
    cl = cospi(l / 360),
    sp = sinpi(p / 360),
    cp = cospi(p / 360),
    sg = sinpi((g||0) / 360),
    cg = cospi((g||0) / 360);
  return [
    cl * cp * cg + sl * sp * sg,
    sl * cp * cg - cl * sp * sg,
    cl * sp * cg + sl * cp * sg,
    cl * cp * sg - sl * sp * cg
  ];
}

// eq (290)
function versor_toEulerAngles([q0, q1, q2, q3]) {
  const a = 2 * q2 * q3 + 2 * q0 * q1,
    b = q3 * q3 - q1 * q1 + q0 * q0 - q2 * q2,
    c = 2 * q1 * q3 - 2 * q0 * q2,
    d = 2 * q1 * q2 + 2 * q0 * q3,
    e = -q3 * q3 - q2 * q2 + q1 * q1 + q0 * q0,
    l = atan2(a, b),
    g = atan2(d, e);

  // fix north pole
  const eps = 1e-9;
  if (
    c < 0 &&
    ((abs(a) < eps && abs(b) < eps) || (abs(d) < eps && abs(e) < eps))
  ) {
    const app = versor_toEulerAngles([q0, q2, q1, q3]);
    return [app[1] / 2, app[0], -app[1] / 2];
  }

  return [l * degrees, -asin(c) * degrees, g * degrees];
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
