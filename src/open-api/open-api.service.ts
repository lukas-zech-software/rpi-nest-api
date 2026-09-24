import { merge } from 'lodash';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { additionalComponents, ALL_METHODS, API_TAGS, getResponseRef } from './constants';
import { apiConfig } from '../config/config';
import { ConfigType } from '@nestjs/config';

const API_SPEC_FILE_NAME = 'rpi-nest-api.spec.json';

export function initOpenApi(app: INestApplication, config: ConfigType<typeof apiConfig>) {
  const localServerUrl = `${config.protocol}://${config.hostname}:${config.port}`;

  const builder = new DocumentBuilder()
    .setTitle('rpi-nest-api')
    .setDescription('This API provides access to all functionalities of the Raspberry-Nest device it runs on')
    .setVersion('0.0.0')
    .addServer(localServerUrl, 'This rpi-nest device')
    .addBearerAuth({
      type: 'http',
      description: 'A bearer token in the format of a JWS and conforms to the specifications included in RFC8725.',
    });

  API_TAGS.forEach((x) => builder.addTag(x));

  const openAPIObject = SwaggerModule.createDocument(app, builder.build());

  addDefaultResponses(openAPIObject);
  fixBrokenEnumArrays(openAPIObject);

  writeFileSync(API_SPEC_FILE_NAME, JSON.stringify(openAPIObject, null, 2));
  SwaggerModule.setup('api-docs', app, openAPIObject);
}

/**
 * Add default responses to all operation to avoid boilerplate in adding them manually to each controller method
 */
function fixBrokenEnumArrays(openAPIObject: OpenAPIObject) {
  // Workaround for enum arrays
  //   https://github.com/nestjs/swagger/issues/1676
  if (openAPIObject?.components?.schemas) {
    for (const schemaKey in openAPIObject.components.schemas) {
      const schema = openAPIObject.components.schemas[schemaKey];
      if ('type' in schema && schema.type === 'object' && schema.properties) {
        for (const schemaPropKey in schema.properties) {
          const property = schema.properties[schemaPropKey];
          if ('items' in property && 'enum' in property) {
            delete property.enum;
          }
        }
      }
    }
  }
}
/**
 * Add default responses to all operation to avoid boilerplate in adding them manually to each controller method
 */
function addDefaultResponses(openAPIObject: OpenAPIObject) {
  merge(openAPIObject.components, additionalComponents);

  Object.keys(openAPIObject.paths).forEach((path) => {
    ALL_METHODS.forEach((method) => {
      const operation = openAPIObject.paths[path][method];
      if (operation) {
        // If a security requirement is defined on the operation it will return a 401 if no authorization is provided
        if (operation.security !== undefined) {
          operation.responses['401'] ??= getResponseRef('NotAuthorized');
        }

        // All routes that expect a payload may return a 400 if that payload is malformed
        if (method !== 'get') {
          operation.responses['400'] ??= getResponseRef('InvalidData');
        }

        // All routes may return a 500 if something goes wrong
        operation.responses['500'] ??= getResponseRef('InternalServerError');
      }
    });
  });
}
