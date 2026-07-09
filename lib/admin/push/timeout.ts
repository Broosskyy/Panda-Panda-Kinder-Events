/** Timeout wrapper for promises that may hang (e.g. serviceWorker.ready). */

export class PushTimeoutError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`${label} — Timeout nach ${Math.round(timeoutMs / 1000)}s`);
    this.name = "PushTimeoutError";
  }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new PushTimeoutError(label, timeoutMs));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

export const PUSH_SW_READY_TIMEOUT_MS = 15_000;
