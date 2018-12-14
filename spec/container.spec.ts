import 'jasmine';
import { Container, ProviderResolver } from '../src/container';
import { Provider, Token } from '../src/providers';

describe('Container', () => {

    const key = new Token<{}>();
    const value = {};
    const provider: Provider<{}> = { key, value };

    function makeResolver(get: (c: Container) => typeof value) {
        return {
            resolve: () => ({ key, get }),
        } as any as ProviderResolver;
    }

    it('should throw on unrecognized provider', () => {
        const resolver: ProviderResolver = { resolve: () => undefined };
        const container = new Container(undefined, resolver);
        expect(() => container.register(provider)).toThrowError();
    });

    it('should return value', () => {
        const container = new Container(undefined, makeResolver(() => value));
        container.register(provider);

        expect(container.get(key)).toBe(value);
    });

    it('should throw on unknown key', () => {
        const container = new Container(undefined, makeResolver(() => value));
        container.register(provider);
        const nonExistentKey = new Token<typeof value>();

        expect(() => container.get(nonExistentKey)).toThrowError();
    });

    it('should cache value for given key', () => {
        const newValue = {};
        const get = jasmine.createSpy('get').and.returnValues(value, newValue);
        const container = new Container(undefined, makeResolver(get));
        container.register(provider);

        expect(container.get(key)).toBe(value);
        expect(container.get(key)).toBe(value);
    });

    it('should fall back to parent', () => {
        const parent = new Container(undefined, makeResolver(() => value));
        parent.register(provider);
        const container = new Container(parent, makeResolver(() => ({})));

        expect(container.get(key)).toBe(value);
    });

    it('should throw on circular dependency', () => {
        const container = new Container(undefined, makeResolver(c => c.get(key)));
        container.register(provider);

        expect(() => container.get(key)).toThrowError(/circular/i);
    });
});
