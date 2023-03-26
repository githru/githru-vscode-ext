export const throttle = (cb: Function, delay = 1000) => {
  let lastTime = 0;
  return function () {
    const now = Date.now();
    if (now - lastTime >= delay) {
      cb();
      lastTime = now;
    }
  };
};
