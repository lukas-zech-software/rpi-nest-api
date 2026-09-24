import { Injectable } from '@nestjs/common';
import { MessageBus, ProxyObject, systemBus as getSystemBus } from 'dbus-final';
import { getServicesWithMock } from '../../types/utils';
import {
  IntrospectableInterface,
  MethodInterface,
  MethodsObject,
  PropertiesInterface,
  UnwrappedPropertiesInterface,
} from '../types';
import { unwrapVariantObject } from '../utils';

export interface IDBusProxy {
  getMethodInterface<T extends MethodsObject<T>>(interfaceName: string, path?: string): Promise<MethodInterface<T>>;

  getIntrospectableInterface(path?: string): Promise<IntrospectableInterface>;

  getPropertiesInterface<T>(path?: string): Promise<UnwrappedPropertiesInterface<T>>;
}

// TODO: Create Generic Class that provides methods and properties for each interface
export class DBusProxy implements IDBusProxy {
  constructor(private systemBus: MessageBus, public readonly destination: string, public readonly basePath: string) {}

  public async getMethodInterface<T extends MethodsObject<T>>(
    interfaceName: string,
    path?: string,
  ): Promise<MethodInterface<T>> {
    const proxy = await this.getProxy(path);
    return proxy.getInterface<MethodInterface<T>>(interfaceName);
  }

  public async getIntrospectableInterface(path?: string): Promise<IntrospectableInterface> {
    const proxy = await this.getProxy(path);
    return proxy.getInterface<IntrospectableInterface>('org.freedesktop.DBus.Introspectable');
  }

  public async getPropertiesInterface<T>(path?: string): Promise<UnwrappedPropertiesInterface<T>> {
    const proxy = await this.getProxy(path);
    const propertiesInterface = proxy.getInterface<PropertiesInterface<T>>(
      'org.freedesktop.DBus.Properties',
    ) as UnwrappedPropertiesInterface<T>;

    propertiesInterface.GetAllUnwrapped = async (interfaceName: string) => {
      const allProperties = await propertiesInterface.GetAll(interfaceName);
      return unwrapVariantObject(allProperties);
    };

    return propertiesInterface;
  }

  private async getProxy(path?: string): Promise<ProxyObject> {
    return this.systemBus.getProxyObject(this.destination, path ?? this.basePath);
  }
}

@Injectable()
export class SystemBusService implements ISystemBusService {
  _systemBus: MessageBus = getSystemBus();
  get systemBus(): MessageBus {
    return this._systemBus;
  }

  public createProxy(destination: string, path: string): DBusProxy {
    return new DBusProxy(this.systemBus, destination, path);
  }
}

interface ISystemBusService {
  createProxy(destination: string, path: string): IDBusProxy;
}

@Injectable()
export class SystemBusServiceMock implements ISystemBusService {
  public proxyMock: IDBusProxy;

  public createProxy(): IDBusProxy {
    return this.proxyMock;
  }
}

export const SystemBusServiceProvider = getServicesWithMock<ISystemBusService>(SystemBusService, SystemBusServiceMock);
