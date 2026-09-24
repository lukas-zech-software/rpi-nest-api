import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { MockClass } from '../../types/common';
import { RasPiSerialCommandService } from '../../shell-command/command-services/pi-serial-command.service';

describe('CryptoService', () => {
  let service: CryptoService;
  let rasPiSerialCommandServiceMock: MockClass<RasPiSerialCommandService>;
  const testDefaultPassword = 'test-default-password';

  beforeEach(async () => {
    rasPiSerialCommandServiceMock = {
      getDefaultPassword: jest.fn().mockResolvedValue(testDefaultPassword),
      getSerial: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: RasPiSerialCommandService,
          useValue: rasPiSerialCommandServiceMock,
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should return a hash string ', async () => {
      const hash = await service.hashPassword('some-password');
      expect(typeof hash).toBe('string');
    });

    it('should return a different hash every time', async () => {
      const hash1 = await service.hashPassword('some-password');
      const hash2 = await service.hashPassword('some-password');
      expect(hash1).not.toEqual(hash2);
    });
  });

  describe('comparePasswords', () => {
    it('should return TRUE if password and hash match', async () => {
      const plainTextPassword = 'some-password';
      const hash = await service.hashPassword(plainTextPassword);
      const result = await service.comparePasswords(plainTextPassword, hash);
      expect(result).toBe(true);
    });

    it('should return FALSE if password and hash do NOT match', async () => {
      const hash = await service.hashPassword('some-password');
      const result = await service.comparePasswords('another-password', hash);
      expect(result).toBe(false);
    });
  });
});
