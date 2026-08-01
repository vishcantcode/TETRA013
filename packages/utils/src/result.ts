export type Success<T> = { success: true; data: T };
export type Failure<E> = { success: false; error: E };
export type Result<T, E = Error> = Success<T> | Failure<E>;

export function ok<T>(data: T): Success<T> {
  return { success: true, data };
}
export function fail<E>(error: E): Failure<E> {
  return { success: false, error };
}
