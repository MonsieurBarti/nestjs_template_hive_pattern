import { Any } from '@/util/stubs';
import { TypedCommandBus } from '../cqrs';

/**
 * Simplified in-memory CommandBus for testing.
 * Tracks command execution and allows mocking of responses.
 */
export class InMemoryCommandBus extends TypedCommandBus {
  private executedCommands: Any[] = [];
  private mockHandlers = new Map<string, (command: Any) => Any>();
  private defaultResult: Any = undefined;
  private resultQueue: Any[] = [];

  constructor() {
    super(null as Any, null as Any);
  }

  /**
   * Executes a command and tracks it for verification.
   * @param command - The command to execute
   * @returns The mocked result or default value
   */
  async execute<T = Any, R = Any>(command: T): Promise<R> {
    // Always track the execution, even if handler throws
    this.executedCommands.push(command);

    // Check queue first (for mockResolvedValueOnce pattern)
    if (this.resultQueue.length > 0) {
      return this.resultQueue.shift() as R;
    }

    const commandName = (command as Any).constructor.name;
    const handler = this.mockHandlers.get(commandName);

    if (handler) {
      // Execute the mock handler
      return await handler(command);
    }
    // Return default result if no handler
    return this.defaultResult as R;
  }

  /**
   * Sets up a mock handler for a specific command type.
   * @param commandType - The command class
   * @param handler - Function that returns the mock result
   */
  mockImplementation<T = Any>(
    commandType: new (...args: Any[]) => T,
    handler: (command: T) => Any,
  ): this {
    this.mockHandlers.set(commandType.name, handler as (command: Any) => Any);
    return this;
  }

  /**
   * Sets the default return value for commands without specific handlers.
   * @param value - The default value to return
   */
  mockReturnValue(value: Any): this {
    this.defaultResult = value;
    return this;
  }

  /**
   * Checks if a specific command type was executed.
   * @param commandType - The command class to check
   */
  hasExecutedCommand<T = Any>(commandType: new (...args: Any[]) => T): boolean {
    const commandName = commandType.name;
    return this.executedCommands.some(
      (cmd) => (cmd as Any).constructor.name === commandName,
    );
  }

  /**
   * Gets the number of times a specific command type was executed.
   * @param commandType - The command class to count
   */
  getExecutionCount<T = Any>(commandType?: new (...args: Any[]) => T): number {
    if (!commandType) {
      return this.executedCommands.length;
    }
    const commandName = commandType.name;
    return this.executedCommands.filter(
      (cmd) => (cmd as Any).constructor.name === commandName,
    ).length;
  }

  /**
   * Gets all executed commands.
   */
  getExecutedCommands(): Any[] {
    return this.executedCommands;
  }

  /**
   * Gets the last executed command.
   */
  getLastExecutedCommand(): Any | undefined {
    return this.executedCommands[this.executedCommands.length - 1];
  }

  /**
   * Gets the last executed command of a specific type.
   * @param commandType - The command class to find
   */
  getLastExecutedCommandOfType<T = Any>(
    commandType: new (...args: Any[]) => T,
  ): T | undefined {
    const commandName = commandType.name;
    for (let i = this.executedCommands.length - 1; i >= 0; i--) {
      const cmd = this.executedCommands[i];
      if ((cmd as Any).constructor.name === commandName) {
        return cmd as T;
      }
    }
    return undefined;
  }

  /**
   * Adds a value to be returned for the next command execution.
   * @param value - The value to return next
   */
  mockResolvedValueOnce(value: Any): this {
    this.resultQueue.push(value);
    return this;
  }

  /**
   * Adds an error to be thrown for the next command execution.
   * @param error - The error to throw next
   */
  mockRejectedValue(error: Any): this {
    this.resultQueue.push(Promise.reject(error));
    return this;
  }

  /**
   * Clears all executed commands and mock handlers.
   */
  clear(): void {
    this.executedCommands = [];
    this.mockHandlers.clear();
    this.defaultResult = undefined;
    this.resultQueue = [];
  }

  /**
   * Gets the total number of executed commands.
   */
  get executionCount(): number {
    return this.executedCommands.length;
  }
}
