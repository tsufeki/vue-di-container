vue-di-container
================

Dependency injection container for Vue (especially class components).

Installation
------------

```sh
npm install vue-di-container
```

Register the plugin:

```ts
import { VueDiContainer } from 'vue-di-container';

Vue.use(VueDiContainer);
```

Usage
-----

### Keys

Injectable dependencies are identified by keys. Key is either a class function
or an instance of `Token<T>`. Note that Typescript interfaces will not work.

### Defining services

To define injectable service class, use `@Service` decorator. When container
instantiates it, it will inject all constructor arguments (based on declared
parameter type or key provided with `@Inject` decorator) as well as properties
marked with `@Inject`.

```ts
import { Inject, Service, Token } from 'vue-di-container';

class ServiceA {}
class ServiceB {}
const TOKEN = new Token<number>('token');

@Service()
class ServiceC {

    @Inject() serviceA!: ServiceA;
    @Inject(ServiceB) serviceB!: any;
    @Inject(TOKEN) token!: number;
    foo!: ServiceA; // not injected as not decorated with @Inject

    constructor(
        serviceA: ServiceA, // injected with ServiceA
        @Inject(TOKEN) token: number,
    ) {}
}
```

### Providers

What actually will be injected into services and components is determined by
defined providers. Provider are set in component's options and are
inherited by child components (and only them). Services are constructed lazily,
only when needed.

```ts
@Component({
    diProvide: [
        // Construct instance of ServiceC, inject its dependencies.
        ServiceC,
        // Similar, but register under different key and override some arguments.
        { key: TOKEN, class: ServiceC, args: [ServiceA] },
        // Explicit value.
        { key: TOKEN, value: 7 },
        // Use the result of a function. All arguments must be provided.
        { key: ServiceB, factory: arg => { ... }, args: [TOKEN] },
        // Register existing service under different key.
        { key: TOKEN, aliasOf: ServiceA },
    ],
})
class ComponentA {}
```

Services that need to be available to all components should be set in Vue root:

```ts
new Vue({
    ...
    diProvide: [
        ...
    ],
    render: h => h(App),
}).$mount('#app');
```

### Injecting into components

Only property injection is supported on component classes. Alternatively, there
is an option for this.

```ts
@Component({})
class ComponentB {

    @Inject() serviceC!: ServiceC;
}

// or

@Component({
    diInject: {
        serviceC: ServiceC,
    },
})
class ComponentC {}
```

License
-------

MIT, see [LICENSE](LICENSE).
