export interface MessageHandler {
  onMessage(message: string, payload: any): void;
}
