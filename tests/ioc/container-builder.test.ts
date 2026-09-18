import { ContainerBuilder } from '../../src/ioc/container-builder';

const builder = await new ContainerBuilder();
builder.add('SomeToken').asFactory(() => 'SomeValue').singleton();