import 'reflect-metadata';
import { Ctor, Func } from './util';

export class Reflection {

    getParameterTypes(fun: Ctor<any> | Func<any>): (Ctor<any> | undefined)[] {
        if (Reflect && Reflect.getMetadata) {
            return (Reflect.getMetadata('design:paramtypes', fun) || []) as (Ctor<any> | undefined)[];
        }
        return [];
    }

    getPropertyType(cls: Ctor<any>, propertyName: string | symbol): Ctor<any> | undefined {
        if (Reflect && Reflect.getMetadata) {
            return Reflect.getMetadata('design:type', cls.prototype, propertyName) as Ctor<any> | undefined;
        }
    }
}
