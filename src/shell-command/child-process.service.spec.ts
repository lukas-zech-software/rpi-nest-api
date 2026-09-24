import { Test, TestingModule } from '@nestjs/testing';
import { ChildProcessService } from './child-process.service';

describe('ShellCommandService', () => {
  let service: ChildProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChildProcessService],
    }).compile();

    service = module.get<ChildProcessService>(ChildProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
