export class WorkerClient {
  private worker: Worker | null = null;

  start() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
  }

  runOneInstruction() {
    this.worker?.postMessage({
      target: "runner",
      method: "runOneInstruction",
    });
  }

  toggleLoop() {
    this.worker?.postMessage({
      target: "runner",
      method: "toggle",
    });
  }

  stop() {
    this.worker?.postMessage({
      target: "runner",
      method: "stop",
    });
  }

  loadUrl(type: "boot" | "cartridge", path: string) {
    this.worker?.postMessage({
      target: "loader",
      method: "loadUrl",
      payload: { type, path },
    });
  }

  addMessageListener(message: string, listener: (payload: any) => void) {
    this.worker?.addEventListener("message", (event) => {
      const { type, payload } = event.data;

      if (type === message) {
        listener(payload);
      }
    });
  }
}
