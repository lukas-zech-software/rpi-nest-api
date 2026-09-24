import { ClientInterface, Variant } from 'dbus-final';

export type TypedVariant<T> = Variant & {
  value: T;
};

export type VariantLike<T> = {
  signature: string;
  value: T;
};

export type VariantParentObject<T> = {
  [TKey in keyof T]: VariantObject<T[TKey]>;
};

export type VariantObject<T> = {
  [TKey in keyof T]: VariantLike<T[TKey]>;
};

export type MethodsObject<T> = {
  /* eslint-disable-next-line  @typescript-eslint/ban-types */
  [Property in keyof T]: Function;
};

export type MethodInterface<T> = ClientInterface & T;

export type IntrospectableInterface = ClientInterface & {
  Introspect(): Promise<unknown>;
};

export type PropertiesInterface<T> = ClientInterface & {
  GetAll(interfaceName: string): Promise<VariantObject<T>>;
  Get<TK extends keyof T>(interfaceName: string, propertyName: TK): Promise<VariantLike<T[TK]>>;
  Set<TK extends keyof T>(interfaceName: string, propertyName: TK, value: unknown): Promise<void>;
};

export type UnwrappedPropertiesInterface<T> = PropertiesInterface<T> & {
  GetAllUnwrapped(interfaceName: string): Promise<T>;
};
