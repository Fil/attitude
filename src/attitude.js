import {
  MatrixRotatePoint,
  RotationMatrix_fromAxisAngle,
  RotationMatrix_toEulerAngles,
  transpose
} from "./matrix.js";
import {
  versor_normalize,
  versor_multiply,
  versor_fromAxisAngle,
  versor_toAxisAngle,
  versor_fromEulerAngles,
  versor_toEulerAngles
} from "./versor.js";
import { acos, degrees, radians, sqrt } from "./math.js";
import {
  cartesian,
  spherical,
  cartesianDot as dot,
  cartesianCross as cross
} from "./cartesian.js";

export default function attitude(init = {}) {
  let axis, angle, q, matrix;

  function rotate(point) {
    return point === undefined ? rotate : MatrixRotatePoint(matrix, point);
  }

  function set_axis_angle(x, a) {
    axis = x;
    angle = a;
    q = versor_fromAxisAngle(axis, angle);
    matrix = RotationMatrix_fromAxisAngle(axis, angle);
    return rotate;
  }

  function set_versor(p) {
    const a = versor_toAxisAngle((q = p));
    matrix = RotationMatrix_fromAxisAngle((axis = a.axis), (angle = a.angle));
    return rotate;
  }

  function get_vector() {
    const n = angle * radians,
      v = cartesian(axis.map(d => d * radians));
    return v.map(d => d * n);
  }
  function set_vector(v) {
    const n = sqrt(dot(v, v));
    set_axis_angle(
      spherical(v.map(d => d / n)).map(d => d * degrees),
      n * degrees
    );
    return rotate;
  }

  rotate.axis = _ => (_ === undefined ? axis : set_axis_angle(_, angle));
  rotate.angle = _ => (_ === undefined ? angle : set_axis_angle(axis, +_));
  rotate.versor = _ => (_ === undefined ? q : set_versor(versor_normalize(_)));
  rotate.vector = _ => (_ === undefined ? get_vector() : set_vector(_));

  rotate.matrix = _ =>
    _ === undefined
      ? matrix
      : set_versor(
          versor_normalize(
            versor_fromEulerAngles(RotationMatrix_toEulerAngles(_))
          )
        );

  rotate.rotate = _ =>
    _ === undefined ? versor_toEulerAngles(q) : MatrixRotatePoint(matrix, _);

  rotate.angles = _ =>
    _ === undefined
      ? versor_toEulerAngles(q)
      : set_versor(versor_fromEulerAngles(_));

  rotate.invert = point => MatrixRotatePoint(transpose(matrix), point);

  // returns a new attitude with inverse parameters
  rotate.inverse = () => attitude({ axis, angle: -angle });

  // returns a new product attitude
  rotate.compose = _ => attitude().versor(versor_multiply(q, _.versor()));

  // returns a new power attitude
  rotate.power = _ => attitude({ axis, angle: angle * +_ });

  // returns a new attitude that rotates along the arc of great circle (A,B)
  rotate.arc = (A, B) => attitude(arc(A, B));

  // returns an interpolator between two attitudes
  rotate.interpolateTo = b => interpolateAttitude(rotate, b);

  // accept d3.geoRotation's init with Euler Angles
  if (init.length >= 2) {
    rotate.angles(init);
  } else {
    set_axis_angle(
      (axis = init.axis || [0, 90]),
      (angle = init.angle === undefined ? 360 : +init.angle)
    );
  }

  return rotate;
}

// arc(A, B) returns an axis-angle that rotates A to B along a great circle (shortest path)
function arc(A, B) {
  const a = cartesian(A.map(d => d * radians)),
    b = cartesian(B.map(d => d * radians));
  const alpha = acos(dot(a, b)), // angle
    w = cross(a, b), // axis direction
    n = sqrt(dot(w, w)); // axis norm
  return !n
    ? { angle: dot(a, b) > 0 ? 0 : 180 }
    : {
        axis: spherical([w[0] / n, w[1] / n, w[2] / n]).map(d => d * degrees),
        angle: alpha * degrees
      };
}

function interpolateAttitude(a, b) {
  const c = b.compose(a.inverse());
  return t => (t === 1 ? b : !t ? a : c.power(t).compose(a));
}
