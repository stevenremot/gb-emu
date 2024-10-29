export function assertNotNull<T>(value: T | null) {
  if (!value) {
    throw new Error("value should not be null");
  }

  return value;
}
