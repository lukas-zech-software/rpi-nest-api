import { Test, TestingModule } from '@nestjs/testing';
import { OperatingSystemService } from './operating-system.service';

describe('OperatingSystemService', () => {
  let service: OperatingSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OperatingSystemService],
    }).compile();

    service = module.get<OperatingSystemService>(OperatingSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
