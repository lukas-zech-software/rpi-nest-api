import { CommandRunner, Option, SubCommand } from 'nest-commander';
import { inspect } from 'node:util';
import { SystemBusService } from '../system-bus/system-bus.service';

@SubCommand({
  name: 'introspect',
  aliases: ['intro'],
  description: 'Invoke the @Introspectable interface of a service',
})
export class IntrospectCommand extends CommandRunner {
  constructor(private readonly systemBus: SystemBusService) {
    super();
  }

  @Option({
    flags: '-d, --destination <destination>',
    description: 'The D-BUS service destination',
    required: true,
  })
  getDestination(val: string): string {
    return val;
  }

  @Option({
    flags: '-i, --interfaceName <interfaceName>',
    description: 'The target interface for the D-BUS service',
    required: true,
  })
  getInterfaceName(val: string): string {
    return val;
  }

  @Option({
    flags: '-p, --path <path>',
    description: 'The target path for the D-BUS service',
    required: false,
  })
  getPath(val: string): string | undefined {
    return val;
  }

  async run(passedParams: string[], options: Record<string, any>): Promise<void> {
    const { destination, path = destination.replaceAll('.', '/'), interfaceName } = options;

    console.log('options', options);
    console.log('options', { destination, path, interfaceName });

    try {
      const introspectableInterface = await this.systemBus.createProxy(destination, path).getIntrospectableInterface();
      const result = await introspectableInterface.Introspect();

      console.log(inspect(result, { depth: null, colors: true }));
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
  }
}
