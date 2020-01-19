# Kadmos

A simple zero configuration Javascript library made with [Three.js](hhttps://threejs.org/) to display 3D models in STL-format served by URL. 

### Follow the Demos!

For the full experience, I recommend following the demo application.

![Kadmos in use](/images/logo.png)

### Installing

To use this library simply install it with NPM:

```
$ npm install kadmos
```

And use it like below:

```typescript
Kadmos.initFromUrl();
```

This will tell Kadmos to serve the 3D model referred to by the URL so visiting e.g.:

```
http://localhost:1234/?fileUrl=https://ni.leicht.io/bg_1000_handle.stl&color=0x333333
```

loads the file from https://ni.leicht.io/bg_1000_handle.stl with the color 0x333333.
