// use this method in a filter to remove null and undefined values from an array
export function isNotNullish<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
