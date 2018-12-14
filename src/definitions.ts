import { Container, Definition, ProviderResolver } from './container';
import { Metadata } from './metadata';
import {
    AliasProvider,
    ArgKeys,
    FactoryProvider,
    FullClassProvider,
    Key,
    PropertyKeys,
    Provider,
    ShortClassProvider,
    ValueProvider,
} from './providers';
import { Ctor, Func } from './util';

export class ChainProviderResolver implements ProviderResolver {

    constructor(private readonly resolvers: ProviderResolver[]) {}

    resolve<T>(provider: Provider<T>): Definition<T> | undefined {
        for (const resolver of this.resolvers) {
            const def = resolver.resolve(provider);
            if (def) {
                return def;
            }
        }
    }
}

class ValueDefinition<T> implements Definition<T> {

    constructor(
        readonly key: Key<T>,
        private readonly value: T,
    ) {}

    get(container: Container): T {
        return this.value;
    }
}

export class ValueProviderResolver implements ProviderResolver {

    private isValueProvider<T>(provider: Provider<T>): provider is ValueProvider<T> {
        return (provider as ValueProvider<T>).value !== undefined;
    }

    resolve<T>(provider: Provider<T>): Definition<T> | undefined {
        if (this.isValueProvider(provider)) {
            return new ValueDefinition(provider.key, provider.value);
        }
    }
}

class ClassDefinition<T> implements Definition<T> {

    constructor(
        readonly key: Key<T>,
        private readonly cls: Ctor<T>,
        private readonly args: ArgKeys,
        private readonly props: PropertyKeys,
    ) {}

    get(container: Container): T {
        const argsValues = this.args.map(key => key ? container.get(key) : undefined);
        const instance = new this.cls(...argsValues);
        for (const prop of Object.keys(this.props)) {
            instance[prop as keyof T] = container.get(this.props[prop]);
        }
        return instance;
    }
}

export class ClassProviderResolver implements ProviderResolver {

    constructor(private metadata: Metadata) {}

    private isCtor<T>(providerOrKey: Provider<T> | Key<T>): providerOrKey is Ctor<T> {
        return typeof providerOrKey === 'function';
    }

    private isFullClassProvider<T>(provider: Provider<T>): provider is FullClassProvider<T> {
        return !!(provider as FullClassProvider<T>).class;
    }

    resolve<T>(provider: Provider<T>): Definition<T> | undefined {
        let key: Key<T> | undefined;
        let cls: Ctor<T> | undefined;
        let args: ArgKeys = [];
        let props: PropertyKeys = {};

        if (this.isCtor(provider)) {
            key = cls = provider;
        } else if (this.isFullClassProvider(provider)) {
            key = provider.key;
            cls = provider.class;
            args = provider.args || [];
            props = provider.props || {};
        } else if (this.isCtor(provider.key)) {
            key = cls = provider.key;
            args = (provider as ShortClassProvider<T>).args || [];
            props = (provider as ShortClassProvider<T>).props || {};
        }

        if (key && cls) {
            const argKeys = this.metadata.getParameterKeys(cls, args);
            const propKeys = this.metadata.getPropertyKeys(cls, props);
            return new ClassDefinition(key, cls, argKeys, propKeys);
        }
    }
}

class FactoryDefinition<T> implements Definition<T> {

    constructor(
        readonly key: Key<T>,
        private readonly factory: Func<T>,
        private readonly args: ArgKeys,
    ) {}

    get(container: Container): T {
        const argsValues = this.args.map(key => key ? container.get(key) : undefined);
        const factory = this.factory;
        const instance = factory(...argsValues);
        return instance;
    }
}

export class FactoryProviderResolver implements ProviderResolver {

    private isFactoryProvider<T>(provider: Provider<T>): provider is FactoryProvider<T> {
        return !!(provider as FactoryProvider<T>).factory;
    }

    resolve<T>(provider: Provider<T>): Definition<T> | undefined {
        if (this.isFactoryProvider(provider)) {
            return new FactoryDefinition(provider.key, provider.factory, provider.args || []);
        }
    }
}

class AliasDefinition<T> implements Definition<T> {

    constructor(
        readonly key: Key<T>,
        private readonly aliasOf: Key<T>,
    ) {}

    get(container: Container): T {
        return container.get(this.aliasOf);
    }
}

export class AliasProviderResolver implements ProviderResolver {

    private isAliasProvider<T>(provider: Provider<T>): provider is AliasProvider<T> {
        return !!(provider as AliasProvider<T>).aliasOf;
    }

    resolve<T>(provider: Provider<T>): Definition<T> | undefined {
        if (this.isAliasProvider(provider)) {
            return new AliasDefinition(provider.key, provider.aliasOf);
        }
        return undefined;
    }
}
