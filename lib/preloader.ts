/**
 * Contract between the preloader and everything that waits for it.
 *
 * The preloader calls `markPreloaderDone()` the moment its curtain STARTS to
 * leave. Above-the-fold entrances (the hero) subscribe with
 * `onPreloaderDone()` so they play underneath the lifting curtain, and
 * SmoothScroll unlocks scrolling at the same moment.
 */
const EVENT = "kn:preloader-done";
let done = false;

export function markPreloaderDone(): void {
  if (done || typeof window === "undefined") return;
  done = true;
  document.documentElement.dataset.loaded = "true";
  window.dispatchEvent(new Event(EVENT));
}

export function isPreloaderDone(): boolean {
  return done;
}

/** Runs `cb` once the preloader is done (immediately if it already is). Returns an unsubscribe. */
export function onPreloaderDone(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (done) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(EVENT, handler, { once: true });
  return () => window.removeEventListener(EVENT, handler);
}
