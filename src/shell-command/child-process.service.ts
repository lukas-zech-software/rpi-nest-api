import { Injectable, Logger } from '@nestjs/common';
import { spawn, SpawnOptions } from 'child_process';
import { Readable } from 'node:stream';
import { getServicesWithMock } from '../types/utils';

interface IChildProcessService {
  spawn(command: string, args?: Array<string>, options?: SpawnOptions): Promise<string>;

  spawnAuthorized(command: string, args?: Array<string>, options?: SpawnOptions): Promise<string>;

  spawnStreamable(command: string, args?: Array<string>, options?: SpawnOptions): Promise<Readable>;
}

/**
 * A service to wrap the execution of shell commands
 */
@Injectable()
export class ChildProcessService implements IChildProcessService {
  protected readonly logger: Logger = new Logger(ChildProcessService.name);

  /**
   * Spawn the provided command on a own shell and return the STDOUT as string
   * or STDERR in case of an error
   *
   * @param {string} command
   * @param {Array<string>} [args] The command arguments
   * @param {SpawnOptions} options The options for the child process
   * @returns {Promise<string>}
   */
  public spawn(command: string, args: Array<string> = [], options?: SpawnOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      this.logger.debug(`Spawn command: [${command} ${args.join(' ')}], options: [${JSON.stringify(options)}]`);

      const childProcess = spawn(command, args, options ?? {});

      if (childProcess.stdout === null || childProcess.stderr === null) {
        return reject(new Error('Failed to get stdout/stderr of child process.'));
      }

      childProcess.stdout.on('data', (data) => (stdout += data));
      childProcess.stderr.on('data', (data) => (stderr += data));

      childProcess.on('close', (exitCode) => {
        if (exitCode !== 0) {
          this.logger.error(`Child process [${command}] exited with error [${exitCode}]`);
          reject(stderr);
          return;
        }

        resolve(stdout);
      });

      childProcess.on('error', (err) => {
        this.logger.error(`Failed to open child process [${command}]: ${err}`);
        reject(err);
      });
    });
  }

  /**
   * Executes the provided command using polkit 'pkexec' which will use polkit
   * to authorize the execution as superuser 'root'
   *
   * If the command has a polkit rule configured  for 'org.freedesktop.policykit.exec' in src/dbus/polkit/rules
   * the command will be executed as superuser 'root'
   * If no rule is configured the command will fail
   *
   *
   * @param {string} command
   * @param {Array<string>} [args] The command arguments
   * @param {SpawnOptions} options The options for the child process
   * @returns {Promise<string>}
   */
  public spawnAuthorized(command: string, args: Array<string> = [], options?: SpawnOptions): Promise<string> {
    return this.spawn(`/usr/bin/pkexec --disable-internal-agent ${command}`, args, options);
  }

  /**
   * Spawn the provided command and return the STDOUT as readable stream
   *
   * @param {string} command
   * @param {Array<string>} [args] The command arguments
   * @param {SpawnOptions} options The options for the child process
   * @returns {Promise<string>}
   */
  public async spawnStreamable(
    command: string,
    args: Array<string> = [],
    options: SpawnOptions = {},
  ): Promise<Readable> {
    return new Promise((resolve, reject) => {
      this.logger.debug(
        `Spawn streaming command : [${command} ${args.join(' ')}], options: [${JSON.stringify(options)}]`,
      );
      let stderr = '';

      const childProcess = spawn(command, args, { stdio: 'pipe', ...options });

      if (childProcess.stdout === null || childProcess.stderr === null) {
        throw new Error('Failed to get stdout/stderr of child process.');
      }

      childProcess.stderr.on('data', (data) => (stderr += data));

      childProcess.on('close', (exitCode) => {
        this.logger.verbose(`Child process [${command}] exited [${exitCode}]`);

        if (exitCode !== 0) {
          this.logger.error(`Child process [${command}] exited with error: ${stderr}"`);
          reject(new Error(stderr));
        }
      });

      childProcess.on('error', (err) => {
        this.logger.error(`Failed to open child process [${command}]: ${err}`);
        reject(err);
      });

      childProcess.stdout.once('readable', () => {
        if (childProcess.stdout !== null) {
          resolve(childProcess.stdout);
        } else {
          this.logger.error(`Child process [${command}]: stdout is null`);
          reject(new Error('Child process stdout is null'));
        }
      });
    });
  }
}

/**
 * A service to mock the execution of shell commands
 */
@Injectable()
export class ChildProcessServiceMock extends ChildProcessService implements IChildProcessService {
  public spawn(command: string, args: Array<string>, options?: SpawnOptions): Promise<string> {
    this.logger.debug(`Mocked command: [${command}], options:`, options);
    return Promise.resolve('');
  }

  public spawnAuthorized(command: string, args: Array<string>, options?: SpawnOptions): Promise<string> {
    this.logger.debug(`Mocked authorized command: [${command}], options:`, options);
    return Promise.resolve('');
  }

  public spawnStreamable(command: string, args: Array<string>, options?: SpawnOptions): Promise<Readable> {
    this.logger.debug(`Mocked streamable command: [${command}], options:`, options);
    return Promise.resolve(Readable.from([]));
  }
}

export const ChildProcessModule = getServicesWithMock<IChildProcessService>(
  ChildProcessService,
  ChildProcessServiceMock,
);
