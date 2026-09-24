import { PackageInfo } from '../../shell-command/command-services/dpkg-command.service';

/**
 * Dto for installed packages
 */
export class PackageInfoDto implements PackageInfo {
  Architecture: string;
  Package: string;
  Version: string;
  'binary:Summary': string;
  Homepage: string;
  Section: string;
}
