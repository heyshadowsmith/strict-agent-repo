import { type Result, ok, fail } from "./result";

export interface Some<T> {
  readonly tag: "Some";
  readonly value: T;
}

export interface None {
  readonly tag: "None";
}

export type Option<T> = Some<T> | None;

export function some<T>(value: T): Some<T> {
  return { tag: "Some", value };
}

export const none: None = { tag: "None" };

export function isSome<T>(option: Option<T>): option is Some<T> {
  return option.tag === "Some";
}

export function isNone<T>(option: Option<T>): option is None {
  return option.tag === "None";
}

export function fromNullable<T>(value?: T): Option<T> {
  return value === undefined ? none : some(value);
}

export function map<T, U>(
  option: Option<T>,
  transform: (value: T) => U,
): Option<U> {
  return isSome(option) ? some(transform(option.value)) : none;
}

export function flatMap<T, U>(
  option: Option<T>,
  transform: (value: T) => Option<U>,
): Option<U> {
  return isSome(option) ? transform(option.value) : none;
}

export function getOrElse<T>(option: Option<T>, defaultValue: T): T {
  return isSome(option) ? option.value : defaultValue;
}

export function match<T, U>(
  option: Option<T>,
  onSome: (value: T) => U,
  onNone: () => U,
): U {
  return isSome(option) ? onSome(option.value) : onNone();
}

export function filter<T>(
  option: Option<T>,
  predicate: (value: T) => boolean,
): Option<T> {
  return isSome(option) && predicate(option.value) ? option : none;
}

export function toResult<T, E>(option: Option<T>, error: E): Result<T, E> {
  return isSome(option) ? ok(option.value) : fail(error);
}
