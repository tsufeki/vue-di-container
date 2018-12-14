import { ArgKeys, Key, PropertyKeys } from './providers';
import { Reflection } from './reflection';
import { Ctor, Func } from './util';

const PARAMETER_INJECTIONS = Symbol('parameter injections');
const PROPERTY_INJECTIONS = Symbol('property injections');

interface NullablePropertyKeys {
    [name: string]: Key<any> | null;
}

interface DecoratedFunction extends Func<any> {
    [PARAMETER_INJECTIONS]?: ArgKeys;
}

interface DecoratedClass extends Ctor<any> {
    [PARAMETER_INJECTIONS]?: ArgKeys;
    [PROPERTY_INJECTIONS]?: NullablePropertyKeys;
}

export class Metadata {

    constructor(private reflection: Reflection) {}

    getParameterKeys(
        fun: DecoratedFunction | DecoratedClass,
        explicitKeys: ArgKeys = [],
    ): ArgKeys {
        const reflectionTypes = this.reflection.getParameterTypes(fun);
        const parameterInjections = fun[PARAMETER_INJECTIONS] || [];
        const keys = [];
        const maxIndex = Math.max(reflectionTypes.length, parameterInjections.length, explicitKeys.length);
        for (let i = 0; i < maxIndex; i++) {
            keys[i] = explicitKeys[i] || parameterInjections[i] || reflectionTypes[i];
        }

        return keys;
    }

    setParameterKey(fun: DecoratedFunction | DecoratedClass, index: number, key: Key<any>): void {
        const parameterInjections = fun[PARAMETER_INJECTIONS] || (fun[PARAMETER_INJECTIONS] = []);
        parameterInjections[index] = key;
    }

    getPropertyKeys(cls: DecoratedClass, explicitKeys: PropertyKeys = {}): PropertyKeys {
        const propertyInjections = cls[PROPERTY_INJECTIONS] || {};
        const keys: PropertyKeys = {};
        const merged: NullablePropertyKeys = Object.assign({}, propertyInjections, explicitKeys);
        for (const name of Object.keys(merged)) {
            const key = merged[name] || this.reflection.getPropertyType(cls, name) || null;
            if (key === null) {
                throw new Error('Property injection key missing');
            }
            keys[name] = key;
        }
        return keys;
    }

    setPropertyKey(cls: DecoratedClass, name: string, key: Key<any> | null): void {
        const propertyInjections = cls[PROPERTY_INJECTIONS] || (cls[PROPERTY_INJECTIONS] = {});
        propertyInjections[name] = key;
    }
}
