export { Key, Provider, Token } from './providers';
export { Inject, Service } from './decorators';
export { Container } from './container';

import { Container, ProviderResolver } from './container';
import { Inject } from './decorators';
import {
    AliasProviderResolver,
    ChainProviderResolver,
    ClassProviderResolver,
    FactoryProviderResolver,
    ValueProviderResolver,
} from './definitions';
import { Metadata } from './metadata';
import { Reflection } from './reflection';
import './vue';
import { VueDiContainerConstructor } from './vue-plugin';

const reflection = new Reflection();
const metadata = new Metadata(reflection);
Inject.metadata = metadata;

export const defaultResolver: ProviderResolver = new ChainProviderResolver([
    new ValueProviderResolver(),
    new AliasProviderResolver(),
    new FactoryProviderResolver(),
    new ClassProviderResolver(metadata),
]);

export const VueDiContainer = new VueDiContainerConstructor(
    parent => new Container(parent, defaultResolver),
    metadata,
);
