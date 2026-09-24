import { ClassProvider, Type } from '@nestjs/common';

export function isDefined<T>(x: T): x is T {
  return x !== undefined;
}

/**
 * Hardware dependent services can only work on a real device
 * Therefore such services must provide a mock implementation for all other environments
 */
export interface IMockedService<T> {
  implementation: Type<T>;
  mock: Type<T>;
}

/**
 * Register either production or mock implementation on
 * the same provide token
 */
export function registerServiceWithMock<T>(mockedService: IMockedService<T>, isProduction: boolean): ClassProvider {
  return {
    provide: mockedService.implementation,
    useClass: isProduction ? mockedService.implementation : mockedService.mock,
  };
}

/**
 * Helper function to create exports for services with mock implementations
 */
export function getServicesWithMock<T>(implementation: Type<T>, mock: Type<T>): IMockedService<T> {
  return {
    implementation,
    mock,
  };
}
