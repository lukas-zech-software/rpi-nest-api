import { CommandRunner, SubCommand } from 'nest-commander';
import { Systemd1Service } from '../../interfaces/systemd1/systemd1.service';
import { inspect } from 'node:util';

@SubCommand({
  name: 'show-unit',
  description: 'Show all unit properties on the org.freedesktop.systemd1.Unit interface',
})
export class ShowUnitCommand extends CommandRunner {
  constructor(private systemd1Service: Systemd1Service) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const unitResult = await this.systemd1Service.LoadUnit(passedParams[0]);
    const unitProps = await this.systemd1Service.GetUnitProperties(unitResult);
    console.log(inspect(unitProps, false, 2));
  }
}
