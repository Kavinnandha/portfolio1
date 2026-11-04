import { profile } from "@/lib/content";

/**
 * One shared wall clock in the profile's timezone, exposed as an external
 * store for useSyncExternalStore. Time is only read inside the subscription
 * (an effect) and its timer — never during render — so the prerendered shell
 * ships the placeholder and the client fills in the real time after mount.
 */
const PLACEHOLDER = "--:--:--";

let current = PLACEHOLDER;
let timer: ReturnType<typeof setTimeout> | undefined;
let formatter: Intl.DateTimeFormat | undefined;
const listeners = new Set<() => void>();

function read(): string {
  formatter ??= new Intl.DateTimeFormat("en-GB", {
    timeZone: profile.timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  return formatter.format(new Date());
}

function tick() {
  const next = read();
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
}

function schedule() {
  // Land just after each wall-clock second so the display never skips one.
  timer = setTimeout(() => {
    tick();
    schedule();
  }, 1020 - (Date.now() % 1000));
}

export function subscribeClock(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    tick();
    schedule();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
}

/** "14:32:05" */
export const clockSeconds = () => current;
/** "14:32" */
export const clockMinutes = () => current.slice(0, 5);
export const serverSeconds = () => PLACEHOLDER;
export const serverMinutes = () => PLACEHOLDER.slice(0, 5);

export function isPlaceholder(time: string): boolean {
  return time.startsWith("-");
}
