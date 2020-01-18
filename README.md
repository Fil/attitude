# attitude

_Attitude: orientation of an object in space._

A rotation of the sphere can be represented in various ways, such as:

- [Euler Angles](#euler-angles)
- [Axis-Angle](#axis-angle)
- [Rotation Matrix](#rotation-matrix)
- [Unit Quaternion](#unit-quaternion) (aka versor)
- [Rotation Vector](#rotation-vector)

The **attitude** module allows conversions and computations between all these representations.

See https://observablehq.com/@fil/attitude for details.


## Installing

If you use NPM, `npm install attitude`. Otherwise, download the [latest release](https://github.com/Fil/attitude/releases/latest). AMD, CommonJS, and vanilla environments are supported. In vanilla, an `attitude` global is exported:

```html
<script src="https://unpkg.com/attitude"></script>
<script>

const attitude = attitude();

</script>
```

[Try attitude in your browser.](https://observablehq.com/collection/@fil/attitude)


## Representations


### Euler Angles

`[lambda, phi, gamma]`, in degrees.

### Axis-Angle

`{ axis: [lon, lat], angle: alpha }`, in degrees.

### Rotation Matrix

~~~{js}
[ [r11, r12, r13],
  [r21, r22, r23],
  [r31, r32, r33] ]
~~~

### Unit Quaternion

`q = [q0, q1, q2, q3, q4]`

### Rotation Vector

`[ x, y, z ]` = *f(a)B*, where *f(a)* is a scalar encoding the angle, and *B* a unit vector in cartesian coordinates.

*Note:* there are many ways to encode the angle, we have to settle on a default. The useful functions *f(a)* are:
- *tan(a/4)*: stereographic, ‘Modified Rodrigues Parameters’.
- *tan(a/2)*: gnomonic, ‘Rodrigues Parameters’, ‘Gibbs vector’.
- *a*: equidistant, logarithm vector.
- (vector part of the) unit quaternion: Euler angles.

Defaults to the stereographic vector representation.


## API Reference

TBD




---

With thanks to [Jacob Rus](https://observablehq.com/@jrus), [Nadieh Bremer](https://www.visualcinnamon.com), [Mike Bostock](https://bost.ocks.org/mike/) and [Darcy Murphy](https://github.com/mrDarcyMurphy).
