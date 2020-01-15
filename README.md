# attitude

_Attitude: orientation of an object in space._

A rotation of the sphere can be represented in various ways, such as:

- [Euler Angles](#_euler-angles_)
- [Axis-Angle](#_axis-angle_)
- [Rotation Matrix](#_rotation-matrix_)
- [Unit Quaternion](#_unit-quaternion_) (aka versor)
- [Arc](#_arc_)
- [Rotation Vector](#_rotation-vector_)

Each of these representations has pros and cons, in terms of intuition, computational cost, precision, compacity, and so on. Their domains are also not exactly the same: for example an axis-angle notation can encode a rotation that does two turns (720°), but a rotation matrix cannot. Their applications are very different: versors allow to compose rotations, axis-angle ease the transition between two rotations, an arc describes a rotation as the shortest path between two points, rotation vectors are used for optimizations. Finally, matrices can be applied to point coordinates to, you know… rotate them.

Two rotations are considered to be equivalent if they move all the points to the same destinations. There are many ways to convert a rotation from one representation to an equivalent rotation in a different representation.

The **attitude** module allows conversions and computations between all these representations.


## Installing

If you use NPM, `npm install attitude`. Otherwise, download the [latest release](https://github.com/Fil/attitude/releases/latest). AMD, CommonJS, and vanilla environments are supported. In vanilla, an `attitude` global is exported:

```html
<script src="https://unpkg.com/attitude"></script>
<script>

const attitude = attitude.attitude();

</script>
```

[Try attitude in your browser.](https://observablehq.com/collection/@fil/attitude)


## API Reference


### Euler Angles

[lambda, phi, gamma] in degrees.

### Axis-Angle

{ axis: [lon, lat], angle: alpha } in degrees.

### Rotation Matrix

[ [r11, r12, r13],
  [r21, r22, r23],
  [r31, r32, r33] ]

### Unit Quaternion

q = [q0, q1, q2, q3, q4]

### Arc

(A, B) where A and B are spherical points [lon,lat], in degrees.

### Rotation Vector

[ x, y, z ] = f(a)B, where *f(a)* is a scalar encoding the angle, and B a unit vector in cartesian coordinates.

*Note:* there are many ways to encode the angle, we have to settle on a default. The useful functions *f(a)* are:
- *tan(a/4)*: stereographic, ‘Modified Rodrigues Parameters’.
- *tan(a/2)*: gnomonic, ‘Rodrigues Parameters’, ‘Gibbs vector’.
- *a*: equidistant, logarithm vector.
- (vector part of the) unit quaternion: Euler angles.

Defaults to the stereographic vector representation.


---

With thanks to [Jacob Rus](https://observablehq.com/@jrus), [Nadieh Bremer](https://www.visualcinnamon.com), [Mike Bostock](https://bost.ocks.org/mike/) and [Darcy Murphy](https://github.com/mrDarcyMurphy).
