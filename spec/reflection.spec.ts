import 'jasmine';
import { Reflection } from '../src/reflection';

describe('Reflection', () => {

    const Decorator = (...args: any[]) => {};
    class A {}

    @Decorator
    class B {
        @Decorator pa!: A;
        @Decorator ps!: string;

        constructor(a: A, s: string) {}
    }

    const reflection = new Reflection();

    it('should return class property type', () => {
        expect(reflection.getPropertyType(B, 'pa')).toBe(A);
    });

    it('should return string property type', () => {
        expect(reflection.getPropertyType(B, 'ps')).toBe(String);
    });

    it('should return constuctor parameter types', () => {
        expect(reflection.getParameterTypes(B)).toEqual([A, String]);
    });
});
