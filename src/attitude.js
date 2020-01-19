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
import {
  vectorEquidistant,
  vectorGnomonic,
  vectorStereographic
} from "./vector.js";
import { acos, degrees, radians, sqrt } from "./math.js";
import {
  cartesiand,
  sphericald,
  dot, cross
} from "./sinpi.js";

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

  function get_vector(f) {
    const n = f(angle * radians),
      v = cartesiand(axis);
    return v.map(d => d * n);
  }
  function set_vector(v, f_1) {
    const n = sqrt(dot(v, v));
    set_axis_angle(
      sphericald(v.map(d => d / n)),
      f_1(n) * degrees
    );
    return rotate;
  }

  rotate.axis = _ => (_ === undefined ? axis : set_axis_angle(_, angle));
  rotate.angle = _ => (_ === undefined ? angle : set_axis_angle(axis, +_));
  rotate.versor = _ => (_ === undefined ? q : set_versor(versor_normalize(_)));

  rotate.vectorGnomonic = _ =>
    _ === undefined
      ? get_vector(vectorGnomonic.forward)
      : set_vector(_, vectorGnomonic.inverse);
  rotate.vectorStereographic = _ =>
    _ === undefined
      ? get_vector(vectorStereographic.forward)
      : set_vector(_, vectorStereographic.inverse);
  rotate.vectorEquidistant = _ =>
    _ === undefined
      ? get_vector(vectorEquidistant.forward)
      : set_vector(_, vectorEquidistant.inverse);
  rotate.vector = rotate.vectorStereographic;

  rotate.matrix = _ =>
    _ === undefined
      ? matrix
      : set_versor(
          versor_normalize(
            versor_fromEulerAngles(RotationMatrix_toEulerAngles(_))
          )
        );

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
  const a = cartesiand(A),
    b = cartesiand(B);
  const alpha = acos(dot(a, b)), // angle
    w = cross(a, b), // axis direction
    n = sqrt(dot(w, w)); // axis norm
  return !n
    ? { angle: dot(a, b) > 0 ? 0 : 180 }
    : {
        axis: sphericald([w[0] / n, w[1] / n, w[2] / n]),
        angle: alpha * degrees
      };
}

function interpolateAttitude(a, b) {
  const c = b.compose(a.inverse());
  return t => (t === 1 ? b : !t ? a : c.power(t).compose(a));
}
