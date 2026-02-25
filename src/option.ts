import { type Result, ok, fail } from "./result";

export interface Some<T> {
  readonly tag: "Some";
  readonly value: T;
}
export interface None {
  readonly tag: "None";
}
export type Option<T> = Some<T> | None;

export const some = <T>(value: T): Some<T> => ({ tag: "Some", value });
export const none: None = { tag: "None" };

export const isSome = <T>(option: Option<T>): option is Some<T> =>
  option.tag === "Some";

export const isNone = <T>(option: Option<T>): option is None =>
  option.tag === "None";

export const fromNullable = <T>(value?: T): Option<T> =>
  value === undefined ? none : some(value);

export const map =
  <T, U>(transform: (value: T) => U) =>
  (option: Option<T>): Option<U> =>
    isSome(option) ? some(transform(option.value)) : none;

export const flatMap =
  <T, U>(transform: (value: T) => Option<U>) =>
  (option: Option<T>): Option<U> =>
    isSome(option) ? transform(option.value) : none;

export const getOrElse =
  <T>(defaultValue: T) =>
  (option: Option<T>): T =>
    isSome(option) ? option.value : defaultValue;

export const match =
  <T, U>(onSome: (value: T) => U, onNone: () => U) =>
  (option: Option<T>): U =>
    isSome(option) ? onSome(option.value) : onNone();

export const filter =
  <T>(predicate: (value: T) => boolean) =>
  (option: Option<T>): Option<T> =>
    isSome(option) && predicate(option.value) ? option : none;

export const toResult =
  <E>(error: E) =>
  <T>(option: Option<T>): Result<T, E> =>
    isSome(option) ? ok(option.value) : fail(error);
