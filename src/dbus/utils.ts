import { TypedVariant, VariantLike, VariantObject, VariantParentObject } from './types';
import { map, isArray, isPlainObject, mapValues, assignWith } from 'lodash';
import { Variant } from 'dbus-final';

// TODO: Check if some of these can be migrated to the upstream repository of dbus-final
export function toVariant<T>({ signature, value }: VariantLike<T>): TypedVariant<T> {
  return new Variant(signature, value);
}

export function isVariant<T>(obj: any): obj is VariantLike<T> {
  return obj.value !== undefined && obj.signature !== undefined;
}

export function unwrapVariant<T>(variant: VariantLike<T>): T {
  return variant.value;
}

export function unwrapVariantDeep<T>(obj: any): T {
  if (isVariant(obj)) {
    obj = unwrapVariant(obj);
  }

  if (isArray(obj)) {
    return map(obj, unwrapVariantDeep) as T;
  }

  if (isPlainObject(obj)) {
    return mapValues(obj, unwrapVariantDeep) as T;
  }

  return obj;
}

export function unwrapVariantObject<T>(variantObject: VariantObject<T> | VariantParentObject<T>): T {
  return unwrapVariantDeep(variantObject) as T;
}

export function assignVariantDeep(obj: any, src: any): any {
  if (isVariant(obj)) {
    if (isArray(obj.value)) {
      return Object.assign(obj.value[0], { value: src[0] });
    }
    return Object.assign(obj, { value: src });
  }

  if (isArray(obj)) {
    return assignVariantDeep(obj[0], src[0]);
  }

  if (isPlainObject(obj)) {
    return assignWith(obj, src, assignVariantDeep);
  }
}
