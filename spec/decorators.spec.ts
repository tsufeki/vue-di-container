import 'jasmine';
import { Inject, Service } from '../src/decorators';
import { Metadata } from '../src/metadata';
import { Token } from '../src/providers';

describe('Inject decorator', () => {

    let oldMetadata: Metadata | undefined;
    beforeEach(() => oldMetadata = Inject.metadata);
    afterEach(() => Inject.metadata = oldMetadata);

    const key = new Token<string>();

    it('should mark parameter for injection', () => {
        Inject.metadata = jasmine.createSpyObj<Metadata>('Metadata', ['setParameterKey']);

        @Service()
        class Cls {
            constructor(@Inject(key) arg: string) {}
        }

        expect(Inject.metadata.setParameterKey).toHaveBeenCalledWith(Cls, 0, key);
    });

    it('should mark property for injection', () => {
        Inject.metadata = jasmine.createSpyObj<Metadata>('Metadata', ['setPropertyKey']);

        @Service()
        class Cls {
            @Inject(key) prop!: string;
        }

        expect(Inject.metadata.setPropertyKey).toHaveBeenCalledWith(Cls, 'prop', key);
    });

    it('should mark property for injection (without key)', () => {
        Inject.metadata = jasmine.createSpyObj<Metadata>('Metadata', ['setPropertyKey']);

        @Service()
        class Dep {}

        @Service()
        class Cls {
            @Inject() prop!: Dep;
        }

        expect(Inject.metadata.setPropertyKey).toHaveBeenCalledWith(Cls, 'prop', null);
    });

    it('should throw when used on unsupported target', () => {
        expect(() => {
            class Cls {
                @Inject(key)
                method() {}
            }
            return Cls;
        }).toThrowError();
    });
});
