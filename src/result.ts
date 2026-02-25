export interface Ok<T> {
  readonly tag: "Ok";
  readonly value: T;
}
export interface Failure<E> {
  readonly tag: "Failure";
  readonly error: E;
}
export type Result<T, E = Error> = Ok<T> | Failure<E>;

export const ok = <T>(value: T): Ok<T> => ({ tag: "Ok", value });
export const fail = <E>(error: E): Failure<E> => ({ tag: "Failure", error });

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> =>
  result.tag === "Ok";

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result.tag === "Failure";

export const map =
  <T, U, E>(transform: (value: T) => U) =>
  (result: Result<T, E>): Result<U, E> =>
    isOk(result) ? ok(transform(result.value)) : result;

export const flatMap =
  <T, U, E>(transform: (value: T) => Result<U, E>) =>
  (result: Result<T, E>): Result<U, E> =>
    isOk(result) ? transform(result.value) : result;

export const mapFailure =
  <T, E, F>(transform: (error: E) => F) =>
  (result: Result<T, E>): Result<T, F> =>
    isFailure(result) ? fail(transform(result.error)) : result;

export const match =
  <T, E, U>(onOk: (value: T) => U, onError: (error: E) => U) =>
  (result: Result<T, E>): U =>
    isOk(result) ? onOk(result.value) : onError(result.error);

export const getOrElse =
  <T>(defaultValue: T) =>
  <E>(result: Result<T, E>): T =>
    isOk(result) ? result.value : defaultValue;

export const recover =
  <T, E>(handler: (error: E) => T) =>
  (result: Result<T, E>): Result<T, never> =>
    isFailure(result) ? ok(handler(result.error)) : result;

export const fromNullable =
  <E>(error: E) =>
  <T>(value?: T): Result<T, E> =>
    value === undefined ? fail(error) : ok(value);

export const combine = <T, E>(
  results: readonly Result<T, E>[],
): Result<readonly T[], E> =>
  results.find((r): r is Failure<E> => isFailure(r)) ??
  ok<readonly T[]>(
    results.filter((r): r is Ok<T> => isOk(r)).map((r) => r.value),
  );
