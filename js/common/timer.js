export function createTimer({ onTick } = {}) {
  let elapsedSeconds = 0;
  let intervalId = null;
  let running = false;

  function tick() {
    elapsedSeconds += 1;
    if (onTick) onTick(elapsedSeconds);
  }

  function start(initialSeconds = 0) {
    elapsedSeconds = initialSeconds;
    resume();
  }

  function pause() {
    running = false;
    clearInterval(intervalId);
    intervalId = null;
  }

  function resume() {
    if (running) return;
    running = true;
    intervalId = setInterval(tick, 1000);
  }

  function stop() {
    pause();
  }

  return {
    start,
    pause,
    resume,
    stop,
    getElapsed: () => elapsedSeconds,
    isRunning: () => running,
  };
}

export function formatElapsed(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
