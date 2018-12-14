import 'jasmine';
import { Container, Definition, ProviderResolver } from '../src/container';
import {
    AliasProviderResolver,
    ChainProviderResolver,
    ClassProviderResolver,
    FactoryProviderResolver,
    ValueProviderResolver,
} from '../src/definitions';
import { Metadata } from '../src/metadata';
import { ClassProvider, Provider, Token } from '../src/providers';

describe('ValueProviderResolver', () => {

    const resolver = new ValueProviderResolver();
    const key = new Token<string>();

    it('should return back the value', () => {
        const value = 'foo';
        const container = jasmine.createSpyObj<Container>('Container', ['get']);

        const def = resolver.resolve({ key, value });

        expect(def).toBeDefined();
        expect(def!.key).toBe(key);
        expect(def!.get(container)).toBe(value);
    });

    it('should ignore unknown provider', () => {
        const def = resolver.resolve({ key } as Provider<string>);
        expect(def).toBeUndefined();
    });
});

describe('FactoryProviderResolver', () => {

    const resolver = new FactoryProviderResolver();
    const key = new Token<string>();
    const value = 'foo';

    it('should call the factory', () => {
        const argKey = new Token<string>();
        const argValue = 'bar';
        const container = jasmine.createSpyObj<Container>('Container', ['get']);
        container.get.and.returnValue(argValue);
        const factory = jasmine.createSpy('factory').and.returnValue(value);

        const def = resolver.resolve({ key, factory, args: [argKey] });

        expect(def).toBeDefined();
        expect(def!.key).toBe(key);
        expect(def!.get(container)).toBe(value);
        expect(container.get).toHaveBeenCalledWith(argKey);
        expect(factory).toHaveBeenCalledWith(argValue);
    });

    it('should ignore unknown provider', () => {
        const def = resolver.resolve({ key, value });
        expect(def).toBeUndefined();
    });
});

describe('ClassProviderResolver', () => {

    class Cls {
        bar: any;
        constructor(public foo: any) {}
    }

    const metadata = jasmine.createSpyObj<Metadata>('Metadata', ['getParameterKeys', 'getPropertyKeys']);
    const resolver = new ClassProviderResolver(metadata);
    const key = new Token<Cls>();

    const argKey = new Token<string>();
    const argValue = 'FOO';
    const propKey = new Token<string>();
    const propValue = 'BAR';

    const providers: ClassProvider<Cls>[] = [
        { key, class: Cls, args: [argKey], props: { bar: propKey } },
        { key, class: Cls },
        { key: Cls, args: [argKey] },
        { key: Cls },
        Cls,
    ];

    providers.forEach((provider, i) => {
        it(`should instantiate the class #${i}`, () => {
            const container = jasmine.createSpyObj<Container>('Container', ['get']);
            container.get.and.returnValues(argValue, propValue);
            metadata.getParameterKeys.and.returnValue([argKey]);
            metadata.getPropertyKeys.and.returnValue({ bar: propKey });

            const def = resolver.resolve(provider);

            expect(def).toBeDefined();
            expect(def!.key === key || def!.key === Cls).toBe(true);

            const obj = def!.get(container);

            expect(obj instanceof Cls).toBe(true);
            expect(obj.foo).toBe(argValue);
            expect(obj.bar).toBe(propValue);
        });
    });

    it('should ignore unknown provider', () => {
        const def = resolver.resolve({ key, value: 1 });
        expect(def).toBeUndefined();
    });
});

describe('ChainProviderResolver', () => {

    const providerA = {} as Provider<any>;
    const definitionA = {} as Definition<any>;
    const resolverA: ProviderResolver = {
        resolve: p => p === providerA ? definitionA : undefined,
    };

    const providerB = {} as Provider<any>;
    const definitionB = {} as Definition<any>;
    const resolverB: ProviderResolver = {
        resolve: p => (p === providerA || p === providerB) ? definitionB : undefined,
    };

    const providerC = {} as Provider<any>;

    const resolver = new ChainProviderResolver([resolverA, resolverB]);

    it('should return first matching resolver\'s definition', () => {
        expect(resolver.resolve(providerA)).toBe(definitionA);
        expect(resolver.resolve(providerB)).toBe(definitionB);
        expect(resolver.resolve(providerC)).toBeUndefined();
    });
});

describe('AliasProviderResolver', () => {

    const resolver = new AliasProviderResolver();
    const key = new Token<string>();
    const aliasedKey = new Token<string>();

    it('should return the aliased value', () => {
        const value = 'foo';
        const container = jasmine.createSpyObj<Container>('Container', ['get']);
        container.get.and.returnValue(value);

        const def = resolver.resolve({ key, aliasOf: aliasedKey });

        expect(def).toBeDefined();
        expect(def!.key).toBe(key);
        expect(def!.get(container)).toBe(value);
        expect(container.get).toHaveBeenCalledWith(aliasedKey);
    });

    it('should ignore unknown provider', () => {
        const def = resolver.resolve({ key } as Provider<string>);
        expect(def).toBeUndefined();
    });
});
