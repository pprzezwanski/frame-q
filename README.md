# frame-q &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pprzezwanski/frame-q/blob/master/LICENSE)

Promise based task scheduler that prevents overlapping of main tasks with microtasks and animation tasks and thus giving precise controll over the frame. Its 'add' method returns a promise that will resolve when the tasks reaches its turn in the tasks que. The return value of that task function is resolve value of the promise and if function returns a promise it will be resolve value. This hack lets comfortably redirect microtasks to requestAnimationFrame que.

[See living example on ho-gi.com](http://ho-gi.com).

## Use Cases:

* **smooth animations:** split js tasks to small chunks not to interupt browsers framerate that is crucial for smooth animations
* **prevent reflows:** design frame brake after certain task to prevent reflow
* **basic error handling:** since it is promise based frame-q will not stop on single task error
* **quickly solve bugs** with option: debug: true frame-q logs all tasks be name or by function what can help to quickly solve errors

## Really simple yet powerfull API:

* **.add method:** fq.add(function) covers almost all cases with its few powerfull options, like 'frameEnd', 'frameStart' and 'priority'
* **.wait method:** fq.wait(milliseconds) is substitute for setTimeout.
* **.addAnimation:** fq.addAnimation(function) is shortcut for .add with priority 'animation'

## Installation

```
$ npm install frame-q
```

## Important

For successful frame control you have to add all microtasks into frame-q (i.ex. "promise.then".

```javascript
// instead of:
promise.then(() => someFn());

// you have to write:
promise.then(() => fq.add(() => someFn()));
```

## Usage 

```javascript
import fq from frame-q;

// to deal with reflows:

fq.add(() => {
  const el = document.querySelector('.el');
  return el.getBoundingClientRect();
}, frameEnd: true).then(rect = fq.add(() => {
  doSmth(rect);
}))
  
// to deal with microtasks: 
  
fq.add(() => {
  do smth;
  return another;
})
  .then(() => fq.add(() => somePromise))
  .then(() => fq.add(() => {
    do smthElse;
    return yetAnotherPromise
  }))
  .then(() => fq.wait(2000))
  .then(() => fq.add(() => {
    do smthFinal;
  }))

```

## Contributing

frame-q for sure needs more development and any suggestions including pull-requests are more than wellcome.


## License

Frame-q is [MIT licensed](./LICENSE).
Copyright (c) 2018-2019 Pawel Przezwanski <[http://ho-gi.com/](http://ho-gi.com/)>

