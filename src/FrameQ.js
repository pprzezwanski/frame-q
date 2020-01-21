export default class FrameQ {
  constructor(options = {}) {
    this.config = {
      timeLimit: options.timeLimit || 3,
      debug: options.debug,
    };
    this.tasks = {
      standard: [],
      animation: [],
      background: [],
    };
    this.now = () => performance.now() || Date.now();
    // this.raf = window.requestAnimationFrame;
    this.running = false;
    this.frameQ = this.frameQ.bind(this);
    this.frame = null;
    this.taskCounter = 0;
  }

  subscribe({
    fn,
    onReturn,
    options,
  }) {
    if (!this.running) {
      this.frame = requestAnimationFrame(this.frameQ);
      this.running = true;
    }

    const {
      name = '',
      priority = 'standard',
      asap = false,
      newFrame = false,
      frameEnd = false,
    } = options;

    const task = {
      id: this.taskCounter,
      name,
      fn,
      priority,
      newFrame,
      frameEnd,
      onReturn(result) { return onReturn(result); },
      skippedFrames: 0,
    };

    this.taskCounter += 1;

    const target = this.tasks[priority];

    if (asap) target.unshift(task);
    else target.push(task);
    return task;
  }

  add(fn, options = {}) {
    // a promise-wrapper that will return fn's return once it is executed
    return new Promise((r) => {
      const onReturn = (result) => {
        Promise.resolve(result).then((val) => { r(val); });
      };

      this.subscribe({
        fn,
        options,
        onReturn,
      });
    });
  }

  timedAnimation(timestamp, start, callback, duration) {
    let progress = (timestamp - start) / duration;
    if (progress < 1) {
      this.addAnimation(
        stamp => this.timedAnimation(stamp, start, callback, duration),
      );
    } else progress = 1;
    callback(progress);
    return progress === 1;
  }

  timedAnimate(callback, duration) {
    const start = performance.now();
    this.addAnimation(
      timestamp => this.timedAnimation(timestamp, start, callback, duration)
    );
  }

  asap(fn) { this.add(fn, { asap: true }); }

  addAnimation(fn) { this.add(fn, { priority: 'animation' }); }

  wait(duration) {
    return new Promise((r) => {
      this.timedAnimate(
        (progress) => { if (progress === 1) r(); },
        duration
      );
    });
  }

  queueTasks(tasks, startTime, timestamp, runAll = false) {
    const tasksClone = [...tasks];

    const l = tasksClone.length;

    for (let i = 0; i < l; i += 1) {
      if (this.now() - startTime < this.config.timeLimit && l !== 0) {
        const currentTask = tasksClone.shift();

        const {
          fn,
          onReturn,
          skippedFrames,
          newFrame,
          frameEnd,
          only,
        } = currentTask;

        if (!runAll && ((newFrame || only) && !skippedFrames)) {
          if (this.config.debug) console.log('skipping:', { ...currentTask });
          tasks.find(t => t.id === currentTask.id).skippedFrames += 1;
          break;
        } else {
          tasks.shift();
          if (this.config.debug) console.log('executing task:', currentTask.name, { ...currentTask });
          if (this.config.debug) console.log(fn);
          const result = fn(timestamp);
          if (onReturn) onReturn(result);
          if (frameEnd || only) break;
        }
      } else {
        break;
      }
    }
  }

  frameQ(timestamp) {
    const {
      standard = [],
      animation = [],
      background = [],
    } = this.tasks;

    if (
      standard.length === 0
      && animation.length === 0
      && background.length === 0
    ) {
      if (this.config.debug) console.log('frameQ stopped');
      this.running = false;
      cancelAnimationFrame(this.frame);
      return;
    }

    requestAnimationFrame(this.frameQ);

    const startTime = this.now();

    if (this.config.debug) console.log('-------new-frame-------');
    this.queueTasks(standard, startTime, timestamp);
    this.queueTasks(animation, startTime, timestamp, true);
    if (animation.length === 0 && standard.length === 0) {
      this.queueTasks(background, startTime, timestamp);
    }
  }
}
