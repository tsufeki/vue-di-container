export type Ctor<T> = new (...args: any[]) => T;
export type Func<T> = (...args: any[]) => T;

export function decorator(decorate: {
    class?: <T>(cls: Ctor<T>) => Ctor<T> | void;
    property?: (cls: Ctor<any>, name: string | symbol) => void;
    method?: <T>(
        cls: Ctor<any>,
        name: string | symbol,
        descr: TypedPropertyDescriptor<T>,
    ) => TypedPropertyDescriptor<T> | void;
    parameter?: (cls: Ctor<any>, name: string | symbol, index: number) => void;
    ctorParameter?: (cls: Ctor<any>, index: number) => void;
    else?: () => void;
}): ClassDecorator & PropertyDecorator & MethodDecorator & ParameterDecorator {
    return (
        target?: Ctor<any> | object,
        propName?: string | symbol | undefined,
        indexOrProp?: number | TypedPropertyDescriptor<any> | undefined,
    ): any => {
        if (
            decorate.class &&
            typeof target === 'function' &&
            propName === undefined &&
            indexOrProp === undefined
        ) {
            return decorate.class(target as Ctor<any>);
        }

        if (
            decorate.property &&
            typeof target === 'object' &&
            (typeof propName === 'string' || typeof propName === 'symbol') &&
            indexOrProp === undefined
        ) {
            return decorate.property((target.constructor || target) as Ctor<any>, propName);
        }

        if (
            decorate.method &&
            typeof target === 'object' &&
            (typeof propName === 'string' || typeof propName === 'symbol') &&
            typeof indexOrProp === 'object'
        ) {
            return decorate.method((target.constructor || target) as Ctor<any>, propName, indexOrProp);
        }

        if (
            decorate.parameter &&
            typeof target === 'object' &&
            (typeof propName === 'string' || typeof propName === 'symbol') &&
            typeof indexOrProp === 'number'
        ) {
            return decorate.parameter((target.constructor || target) as Ctor<any>, propName, indexOrProp);
        }

        if (
            decorate.ctorParameter &&
            typeof target === 'function' &&
            propName === undefined &&
            typeof indexOrProp === 'number'
        ) {
            return decorate.ctorParameter(target as Ctor<any>, indexOrProp);
        }

        if (decorate.else) {
            decorate.else();
        }
    };
}
