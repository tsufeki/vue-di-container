import 'jasmine';
import { Metadata } from '../src/metadata';
import { Token } from '../src/providers';
import { Reflection } from '../src/reflection';
import './helpers';

describe('Metadata', () => {

    const reflectionKey = new Token<{}>('reflectionKey');
    const decoratorKey = new Token<{}>('decoratorKey');
    const explicitKey = new Token<{}>('explicitKey');

    it('should return set parameter keys', () => {
        const fun = () => {};
        const reflection = jasmine.createSpyObj<Reflection>('Reflection', ['getParameterTypes']);
        const metadata = new Metadata(reflection);

        reflection.getParameterTypes.and.returnValue([reflectionKey, reflectionKey, reflectionKey]);
        metadata.setParameterKey(fun, 0, decoratorKey);
        metadata.setParameterKey(fun, 1, decoratorKey);
        const explicitKeys = [undefined, explicitKey];

        expect(metadata.getParameterKeys(fun, explicitKeys))
            .toHaveSameElements([decoratorKey, explicitKey, reflectionKey]);
    });

    it('should return set property keys', () => {
        class Cls {}
        const reflection = jasmine.createSpyObj<Reflection>('Reflection', ['getPropertyType']);
        const metadata = new Metadata(reflection);

        reflection.getPropertyType.and.returnValue(reflectionKey);
        metadata.setPropertyKey(Cls, 'a', decoratorKey);
        metadata.setPropertyKey(Cls, 'b', decoratorKey);
        metadata.setPropertyKey(Cls, 'c', null);
        const explicitKeys = { a: explicitKey };

        expect(metadata.getPropertyKeys(Cls, explicitKeys))
            .toHaveSameProps({ a: explicitKey, b: decoratorKey, c: reflectionKey });
    });

    it('should throw on missing property key', () => {
        class Cls {}
        const reflection = jasmine.createSpyObj<Reflection>('Reflection', ['getPropertyType']);
        const metadata = new Metadata(reflection);

        reflection.getPropertyType.and.returnValue(undefined);
        metadata.setPropertyKey(Cls, 'a', null);

        expect(() => metadata.getPropertyKeys(Cls)).toThrowError();
    });
});
