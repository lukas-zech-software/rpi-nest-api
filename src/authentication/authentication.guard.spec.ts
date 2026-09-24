import { AuthenticationGuard } from './authentication.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockClass } from '../types/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let jwtServiceMock: PartialMockClass<JwtService>;

  beforeEach(async () => {
    jwtServiceMock = {
      verifyAsync: jest.fn().mockResolvedValue({}),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationGuard,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    guard = module.get<AuthenticationGuard>(AuthenticationGuard);
  });
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
