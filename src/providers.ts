import { Ctor, Func } from './util';

export class Token<T> {
    constructor(readonly name?: string) {}
}

export type Key<T> = Ctor<T> | Token<T>;

export interface ValueProvider<T> {
    key: Key<T>;
    value: any;
}

export type ArgKeys = (Key<any> | undefined)[];

export interface PropertyKeys {
    [name: string]: Key<any>;
}

export interface FullClassProvider<T> {
    key: Key<T>;
    class: Ctor<T>;
    args?: ArgKeys;
    props?: PropertyKeys;
}

export interface ShortClassProvider<T> {
    key: Ctor<T>;
    args?: ArgKeys;
    props?: PropertyKeys;
}

export type ClassProvider<T> = FullClassProvider<T> | ShortClassProvider<T> | Ctor<T>;

export interface FactoryProvider<T> {
    key: Key<T>;
    factory: Func<T>;
    args?: ArgKeys;
}

export interface AliasProvider<T> {
    key: Key<T>;
    aliasOf: Key<T>;
}

export type Provider<T> = ClassProvider<T> | ValueProvider<T> | FactoryProvider<T> | AliasProvider<T>;
