import { ApiTags } from '@nestjs/swagger';
import {
  ComponentsObject,
  PathItemObject,
  ReferenceObject,
  ResponseObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ArrayElement } from '../types/common';

export const API_TAGS = ['Authentication', 'Device', 'Metadata', 'Status', 'Config', 'Network'] as const;
export type RpiApiTag = ArrayElement<typeof API_TAGS>;
export const RpiApiTags = ApiTags as (...tags: RpiApiTag[]) => ReturnType<typeof ApiTags>;

type Methods = keyof Pick<PathItemObject, 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'>;
export const ALL_METHODS: Methods[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export const ErrorSchema: SchemaObject = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
    statusCode: {
      type: 'number',
    },
  },
  required: ['message', 'statusCode'],
};

function createErrorResponse(
  description: string,
  statusCode: number,
  message: string | string[] = description,
  error?: string,
): ResponseObject {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Error',
        },
        example: {
          statusCode,
          message,
          error,
        },
      },
    },
  };
}

export function getResponseRef(name: AdditionalComponentNames): ReferenceObject {
  return { $ref: `#/components/responses/${name}` };
}

const responses = {
  InternalServerError: createErrorResponse('Internal Server Error', 500),
  NotAuthorized: createErrorResponse('Unauthorized', 401),
  InvalidData: createErrorResponse('Bad Request', 400, [], 'Bad Request'),
} as const;

export const additionalComponents: ComponentsObject = {
  schemas: { Error: ErrorSchema },
  responses,
};

type AdditionalComponentNames = keyof typeof responses;
