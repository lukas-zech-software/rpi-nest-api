/**
 * An object that only has properties of the provided type
 */
export interface IObject<T> {
  [index: string]: T;
}
