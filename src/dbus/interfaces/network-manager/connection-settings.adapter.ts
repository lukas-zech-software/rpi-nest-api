import { VariantObject } from '../../types';
import { toVariant } from '../../utils';
import { IpAddressString, NetworkAddress } from './types';
import {
  DeprecatedIpSettings,
  IpSettingsMethod,
  Ipv4Settings,
  Ipv6Settings,
  UnsetIpSettings,
  UpdateIpSettings,
} from './types/ip.settings.types';

//TODO: Write Test
/**
 * This implements to construction and manipulation of the connection settings
 * object sent to the Update() function
 * It also contains some logic to validate rules for invalid setting combinations
 */
export class IpSettingsVariantAdapter<T extends Ipv4Settings | Ipv6Settings> {
  constructor(private readonly variantObject: VariantObject<T>) {
    // Remove deprecated properties
    this.deleteProperty('addresses');
    this.deleteProperty('dns');
    this.deleteProperty('routes');
  }

  public applyChanges(changes?: Partial<UpdateIpSettings>) {
    if (changes !== undefined) {
      const isDHCP = changes.method === 'auto';

      if (changes['dns-data'] !== undefined) {
        this.setDnsData(changes['dns-data'], isDHCP);
      }

      if (changes['dns-search'] !== undefined) {
        this.setDnsSearch(changes['dns-search'], isDHCP);
      }

      if (isDHCP) {
        this.setDHCP();
      } else {
        this.setManual(changes);
      }
    }

    return this.variantObject;
  }

  private setDHCP() {
    this.setAddressData(null);
    this.setGateway(null);
    this.setMethod('auto');
  }

  private setManual(changes: Partial<UpdateIpSettings>) {
    const addressData = changes['address-data'];
    if (addressData === null || addressData === undefined || addressData.length === 0) {
      throw new Error('Must provide at least one static ip');
    }
    const gateway = changes['gateway'];
    if (gateway === null || gateway === undefined || gateway.length === 0) {
      throw new Error('Must provide a gateway for static ip');
    }

    this.setAddressData(addressData);
    this.setGateway(gateway);
    this.setMethod('manual');
  }

  private setAddressData(addressData: NetworkAddress[] | null) {
    if (addressData === null) {
      return this.deleteProperty('address-data');
    }

    this.variantObject['address-data'] = toVariant({
      signature: 'aa{sv}',
      value: addressData.map((x) => ({
        address: toVariant({ signature: 's', value: x.address }),
        prefix: toVariant({ signature: 'u', value: x.prefix }),
      })),
    });
  }

  /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
  private setDnsData(dnsData: string[] | null, isDHCP: boolean) {
    if (dnsData === null) {
      return this.deleteProperty('dns-data');
    }

    this.variantObject['dns-data'] = toVariant({ signature: 'as', value: dnsData });
    /**
     * if DHCP is enabled but user explicitly wants custom DNS, the DNS provided via DHCP should be ignored
     * if DHCP is disabled, this setting has no effect and should be reverted to FALSE
     */
    // TODO: This must be confirmed and is deactivated until then
    // this.setIgnoreAutoDns(isDHCP);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
  private setDnsSearch(dnsSearch: string[] | null, isDHCP: boolean) {
    if (dnsSearch === null) {
      return this.deleteProperty('dns-search');
    }
    this.variantObject['dns-search'] = toVariant({ signature: 'as', value: dnsSearch });
    /**
     * if DHCP is enabled but user explicitly wants custom DNS, the DNS provided via DHCP should be ignored
     * if DHCP is disabled, this setting has no effect and should be reverted to FALSE
     */
    // TODO: This must be confirmed and is deactivated until then
    // this.setIgnoreAutoDns(isDHCP);
  }

  private setGateway(gateway: IpAddressString | null) {
    if (gateway === null) {
      return this.deleteProperty('gateway');
    }

    const addressData = this.variantObject['address-data'].value;
    if (addressData === null || addressData === undefined || addressData.length === 0) {
      throw new Error('gateway cannot be set if there are no addresses configured');
    }

    this.variantObject['gateway'] = toVariant({ signature: 's', value: gateway });
  }

  private setMethod(method: IpSettingsMethod) {
    this.variantObject['method'] = toVariant({ signature: 's', value: method });
  }

  private setIgnoreAutoDns(value: boolean) {
    this.variantObject['ignore-auto-dns'] = toVariant({ signature: 'b', value: value });
  }

  private deleteProperty<T1 extends DeprecatedIpSettings>(name: keyof T1): void;
  private deleteProperty<T1 extends UnsetIpSettings>(name: keyof T1): void;
  private deleteProperty<T1 extends T>(name: keyof T): void {
    const obj = this.variantObject as VariantObject<T1>;
    delete obj[name];
  }
}
