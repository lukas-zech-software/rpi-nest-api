import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { IpSettingsMethods } from '../../../dbus/interfaces/network-manager/types/ip.settings.types';
import { UpdateNetworkConfigDto } from './update-network-config.dto';

// TODO: Enable test after requirements for final network settings are defined
describe.skip('UpdateNetworkConfigDto', () => {
  function validatePlainObject(obj: any, shouldFail = false) {
    const dtoInstance = plainToInstance(UpdateNetworkConfigDto, obj);
    const errors = validateSync(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: true,
    });

    if (shouldFail) {
      expect(errors).not.toEqual([]);
    } else {
      expect(errors).toEqual([]);
    }
  }

  describe('IPv4', () => {
    it('ip4 address with gateway should be valid', () => {
      validatePlainObject({
        ipv4: {
          'address-data': [
            {
              address: '192.168.178.10',
              prefix: 24,
            },
          ],
          gateway: '192.168.178.1',
        },
      });
    });

    it('ip4 address without gateway should be valid', () => {
      validatePlainObject({
        ipv4: {
          'address-data': [
            {
              address: '192.168.178.10',
              prefix: 24,
            },
          ],
        },
      });
    });

    it('ip4 address without prefix should be NOT valid', () => {
      validatePlainObject(
        {
          ipv4: {
            'address-data': [
              {
                address: '192.168.178.10',
              },
            ],
          },
        },
        true,
      );
    });

    it('ip4 address with prefix over 32 should be NOT valid', () => {
      validatePlainObject(
        {
          ipv4: {
            'address-data': [
              {
                address: '192.168.178.10',
                prefix: 33,
              },
            ],
          },
        },
        true,
      );
    });

    it('IpSettingsMethods must be valid methods', () => {
      IpSettingsMethods.forEach((method) =>
        validatePlainObject({
          ipv4: {
            method,
          },
        }),
      );
    });

    it('multiple ip4 addresses should be valid', () => {
      validatePlainObject({
        ipv4: {
          'address-data': [
            {
              address: '192.168.178.5',
              prefix: 24,
            },
            {
              address: '192.168.178.10',
              prefix: 32,
            },
          ],
        },
      });
    });

    it('IPv6 addresses should NOT be valid', () => {
      validatePlainObject(
        {
          ipv4: {
            'address-data': [
              {
                address: '2001:a61:60a6:db01:ca3e:a7ff:fe00:1700',
                prefix: 24,
              },
            ],
          },
        },
        true,
      );
    });

    it('Invalid methods should throw', () => {
      validatePlainObject(
        {
          ipv4: {
            method: 'foo',
          },
        },
        true,
      );
    });
  });

  describe('IPv6', () => {
    it('IPv6 address with gateway should be valid', () => {
      validatePlainObject({
        ipv6: {
          'address-data': [
            {
              address: '2001:a61:60a6:db01:ca3e:a7ff:fe00:1700',
              prefix: 24,
            },
          ],
          gateway: '2001:a61:60a6:db01:ca3e:a7ff:fe00:1700',
        },
      });
    });

    it('IPv6 address without gateway should be valid', () => {
      validatePlainObject({
        ipv6: {
          'address-data': [
            {
              address: '2001:a61:60a6:db01:ca3e:a7ff:fe00:1700',
              prefix: 64,
            },
          ],
        },
      });
    });

    it('IPv6 address without prefix should be NOT valid', () => {
      validatePlainObject(
        {
          ipv6: {
            'address-data': [
              {
                address: '2001:a61:60a6:db01:ca3e:a7ff:fe00:1700',
              },
            ],
          },
        },
        true,
      );
    });

    it('IPv6 address with prefix up to 128 should be valid', () => {
      validatePlainObject({
        ipv6: {
          'address-data': [
            {
              address: '2001:a61:60a6:db01:ca3e:a7ff:fe00:1700',
              prefix: 128,
            },
          ],
        },
      });
    });

    it('IpSettingsMethods must be valid methods', () => {
      IpSettingsMethods.forEach((method) =>
        validatePlainObject({
          ipv6: {
            method,
          },
        }),
      );
    });

    it('multiple IPv6 addresses should be valid', () => {
      validatePlainObject({
        ipv6: {
          'address-data': [
            {
              address: '2001:a61:60a6:db01:ca3e:a7ff:fe00:1700',
              prefix: 24,
            },
            {
              address: '2001:a61:60a6:db01:ca3e:a7ff:fe00:1700',
              prefix: 32,
            },
          ],
        },
      });
    });

    it('IPv4 addresses should NOT be valid', () => {
      validatePlainObject(
        {
          ipv6: {
            'address-data': [
              {
                address: '192.168.178.1',
                prefix: 24,
              },
            ],
          },
        },
        true,
      );
    });

    it('IPv4 gateways should NOT be valid', () => {
      validatePlainObject(
        {
          ipv6: {
            'address-data': [
              {
                address: '2001:a61:60a6:db01:ca3e:a7ff:fe00:1700',
                prefix: 24,
              },
            ],
            gateway: '192.168.178.1',
          },
        },
        true,
      );
    });

    it('Invalid methods should throw', () => {
      validatePlainObject(
        {
          ipv6: {
            method: 'foo',
          },
        },
        true,
      );
    });
  });
});
