import { CommandRunner, SubCommand } from 'nest-commander';
import { Systemd1Service } from '../../interfaces/systemd1/systemd1.service';

@SubCommand({
  name: 'start-unit',
  description: 'Call method "StartUnit" on the org.freedesktop.systemd1.Manager interface',
})
export class StartUnitCommand extends CommandRunner {
  constructor(private systemd1Service: Systemd1Service) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const startResult = await this.systemd1Service.StartUnit(passedParams[0]);
    console.log(startResult);
  }
}
