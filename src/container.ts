import { Key, Provider } from './providers';

export interface Definition<T> {
    readonly key: Key<T>;
    get(container: Container): T;
}

export interface ProviderResolver {
    resolve<T>(provider: Provider<T>): Definition<T> | undefined;
}

export class Container {

    private definitions = new Map<Key<any>, Definition<any>>();
    private values = new Map<Key<any>, any>();
    private resolvingKeys = new Set<Key<any>>();

    constructor(
        private parent: Container | undefined,
        private resolver: ProviderResolver,
    ) {}

    register<T = any>(provider: Provider<T>): void {
        const def = this.resolver.resolve(provider);
        if (def === undefined) {
            throw new Error('Malformed provider');
        }
        this.definitions.set(def.key, def);
    }

    get<T>(key: Key<T>): T {
        let value: T | undefined = this.values.get(key);
        if (value !== undefined) {
            return value;
        }

        const def: Definition<T> | undefined = this.definitions.get(key);
        if (def !== undefined) {
            if (this.resolvingKeys.has(key)) {
                const keys = Array.from(this.resolvingKeys.values())
                    .map(k => k.name)
                    .join('\'\n\'');
                throw new Error(`Circular dependency while resolving:\n'${keys}'`);
            }

            this.resolvingKeys.add(key);

            try {
                value = def.get(this);
            } finally {
                this.resolvingKeys.delete(key);
            }

            this.values.set(key, value);
            return value;
        }

        if (this.parent) {
            return this.parent.get(key);
        }

        throw new Error(`Dependency '${key.name}' not found`);
    }
}
