import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { PartialMockClass } from '../../types/common';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userServiceMock: PartialMockClass<UserService>;

  beforeEach(async () => {
    userServiceMock = {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userServiceMock }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
