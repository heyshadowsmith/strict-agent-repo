export interface Ok<T> {
  readonly tag: "Ok";
  readonly value: T;
}

export interface Failure<E> {
  readonly tag: "Failure";
  readonly error: E;
}

export type Result<T, E = Error> = Ok<T> | Failure<E>;

export function ok<T>(value: T): Ok<T> {
  return { tag: "Ok", value };
}

export function fail<E>(error: E): Failure<E> {
  return { tag: "Failure", error };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.tag === "Ok";
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.tag === "Failure";
}

export function map<T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => U,
): Result<U, E> {
  return isOk(result) ? ok(transform(result.value)) : result;
}

export function flatMap<T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => Result<U, E>,
): Result<U, E> {
  return isOk(result) ? transform(result.value) : result;
}

export function mapFailure<T, E, F>(
  result: Result<T, E>,
  transform: (error: E) => F,
): Result<T, F> {
  return isFailure(result) ? fail(transform(result.error)) : result;
}

export function match<T, E, U>(
  result: Result<T, E>,
  onOk: (value: T) => U,
  onError: (error: E) => U,
): U {
  return isOk(result) ? onOk(result.value) : onError(result.error);
}

export function getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
  return isOk(result) ? result.value : defaultValue;
}

export function recover<T, E>(
  result: Result<T, E>,
  handler: (error: E) => T,
): Result<T, never> {
  return isFailure(result) ? ok(handler(result.error)) : result;
}

export function fromNullable<T, E>(
  value: T | undefined,
  error: E,
): Result<T, E> {
  return value === undefined ? fail(error) : ok(value);
}

export function combine<T, E>(
  results: readonly Result<T, E>[],
): Result<readonly T[], E> {
  const firstFailure = results.find(isFailure);
  if (firstFailure !== undefined) return firstFailure;
  return ok(results.filter(isOk).map((r) => r.value));
}
