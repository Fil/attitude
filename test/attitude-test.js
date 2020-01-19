import * as d3 from "d3-geo";
import { cos, pi, sin } from "../src/math.js";
import {
  versor_fromEulerAngles,
  versor_toEulerAngles,
  versor_fromAxisAngle,
  versor_toAxisAngle
} from "../src/versor.js";
import {
  MatrixRotatePoint,
  RotationMatrix_fromAxisAngle,
  RotationMatrix_toEulerAngles,
  RotationMatrix_fromEulerAngles
} from "../src/matrix.js";

const tape = require("tape"),
  versor = require("versor"),
  attitude = require("../");

require("./inDelta");

const J2000 = [
    [-0.054876, -0.873437, -0.483835],
    [0.494109, -0.44483, 0.746982],
    [-0.867666, -0.198076, 0.455984]
  ],
  j2000_e = [-96.33732813865191, 60.188536093292406, 23.47976178196561],
  j2000_ei = [93.59503429185153, 28.93617294218035, -58.59864545109253];

tape("attitude.angle", t => {
  t.inDelta(attitude().angle(10)([0, 0]), [10, 0]);
  t.end();
});

tape("J2000 gives j2000_e", t => {
  t.deepEqual(
    attitude()
      .matrix(J2000)
      .angles()
      .map(Math.round),
    j2000_e.map(Math.round)
  );
  t.deepEqual(
    attitude()
      .matrix(J2000)
      .inverse()
      .angles()
      .map(Math.round),
    j2000_ei.map(Math.round)
  );
  t.end();
});

tape("attitude.angle preserves the axis", t => {
  t.deepEqual(
    attitude()
      .angle(90)
      .axis(),
    [0, 90]
  );
  t.equal(
    attitude()
      .angle(90)
      .angle(),
    90
  );
  t.deepEqual(
    attitude()
      .axis([10, 12])
      .angle(0)
      .angle(10)
      .axis(),
    [10, 12]
  );
  t.end();
});

tape("attitude.angles()", t => {
  t.inDelta(
    attitude()
      .versor(versor_fromEulerAngles([100, 2, 1]))
      .angles(),
    [100, 2, 1]
  );
  const a = attitude().angle(100);
  t.inDelta(a.angles(), [100, 0, 0]);
  t.end();
});

tape("power(t)", t => {
  const i = attitude().angle(360);
  t.inDelta(
    [0, 0.2, 0.4, 0.6, 0.8, 1].map(t => [
      i.power(t).angle(),
      i.power(t)([0, 0])
    ]),
    [
      [0, [0, 0]],
      [72, [72, 0]],
      [144, [144, 0]],
      [216, [-144, 0]],
      [288, [-72, 0]],
      [360, [0, 0]]
    ]
  );
  t.end();
});

tape("interpolateAttitude(t)", t => {
  const i = attitude()
    .angle(0)
    .interpolateTo(attitude().angle(90));
  t.inDelta(
    [0, 0.2, 0.4, 0.6, 0.8, 1, 2.1, 4].map(t => i(t)([0, 0])),
    [[0, 0], [18, 0], [36, 0], [54, 0], [72, 0], [90, 0], [-171, 0], [0, 0]],
    1e-5
  );
  t.end();
});

tape("various tests", t => {
  t.inDelta(
    attitude()
      .angle(100)
      .angles(),
    [100, 0, 0]
  );

  t.inDelta(
    attitude()
      .angle(36)
      .power(1 / 10)
      .angle(),
    3.6
  );

  t.inDelta(
    attitude()
      .angle(36)
      .power(10)
      .power(1 / 10)
      .angle(),
    36
  );

  t.inDelta(
    RotationMatrix_toEulerAngles(RotationMatrix_fromEulerAngles([0, 2, 4])),
    [0, 2, 4]
  );

  t.inDelta(versor([0, 90, 0]), [0.7071067811865476, 0, 0.7071067811865475, 0]);

  t.inDelta(versor([0, 0, 90]), [0.7071067811865476, 0, 0, 0.7071067811865475]);

  t.inDelta(
    attitude()
      .angles([90, 0, 0])
      .versor(),
    [0.7071067811865476, 0.7071067811865475, 0, 0]
  );

  t.inDelta(
    attitude()
      .angle(10)
      .axis([10, 45])
      .matrix(),
    [
      [0.9921748253560523, 0.12408681759202372, -0.01384115708930948],
      [-0.12148879034592194, 0.9850368041622599, 0.12224143432603561],
      [0.02880259970856334, -0.11960332832193964, 0.9924038765061041]
    ]
  );

  // doesn't change z
  t.inDelta(RotationMatrix_fromEulerAngles([1, 0, 0])[2][2], 1);

  // doesn't change y
  t.inDelta(RotationMatrix_fromEulerAngles([0, 1, 0])[1][1], 1);

  // doesn't change x
  t.inDelta(RotationMatrix_fromEulerAngles([0, 0, 1])[0][0], 1);

  t.inDelta(
    attitude()
      .versor(versor([1, 2, 3]))
      .matrix(),
    [
      [0.9992386149554827, 0.015602268173062631, 0.0357597484569552],
      [-0.017441774902830165, 0.9985093154342034, 0.051719739745651486],
      [-0.03489949670250098, -0.052304074592470856, 0.9980211966240685]
    ]
  );

  t.inDelta(
    attitude()
      .versor(
        attitude()
          .angle(0)
          .compose(attitude().angle(1))
          .versor()
      )
      .axis(),
    [0, 90]
  );

  t.inDelta(versor_toEulerAngles(versor([0, 0, 1])), [0, 0, 1]);

  t.end();
});

tape("versor from Euler angles", t => {
  t.inDelta(versor_fromEulerAngles([2, 0, 0]), [0.9998477, 0.0174524, 0, 0]);
  t.end();
});

tape("versor_toAxisAngle", t => {
  t.equal(
    versor_toAxisAngle(versor_fromEulerAngles([1e-6, 0, 0])).angle,
    0.000001
  );
  t.end();
});

tape("Euler angles from RM", t => {
  t.deepEqual(RotationMatrix_toEulerAngles(J2000).map(Math.round), [
    -96,
    60,
    23
  ]);
  t.deepEqual(
    RotationMatrix_toEulerAngles(
      RotationMatrix_fromEulerAngles(
        RotationMatrix_toEulerAngles(
          RotationMatrix_fromEulerAngles(RotationMatrix_toEulerAngles(J2000))
        )
      )
    ).map(Math.round),
    [-96, 60, 23]
  );
  t.end();
});

tape("versor from axis,angle", t => {
  t.inDelta(versor_fromAxisAngle([0, 90], 90), versor([90, 0, 0]));
  t.inDelta(versor_fromAxisAngle([0, 0], 90), versor([0, 0, 90]));
  t.inDelta(versor_fromAxisAngle([-90, 0], 90), versor([0, 90, 0]));
  t.inDelta(versor_fromAxisAngle([0, 90], 10), versor([10, 0, 0]));
  t.inDelta(
    attitude()
      .axis([0, 90])
      .angle(10)([0, 0]),
    [10, 0]
  );
  t.inDelta(
    attitude()
      .versor(versor_fromAxisAngle([0, 90], 10))([0, 0]),
    [10, 0]
  );
  t.end();
});

tape(
  "RotationMatrix_toEulerAngles inverses RotationMatrix_fromEulerAngles",
  t => {
    t.deepEqual(
      RotationMatrix_toEulerAngles(
        RotationMatrix_fromEulerAngles([1, 2, 3])
      ).map(Math.round),
      [1, 2, 3]
    );
    t.end();
  }
);

tape("same versors as Mike's versor", t => {
  t.inDelta(
    versor([90, 0, 0]),
    attitude()
      .angles([90, 0, 0])
      .versor()
  );
  t.inDelta(
    versor([0, 90, 0]),
    attitude()
      .angles([0, 90, 0])
      .versor()
  );
  t.inDelta(
    versor([0, 0, 90]),
    attitude()
      .angles([0, 0, 90])
      .versor()
  );
  t.end();
});

tape(
  "RotationMatrix_toEulerAngles inverses RotationMatrix_fromEulerAngles",
  t => {
    t.deepEqual(
      RotationMatrix_toEulerAngles(
        RotationMatrix_fromEulerAngles([1, 2, 3])
      ).map(Math.round),
      [1, 2, 3]
    );
    t.end();
  }
);

tape(
  "RotationMatrix_toEulerAngles inverses RotationMatrix_fromEulerAngles",
  t => {
    t.deepEqual(
      RotationMatrix_toEulerAngles(
        RotationMatrix_fromEulerAngles([1, 2, 3])
      ).map(Math.round),
      [1, 2, 3]
    );
    t.end();
  }
);

tape("versor.angles inverses versor_fromAngles", t => {
  t.deepEqual(versor.rotation(versor([1, 2, 3])).map(Math.round), [1, 2, 3]);
  t.deepEqual(
    attitude()
      .angles([1, 2, 3])
      .angles()
      .map(Math.round),
    [1, 2, 3]
  );
  t.deepEqual(
    attitude()
      .versor(
        attitude()
          .angles([1, 2, 3])
          .versor()
      )
      .angles()
      .map(Math.round),
    [1, 2, 3]
  );
  t.deepEqual(
    versor
      .rotation(
        attitude()
          .matrix(J2000)
          .versor()
      )
      .map(Math.round),
    attitude()
      .matrix(J2000)
      .angles()
      .map(Math.round)
  );
  t.end();
});

tape("test rotations", t => {
  t.inDelta(
    attitude()
      .axis([0, 90])
      .angle(10)([2, -8]),
    [12, -8]
  );
  t.inDelta(attitude().angles([10, 0, 0])([2, -8]), [12, -8]);

  t.equal(attitude().angle(), 360);

  t.inDelta(
    attitude()
      .angle(1)
      .angles(),
    [1, 0, 0]
  );

  t.end();
});

tape("matrix rotate point", t => {
  const a = Math.PI / 2;

  // axis 1 is front — eq. (14)
  const m1 = [[1, 0, 0], [0, cos(a), sin(a)], [0, -sin(a), cos(a)]];
  t.deepEqual(MatrixRotatePoint(m1, [0, 0]), [0, 0]);
  t.deepEqual(MatrixRotatePoint(m1, [0, 90]).map(Math.round), [-90, 0]);
  t.deepEqual(MatrixRotatePoint(m1, [90, 10]).map(Math.round), [-90, 80]);
  // axis 2 is left — eq. (15)
  const m2 = [[cos(a), 0, -sin(a)], [0, 1, 0], [sin(a), 0, cos(a)]];
  t.deepEqual(MatrixRotatePoint(m2, [0, 0]), [0, -90]);
  t.deepEqual(MatrixRotatePoint(m2, [0, 90]).map(Math.round), [0, 0]);
  t.deepEqual(MatrixRotatePoint(m2, [90, 10]).map(Math.round)[0], 80);

  // axis 3 is top — eq. (16)
  const m3 = [[cos(a), sin(a), 0], [-sin(a), cos(a), 0], [0, 0, 1]];
  t.deepEqual(MatrixRotatePoint(m3, [0, 0]), [90, 0]);
  t.deepEqual(MatrixRotatePoint(m3, [0, 90]).map(Math.round)[1], 90);
  t.deepEqual(MatrixRotatePoint(m3, [90, 10]).map(Math.round), [180, 10]);

  t.end();
});

tape("axis rotations", t => {
  t.inDelta(attitude().angle(45)([0, 1]), [45, 1], 0.1);
  t.inDelta(
    attitude()
      .axis([0, 0])
      .angle(45)([91, 0]),
    [91, 45],
    0.5
  );
  t.inDelta(
    attitude()
      .axis([-90, 0])
      .angle(45)([1, 0]),
    [1, 45],
    0.5
  );

  t.end();
});

tape("rotation matrix from axis-angle", t => {
  t.inDelta(
    RotationMatrix_fromAxisAngle([0, 90], 90),
    RotationMatrix_fromEulerAngles([90, 0, 0])
  );
  t.inDelta(
    RotationMatrix_fromAxisAngle([0, 0], 20),
    RotationMatrix_fromEulerAngles([0, 0, 20])
  );
  t.inDelta(
    RotationMatrix_fromAxisAngle([-90, 0], 20),
    RotationMatrix_fromEulerAngles([0, 20, 0])
  );
  t.end();
});

tape("attitude <~> geoRotation", t => {
  t.inDelta(attitude([1, 2, 3])([0, 0]), d3.geoRotation([1, 2, 3])([0, 0]));
  t.inDelta(
    attitude([1, 2, 3]).invert([0, 0]),
    d3.geoRotation([1, 2, 3]).invert([0, 0])
  );
  t.end();
});

tape("arc", t => {
  t.inDelta(attitude().arc([1, 2], [3, 4])([1, 2]), [3, 4]);
  t.end();
});

tape("vector", t => {
  const A = attitude()
    .axis([10, 20])
    .angle(180);
  // default is stereographic: 180° gives a norm=1 vector
  t.inDelta(A.vector(), [0.9254165783983233, 0.1631759111665348, 0.34202014332566866]);

  // gnomonic: 90° gives a norm=1 vector
  t.inDelta(attitude().angle(90).vectorGnomonic(), [0, 0, 1]);

  // equidistant: 90° gives a norm = pi/2 vector
  t.inDelta(attitude().angle(90).vectorEquidistant(), [0, 0, pi/2]);

  t.inDelta(
    attitude()
      .vector(A.vector())
      .axis(),
    [10, 20]
  );
  t.inDelta(
    attitude()
      .vectorEquidistant(A.vectorEquidistant())
      .angle(),
    180
  );
  t.inDelta(
    attitude()
      .vectorGnomonic(A.vectorGnomonic())
      .axis(),
    [10, 20]
  );
  t.inDelta(
    attitude()
      .vectorStereographic(A.vectorStereographic())
      .axis(),
    [10, 20]
  );
  t.end();
});

tape("exact sin cos", t => {
  t.deepEqual(attitude({ angle: 90 }).matrix(), [
    [0, 1, 0],
    [-1, 0, 0],
    [0, 0, 1]
  ]);
  t.end();
});
