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

`q = [q0, q1, q2, q3, q4]` is also called a *versor* when its norm is equal to 1.

### Rotation Vector

`[ x, y, z ]` = *f(a)B*, where *f(a)* is a scalar encoding the angle, and *B* a unit vector in cartesian coordinates.

*Note:* there are many ways to encode the angle, we have to settle on a default. The useful functions *f(a)* are:
- *tan(a/4)*: stereographic, ‘Modified Rodrigues Parameters’.
- *tan(a/2)*: gnomonic, ‘Rodrigues Parameters’, ‘Gibbs vector’.
- *a*: equidistant, logarithm vector.
- (vector part of the) unit quaternion: Euler angles.

Defaults to the stereographic vector representation.


## API Reference

<a name="attitude" href="#attitude">#</a> attitude([<i>angles</i>])

Returns an *attitude* object. Sets the rotation’s Euler angles if the *angles* argument is specified. *attitude* is equivalent to [d3.geoRotation(angles)](https://github.com/d3/d3-geo/blob/master/README.md#geoRotation), and can be used as a function to rotate a point [longitude, latitude]. 

### Operations

<a name="attitude_invert" href="#attitude_invert">#</a> *attitude*.<b>invert</b>(<i>point</i>)

Returns the *inverse* rotation of the point.

<a name="attitude_inverse" href="#attitude_inverse">#</a> *attitude*.<b>inverse</b>()

Returns a new attitude, inverse of the original.

<a name="attitude_compose" href="#attitude_compose">#</a> *attitude*.<b>compose</b>(<i>b</i>)

Returns a new attitude, composition of the original with the argument. When *c* = *a*.compose(*b*) is applied to a point *p*, the result *c*(*p*) = *a*(*b*(*p*)): in other words, the rotation *b* will be applied first, then rotation *a*.

<a name="attitude_power" href="#attitude_power">#</a> *attitude*.<b>power</b>(<i>power</i>)

Returns a new partial attitude. *a*.power(2) is twice the rotation *a*, *a*.power(.5) is half the rotation *a*.

<a name="attitude_arc" href="#attitude_arc">#</a> *attitude*.<b>arc</b>(<i>A</i>, <i>B</i>)

Returns a new attitude that brings the point *A* to *B* by the shortest (geodesic) path.

<a name="attitude_interpolateTo" href="#attitude_interpolateTo">#</a> *attitude*.<b>interpolateTo</b>(<i>b</i>)

Returns an interpolator that continuously transitions the original *attitude* to the argument. The result is a function of *t* that is equivalent to *attitude* for *t* = 0, and equivalent to *b* for *t* = 1. Useful for [spherical linear interpolation (SLERP)](https://observablehq.com/d/b3c52ccf8f22ef2b?collection=@fil/attitude).


### Representations

<a name="attitude_angles" href="#attitude_angles">#</a> *attitude*.<b>angles</b>([<i>angles</i>])

Sets or reads the *Euler angles* of an *attitude*, as an array [&phi;, &lambda;, &gamma;] (in degrees).

<a name="attitude_axis" href="#attitude_axis">#</a> *attitude*.<b>axis</b>([<i>axis</i>])

Sets or reads the *rotation axis* of an *attitude*, as [lon, lat] coordinates.

<a name="attitude_angle" href="#attitude_angle">#</a> *attitude*.<b>angle</b>([<i>angle</i>])

Sets or reads the *rotation angle* of an *attitude*, in degrees.

<a name="attitude_versor" href="#attitude_versor">#</a> *attitude*.<b>versor</b>([<i>versor</i>])

Sets or reads the *versor* representation of an *attitude*, as a length-4 array.

<a name="attitude_matrix" href="#attitude_matrix">#</a> *attitude*.<b>matrix</b>([<i>matrix</i>])

Sets or reads the *matrix* representation of an *attitude*, as a matrix of size 3&times;3.

<!--
<a name="attitude_rotate" href="#attitude_rotate">#</a> *attitude*.<b>rotate</b>(<i>array</i>, <i>p</i>[, <i>accessor</i>])
*rotate* **TBD**.
-->

<a name="attitude_vector" href="#attitude_vector">#</a> *attitude*.<b>vector</b>([<i>vector</i>])

Sets or reads the *vector* representation of an *attitude*, as a length-3 array. That array can be written f(a)B, where f is a function of the rotation’s angle, and B a unit vector respresenting the axis in cartesian coordinates.

Defaults to the [stereographic](#attitude_vectorStereographic) vector: f(a) = tan(a/4).

<a name="attitude_vectorStereographic" href="#attitude_vectorStereographic">#</a> *attitude*.<b>vectorStereographic</b>([<i>vector</i>])

*Stereographic* vector: f(a) = tan(a/4). Also called the ‘Modified Rodrigues Parameters’.

<a name="attitude_vectorGnomonic" href="#attitude_vectorGnomonic">#</a> *attitude*.<b>vectorGnomonic</b>([<i>vector</i>])

*Gnomonic* vector: f(a) = tan(a/2). Also called ‘Rodrigues Parameters’ or ‘Gibbs vector’.

<a name="attitude_vectorEquidistant" href="#attitude_vectorEquidistant">#</a> *attitude*.<b>vectorEquidistant</b>([<i>vector</i>])

*Equidistant* vector: f(a) = a. Also called the logarithm vector.



---

With thanks to [Jacob Rus](https://observablehq.com/@jrus), [Nadieh Bremer](https://www.visualcinnamon.com), [Mike Bostock](https://bost.ocks.org/mike/) and [Darcy Murphy](https://github.com/mrDarcyMurphy).
