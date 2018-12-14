import 'jasmine';
import { decorator } from '../src/util';

describe('decorator', () => {

    it('should dispatch based on decorated target', () => {

        const log: any = {};
        const logger = (kind: any) => (...args: any[]) => { log[kind] = args; };
        const Decorator = (kind: string) => decorator({
            class: logger(kind),
            property: logger(kind),
            method: logger(kind),
            parameter: logger(kind),
            ctorParameter: logger(kind),
            else: fail,
        });

        @Decorator('class')
        class Cls {
            @Decorator('property')
            prop = 1;

            constructor(@Decorator('ctorParameter') arg: string) {}

            @Decorator('method')
            meth(@Decorator('parameter') arg: {}) {}
        }

        expect(log).toEqual({
            class: [Cls],
            property: [Cls, 'prop'],
            method: [Cls, 'meth', { value: Cls.prototype.meth, writable: true, enumerable: false, configurable: true }],
            parameter: [Cls, 'meth', 0],
            ctorParameter: [Cls, 0],
        });
    });

    it('should call else handler', () => {

        let classCalled = false;
        let elseCalled = false;
        const Decorator = decorator({
            class: () => { classCalled = true; },
            else: () => { elseCalled = true; },
        });

        @Decorator
        class Cls {
            @Decorator prop: any;
        }

        expect(classCalled).toBe(true);
        expect(elseCalled).toBe(true);
        expect(typeof Cls).toBe('function');
    });
});
