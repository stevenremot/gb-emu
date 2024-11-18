export class WorkerClient {
  private worker: Worker | null = null;

  start() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
  }

  callMethod(
    payload: { target: string; method: string; payload?: unknown },
    transfer?: Transferable[],
  ) {
    this.worker?.postMessage(payload, transfer);
  }

  runOneInstruction() {
    this.callMethod({
      target: "runner",
      method: "runOneInstruction",
    });
  }

  toggleLoop() {
    this.callMethod({
      target: "runner",
      method: "toggle",
    });
  }

  stop() {
    this.callMethod({
      target: "runner",
      method: "stop",
    });
  }

  loadUrl(type: "boot" | "cartridge", path: string) {
    this.callMethod({
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
