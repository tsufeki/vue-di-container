import { Metadata } from './metadata';
import { Key, Token as _ } from './providers';
import { Ctor, decorator } from './util';

export const Inject = Object.assign((key?: Key<any>): PropertyDecorator & ParameterDecorator => {
    return decorator({
        ctorParameter: (cls, index) => {
            if (Inject.metadata && key !== undefined) {
                Inject.metadata.setParameterKey(cls, index, key);
                Inject.hooks.forEach(hook => hook(cls));
            }
        },
        property: (cls, name) => {
            if (Inject.metadata && typeof name === 'string') {
                Inject.metadata.setPropertyKey(cls, name, key || null);
                Inject.hooks.forEach(hook => hook(cls));
            }
        },
        else: () => {
            throw new Error('Unsupported injection target');
        },
    });
}, {
    metadata: undefined as Metadata | undefined,
    hooks: [] as ((cls: Ctor<any>) => void)[],
});

export const Service = Object.assign((): ClassDecorator => {
    return decorator({
        class: cls => Service.hooks.forEach(hook => hook(cls)),
    });
}, {
    hooks: [] as ((cls: Ctor<any>) => void)[],
});
