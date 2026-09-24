export type PartialMockClass<T> = Partial<MockClass<T>>;

export type MockClass<T> = {
  [key in keyof T]: jest.Mock;
};

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

export type Dictionary<T> = {
  [index: string]: T;
};

export type Modify<T, R> = Omit<T, keyof R> & R;
export type ModifyD<T, R extends Partial<T>> = {
  [prop in keyof T]?: R[prop] | never;
};
export type Deletable<T> = {
  [prop in keyof T]?: T[prop] | null;
};
