import { Injectable } from '@nestjs/common';
import { ArrayElement } from '../../types/common';
import { getServicesWithMock } from '../../types/utils';
import { ChildProcessService } from '../child-process.service';

const DPKG_EXECUTABLE = '/usr/bin/dpkg-query';

enum DPKG_ARGUMENTS {
  format = '--showformat',
  show = '--show',
}

// List of fields that will be passed to --showformat and will be parsed into the PackageInfo result
const DPKG_OUTPUT_FIELDS = ['Package', 'Version', 'Architecture', 'Section', 'binary:Summary', 'Homepage'] as const;
type DpkgFieldName = ArrayElement<typeof DPKG_OUTPUT_FIELDS>;
export type PackageInfo = {
  [TKey in DpkgFieldName]: string;
};

const separator = '|';

function buildShowFormatArgument() {
  const wrappedFields = DPKG_OUTPUT_FIELDS.map((x) => `\${${x}}`);
  return `${DPKG_ARGUMENTS.format}='${wrappedFields.join(separator)}\\n'`;
}

function parseDpkgOutputLine(line: string): PackageInfo {
  const values = line.split(separator);
  const result: Partial<PackageInfo> = {};

  DPKG_OUTPUT_FIELDS.forEach((fieldName, i) => {
    result[fieldName] = values[i];
  });

  return result as PackageInfo;
}

interface IDpkgCommandService {
  getInstalledPackages(): Promise<Array<PackageInfo>>;
}

@Injectable()
export class DpkgCommandService implements IDpkgCommandService {
  constructor(private shellCommandService: ChildProcessService) {}

  /**
   * Get the list of installed packages
   */
  public async getInstalledPackages(): Promise<Array<PackageInfo>> {
    const showFormatArgument = buildShowFormatArgument();
    const output = await this.shellCommandService.spawn(DPKG_EXECUTABLE, [DPKG_ARGUMENTS.show, showFormatArgument], {
      shell: '/bin/bash',
    });

    const lines = output.split('\n');
    return lines.map(parseDpkgOutputLine);
  }
}

@Injectable()
export class DpkgCommandServiceMock implements IDpkgCommandService {
  async getInstalledPackages(): Promise<Array<PackageInfo>> {
    return [
      {
        Package: 'adduser',
        Section: 'utils',
        Version: '3.134',
        Architecture: 'all',
        'binary:Summary': 'add and remove users and groups',
        Homepage: '',
      },
    ];
  }
}

export const DpkgCommand = getServicesWithMock<IDpkgCommandService>(DpkgCommandService, DpkgCommandServiceMock);
