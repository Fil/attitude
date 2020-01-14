import { versor_normalize } from "./versor.js";
import { cartesian, spherical } from "./cartesian.js";
import { asin, atan2, degrees, radians, sqrt } from "./math.js";
import { Cos as cos, Sin as sin} from "./cos.js";

function transpose([[r11, r12, r13], [r21, r22, r23], [r31, r32, r33]]) {
  return [[r11, r21, r31], [r12, r22, r32], [r13, r23, r33]];
}

// eq. (145)
function versor_fromRotationMatrix(r) {
  const [a1, a2, a3] = [r[0][0], r[1][1], r[2][2]];

  // R0
  if (a2 >= -a3 && a1 >= -a2 && a1 >= -a3) {
    const n = N(a1, a2, a3);
    return [
      n / 2,
      (r[1][2] - r[2][1]) / n / 2,
      (r[2][0] - r[0][2]) / n / 2,
      (r[0][1] - r[1][0]) / n / 2
    ];
  }
  // R1
  if (a2 <= -a3 && a1 >= a2 && a1 >= a3) {
    const n = N(a1, -a2, -a3);
    return [
      (r[1][2] - r[2][1]) / n / 2,
      n / 2,
      (r[0][1] + r[1][0]) / n / 2,
      (r[2][0] + r[0][2]) / n / 2
    ];
  }
  // R2
  if (a2 >= a3 && a1 <= a2 && a1 <= -a3) {
    const n = N(-a1, a2, -a3);
    return [
      (r[2][0] - r[0][2]) / n / 2,
      (r[0][1] + r[1][0]) / n / 2,
      n / 2,
      (r[1][2] + r[2][1]) / n / 2
    ];
  }
  // R3
  /*if (a2 <= a3 && a1 <= -a2 && a1 <= a3)*/ {
    const n = N(-a1, -a2, a3);
    return [
      (r[0][1] - r[1][0]) / n / 2,
      (r[2][0] + r[0][2]) / n / 2,
      (r[1][2] + r[2][1]) / n / 2,
      n / 2
    ];
  }

  function N(a1, a2, a3) {
    return sqrt(1 + a1 + a2 + a3);
  }
}

// eq. (125)
function versor_toRotationMatrix([a, b, c, d]) {
  const [q0, q1, q2, q3] = versor_normalize([a, d, -c, b]),
    q02 = q0 * q0,
    q12 = q1 * q1,
    q22 = q2 * q2,
    q32 = q3 * q3;
  return [
    [
      q02 + q12 - q22 - q32,
      2 * q1 * q2 + 2 * q0 * q3,
      2 * q1 * q3 - 2 * q0 * q2
    ],
    [
      2 * q1 * q2 - 2 * q0 * q3,
      q02 - q12 + q22 - q32,
      2 * q2 * q3 + 2 * q0 * q1
    ],
    [
      2 * q1 * q3 + 2 * q0 * q2,
      2 * q2 * q3 - 2 * q0 * q1,
      q02 - q12 - q22 + q32
    ]
  ];
}

// eq. (5) (we use z = R^T(z’))
function MatrixRotatePoint(
  [[r11, r12, r13], [r21, r22, r23], [r31, r32, r33]],
  point
) {
  function rotator(point) {
    const [x, y, z] = cartesian(point.map(d => d * radians));
    const product = [
      r11 * x + r21 * y + r31 * z,
      r12 * x + r22 * y + r32 * z,
      r13 * x + r23 * y + r33 * z
    ];
    return spherical(product).map(d => d * degrees);
  }
  return point ? rotator(point) : rotator;
}

// eq (289)
function RotationMatrix_toEulerAngles([
  [r11 /* r12 */ /* r13 */, ,],
  [r21 /* r22 */ /* r23 */, ,],
  [r31, r32, r33]
]) {
  const [f, t, p] = [atan2(r32, r33), -asin(r31), atan2(r21, r11)],
    [lambda, phi, gamma] = [-p * degrees, t * degrees, -f * degrees];

  return [lambda, phi, gamma];
}

// eq (184)
// changes for precision by fil@rezo.net
function RotationMatrix_fromAxisAngle(axis, angle) {
  const [n1, n2, n3] = cartesian(axis.map(d => d * radians)),
    [n12, n22, n32] = [n1 * n1, n2 * n2, n3 * n3],
    c = cos(angle * radians),
    s2 = (1 - c) / 2, // cos(a/2)^2
    c2 = (1 + c) / 2, // sin(a/2)^2
    sc = sin(angle * radians) / 2; // sin(a/2)cos(a/2)

  return [
    [
      (n12 - n32 - n22) * s2 + c2,
      2 * n1 * n2 * s2 + 2 * n3 * sc,
      2 * n1 * n3 * s2 - 2 * n2 * sc
    ],
    [
      2 * n1 * n2 * s2 - 2 * n3 * sc,
      (n22 - n32 - n12) * s2 + c2,
      2 * n2 * n3 * s2 + 2 * n1 * sc
    ],
    [
      2 * n1 * n3 * s2 + 2 * n2 * sc,
      2 * n2 * n3 * s2 - 2 * n1 * sc,
      (n32 - n22 - n12) * s2 + c2
    ]
  ];
}

// eq (287)
// * the angles are given in the order of the rotation axis: top, left, front.
// * we use the transpose matrix - eq (5).
function RotationMatrix_fromEulerAngles([lambda, phi, gamma]) {
  const [f, t, p] = [-gamma * radians, phi * radians, -lambda * radians];
  const cf = cos(f),
    sf = sin(f),
    ct = cos(t),
    st = sin(t),
    cp = cos(p),
    sp = sin(p);
  return [
    [ct * cp, sf * st * cp - cf * sp, cf * st * cp + sf * sp],
    [ct * sp, sf * st * sp + cf * cp, cf * st * sp - sf * cp],
    [-st, ct * sf, ct * cf]
  ];
}

export {
  transpose,
  RotationMatrix_fromAxisAngle,
  RotationMatrix_fromEulerAngles,
  RotationMatrix_toEulerAngles,
  MatrixRotatePoint,
  versor_toRotationMatrix,
  versor_fromRotationMatrix
};
