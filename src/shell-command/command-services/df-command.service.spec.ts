import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockClass } from '../../types/common';
import { ChildProcessService } from '../child-process.service';
import { DfCommandService } from './df-command.service';

describe('DfCommandService', () => {
  let service: DfCommandService;
  let childProcessServiceMock: PartialMockClass<ChildProcessService>;

  beforeEach(async () => {
    childProcessServiceMock = {
      spawn: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [DfCommandService, { provide: ChildProcessService, useValue: childProcessServiceMock }],
    }).compile();

    service = module.get<DfCommandService>(DfCommandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDiskSpaceInformation', () => {
    it('should invoke df for root and  parameter --output=used,avail and return parsed result', async () => {
      const testOutput = `Used   Avail\n1337 42`;
      childProcessServiceMock.spawn?.mockResolvedValue(testOutput);

      const diskSpaceInformation = await service.getDiskSpaceInformation();
      expect(diskSpaceInformation.used).toEqual(1337);
      expect(diskSpaceInformation.available).toEqual(42);

      expect(childProcessServiceMock.spawn).toHaveBeenCalledWith('/usr/bin/df', ['/', '--output=used,avail']);
    });

    it('should throw on unknown result', async () => {
      const testOutput = `foo`;
      childProcessServiceMock.spawn?.mockResolvedValue(testOutput);

      await expect(service.getDiskSpaceInformation()).rejects.toThrow('unparsable');
    });

    it('should throw on unparsable result', async () => {
      const testOutput = `Used   Avail\nxxx aaa`;
      childProcessServiceMock.spawn?.mockResolvedValue(testOutput);

      await expect(service.getDiskSpaceInformation()).rejects.toThrow('unparsable');
    });
  });
});
