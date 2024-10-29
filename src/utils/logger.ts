export function logger(namespace: string) {
  const prefix = `[${namespace}] `;

  return {
    info(...args: any[]) {
      console.info(prefix, ...args);
    },

    warn(...args: any[]) {
      console.warn(prefix, ...args);
    },

    error(...args: any[]) {
      console.error(prefix, ...args);
    },
  };
}

export type Logger = ReturnType<typeof logger>;
