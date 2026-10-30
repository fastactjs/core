import fp from 'fastify-plugin';
import Ajv from 'ajv';
import { ValidationError } from './errors.js';

const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
  removeAdditional: true,
});
const compilersCache = new Map<any, any>();

export const fastactValidationPlugin = fp(async (fastify) => {
  fastify.decorateRequest('validateWith', async function (schema: any) {
    const request = this as any;

    let validateFn = compilersCache.get(schema);

    if (!validateFn) {
      validateFn = ajv.compile(schema);
      compilersCache.set(schema, validateFn);
    }

    const isValid = validateFn(request.body);

    if (!isValid) {
      throw new ValidationError(validateFn.errors);
    }

    return request.body;
  });
});
