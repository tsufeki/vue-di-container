import 'jasmine';

import { createLocalVue, mount } from '@vue/test-utils';
import { CreateElement } from 'vue';
import Component from 'vue-class-component';
import { Inject, Token, VueDiContainer } from '../src';

describe('vue-plugin', () => {

    const key = new Token<string>();
    const value = 'foo';

    it('should inject into pure JS component', () => {
        const Vue = createLocalVue();
        Vue.use(VueDiContainer);

        const child = Vue.component('foo', {
            render: h => h('div'),
            diInject: {
                injected: key,
            },
        });

        const parent = Vue.component('bar', {
            render: h => h(child),
            diProvide: [
                { key, value },
            ],
        });

        expect(mount(parent, { localVue: Vue }).vm.$children[0].$data.injected).toBe(value);
    });

    it('should inject into class based component', () => {
        const Vue = createLocalVue();
        Vue.use(VueDiContainer);

        @Component({})
        class Child extends Vue {
            @Inject(key) injected!: string;
            render(h: CreateElement) { return h('div'); }
        }

        @Component({
            diProvide: [
                { key, value },
            ],
        })
        class Parent extends Vue {
            render(h: CreateElement) { return h(Child); }
        }

        expect(mount(Parent, { localVue: Vue }).vm.$children[0].$data.injected).toBe(value);
    });

    it('should inject providers only to descendant components', () => {
        const Vue = createLocalVue();
        Vue.use(VueDiContainer);

        @Component({
            diProvide: [
                { key, value },
            ],
        })
        class ChildA extends Vue {
            render(h: CreateElement) { return h('div'); }
        }

        @Component({})
        class ChildB extends Vue {
            @Inject(key) injected!: string;
            render(h: CreateElement) { return h('div'); }
        }

        @Component({})
        class Parent extends Vue {
            render(h: CreateElement) { return h('div', [h(ChildA), h(ChildB)]); }
        }

        expect(() => {
            const error = console.error;
            console.error = () => {};
            try {
                mount(Parent, { localVue: Vue });
            } finally {
                console.error = error;
            }
        }).toThrowError();
    });
});
