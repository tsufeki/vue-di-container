import Vue_, { ComponentOptions } from 'vue';
import { Container } from './container';
import { Inject, Service } from './decorators';
import { Metadata } from './metadata';
import { Ctor } from './util';

/* A hack to retain metadata from original class when using @Component decorator. */
function setupVueClassComponentCompat() {

    interface VueClassComponentDecorated extends Ctor<any> {
        __decorators__?: ((options: any) => void)[];
    }

    Inject.hooks.push((cls: VueClassComponentDecorated) => {
        let decorators = cls.__decorators__;
        if (decorators === undefined) {
            decorators = cls.__decorators__ = [];
        }
        decorators.push(options => options[ORIGINAL_CLASS] = cls);
    });

    Service.hooks.push((cls: VueClassComponentDecorated) => {
        delete cls.__decorators__;
    });
}

const ORIGINAL_CLASS = '_diContainer_originalClass';
setupVueClassComponentCompat();

export class VueDiContainerConstructor {

    constructor(
        private containerFactory: (parent?: Container) => Container,
        private metadata: Metadata,
    ) {}

    private setupComponent(component: Vue_) {
        const { $parent, $options } = component;
        let container = $options.diContainer;

        if (container === undefined) {
            container = this.containerFactory($parent && $parent.$diContainer);
        }

        for (const provider of $options.diProvide || []) {
            container.register(provider);
        }

        component.$diContainer = container;
    }

    private getInjections(options: ComponentOptions<Vue_>, container?: Container) {
        if (!container) {
            return {};
        }

        const data: any = {};
        const originalClass = (options as any)[ORIGINAL_CLASS];
        let propertyKeys = options.diInject || {};
        if (typeof originalClass === 'function') {
            propertyKeys = this.metadata.getPropertyKeys(originalClass, propertyKeys);
        }
        for (const name of Object.keys(propertyKeys)) {
            data[name] = container.get(propertyKeys[name]);
        }
        return data;
    }

    install(Vue: typeof Vue_, options?: {}): void {
        const plugin = this;
        Vue.mixin({
            beforeCreate() {
                plugin.setupComponent(this);
            },
            data() {
                return plugin.getInjections(this.$options, this.$diContainer);
            },
        });
    }
}
