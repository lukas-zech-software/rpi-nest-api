import { CommandRunner, Option, SubCommand } from 'nest-commander';
import { SettingsRepository } from '../../datastore/settings-repository/settings.repository';

@SubCommand({
  name: 'reset-defaults',
  description: 'Reset authentication settings to default values.',
})
export class ResetDefaults extends CommandRunner {
  constructor(private settingsRepository: SettingsRepository<'authentication'>) {
    super();
  }

  @Option({
    flags: '-f, --force',
    description: 'Reset settings to default, even if they are not empty',
  })
  getFlag(): boolean {
    return true;
  }

  async run(passedParams: string[], options: Record<string, any>): Promise<void> {
    const isInitialized = await this.settingsRepository.for('authentication').isInitialized();
    if (isInitialized && options.force !== true) {
      this.command.error('Error: Authentication settings are not empty. Use --force to reset them anyway', {
        exitCode: 1,
      });
      return;
    }

    await this.settingsRepository.for('authentication').resetDefaults();
    console.log('Authentication settings have been reset to default values');
  }
}
