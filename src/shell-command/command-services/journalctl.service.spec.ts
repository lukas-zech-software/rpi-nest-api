import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockClass } from '../../types/common';
import { ChildProcessService } from '../child-process.service';
import { JournalctlService } from './journalctl.service';

describe('JournalctlService', () => {
  let service: JournalctlService;
  let childProcessServiceMock: PartialMockClass<ChildProcessService>;

  beforeEach(async () => {
    childProcessServiceMock = {
      spawn: jest.fn(),
      spawnAuthorized: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [JournalctlService, { provide: ChildProcessService, useValue: childProcessServiceMock }],
    }).compile();

    service = module.get<JournalctlService>(JournalctlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
