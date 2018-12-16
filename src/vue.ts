import Vue from 'vue';
import { Container } from './container';
import { PropertyKeys, Provider } from './providers';

declare module 'vue/types/vue' {
    interface Vue {
        $diContainer: Container;
    }
}

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue> {
        diContainer?: Container;
        diProvide?: Provider<any>[];
        diInject?: PropertyKeys;
    }
}
