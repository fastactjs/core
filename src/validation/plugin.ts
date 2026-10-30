import fp from 'fastify-plugin';
import Ajv from 'ajv';
import { ValidationError } from './errors';

const ajv = new Ajv({ coerceTypes: true, useDefaults: true, removeAdditional: true });
const compilersCache = new Map<any, any>();

export const fastactValidationPlugin = fp(async (fastify) => {
  // Регистрируем метод в прототип запроса Fastify
  fastify.decorateRequest('validateWith', async function (schema: any) {
    const request = this as any;
    
    let validateFn = compilersCache.get(schema);
    if (!validateFn) {
      validateFn = ajv.compile(schema);
      compilersCache.set(schema, validateFn);
    }

    // Валидируем body (или можно расширить до query/params)
    const isValid = validateFn(request.body);

    if (!isValid) {
      // Выкидываем кастомную ошибку пакета validation
      throw new ValidationError(validateFn.errors);
    }

    return request.body;
  });
});
