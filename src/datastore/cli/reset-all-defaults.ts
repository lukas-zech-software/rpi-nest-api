import { CommandRunner, Option, SubCommand } from 'nest-commander';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { ConflictException } from '@nestjs/common';

@SubCommand({
  name: 'reset-all-defaults',
  description: 'Reset all settings to default values.',
})
export class ResetAllDefaults extends CommandRunner {
  constructor(private maintenanceService: MaintenanceService) {
    super();
  }

  @Option({
    flags: '-f, --force',
    description: 'Reset settings to default, even if they are not empty',
  })
  getForceFlag(): boolean {
    return true;
  }

  async run(passedParams: string[], options: Record<string, any>): Promise<void> {
    try {
      await this.maintenanceService.resetAllSettingsToDefaults(options.force);
    } catch (e) {
      if (e instanceof ConflictException) {
        console.error(e.message);
        this.command.error('Error: Not all settings are empty. Use --force to reset them anyway', {
          exitCode: 1,
        });
        return;
      }

      throw e;
    }
  }
}
