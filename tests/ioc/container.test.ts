import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from '../../src/ioc/container';
import { FastAct } from '../../src';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe('register', () => {
    it('registers and resolves a dependency', () => {
      const userService = { name: 'John' };
      container.register('userService', () => userService, []);
      expect(container.get('userService')).toBe(userService);
    });

    it('passes resolved dependencies to the factory', () => {
      container.registerValue('config', { prefix: 'user-' });
      container.register(
        'userService',
        (config) => ({ name: `${config.prefix}42` }),
        ['config']
      );

      expect(container.get('userService')).toEqual({ name: 'user-42' });
    });

    it('returns the same instance for singleton dependencies', () => {
      let factoryCalls = 0;
      container.register(
        'service',
        () => {
          factoryCalls += 1;
          return {};
        },
        []
      );

      const first = container.get('service');
      const second = container.get('service');

      expect(second).toBe(first);
      expect(factoryCalls).toBe(1);
    });

    it('creates a new instance for transient dependencies', () => {
      container.register('service', () => ({}), [], 'transient');

      expect(container.get('service')).not.toBe(container.get('service'));
    });

    it('throws when resolving an unknown dependency', () => {
      expect(() => container.get('missing')).toThrow(
        'Dependency missing not found'
      );
    });

    it('detects circular dependencies', () => {
      container.register('first', (second) => second, ['second']);
      container.register('second', (first) => first, ['first']);

      expect(() => container.get('first')).toThrow(
        'Circular dependency detected: first -> second -> first'
      );
    });

    it('clears a cached instance when the dependency is re-registered', () => {
      container.register('service', () => 'first');
      expect(container.get('service')).toBe('first');

      container.register('service', () => 'second');

      expect(container.get('service')).toBe('second');
    });
  });

  describe('registerValue', () => {
    it('registers a ready singleton value', () => {
      const config = { environment: 'test' };

      container.registerValue('config', config);

      expect(container.get('config')).toBe(config);
    });
  });

  describe('scoped dependencies', () => {
    it('returns one instance per scope', () => {
      container.register('request', () => ({}), [], 'scoped');
      const firstScope = container.createScope('first');
      const secondScope = container.createScope('second');

      expect(firstScope.get('request')).toBe(firstScope.get('request'));
      expect(firstScope.get('request')).not.toBe(secondScope.get('request'));
    });

    it('requires a scope identifier', () => {
      container.register('request', () => ({}), [], 'scoped');

      expect(() => container.get('request')).toThrow(
        'Scope ID required for request'
      );
    });

    it('clears the current scope cache', () => {
      container.register('request', () => ({}), [], 'scoped');
      const scope = container.createScope('request-1');
      const first = scope.get('request');

      scope.clear();

      expect(scope.get('request')).not.toBe(first);
    });

    it('does not allow a singleton to depend on a scoped dependency', () => {
      container.register('request', () => ({}), [], 'scoped');
      container.register('service', (request) => request, ['request']);

      expect(() => container.get('service')).toThrow(
        'Singleton dependency chain cannot include scoped dependency request'
      );
    });
  });
});
