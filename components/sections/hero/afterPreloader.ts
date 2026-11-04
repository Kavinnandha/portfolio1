import { isPreloaderDone, onPreloaderDone } from "@/lib/preloader";

/**
 * Runs `cb` once the preloader curtain starts to lift — immediately when there
 * is no preloader in the DOM or it has already finished. A failsafe fires it
 * anyway after `failsafeMs`, so the hero can never stay hidden if the
 * preloader misbehaves. Returns a cancel function. Client-only.
 */
export function afterPreloader(cb: () => void, failsafeMs = 8000): () => void {
  if (isPreloaderDone() || !document.querySelector("[data-preloader]")) {
    cb();
    return () => {};
  }

  let fired = false;
  let timer = 0;
  const run = () => {
    if (fired) return;
    fired = true;
    window.clearTimeout(timer);
    cb();
  };
  const off = onPreloaderDone(run);
  timer = window.setTimeout(run, failsafeMs);

  return () => {
    fired = true;
    off();
    window.clearTimeout(timer);
  };
}
