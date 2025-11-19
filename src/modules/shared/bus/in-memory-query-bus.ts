import { Any } from '@/util/stubs';
import { TypedQueryBus } from '../cqrs';

/**
 * Simplified in-memory QueryBus for testing.
 * Tracks query execution and allows mocking of responses.
 */
export class InMemoryQueryBus extends TypedQueryBus {
  private executedQueries: Any[] = [];
  private mockHandlers = new Map<string, (query: Any) => Any>();
  private defaultResult: Any = undefined;
  private resultQueue: Any[] = [];

  constructor() {
    super(null as Any, null as Any);
  }

  /**
   * Executes a query and tracks it for verification.
   * @param query - The query to execute
   * @returns The mocked result or default value
   */
  async execute<T = Any, R = Any>(query: T): Promise<R> {
    // Always track the execution, even if handler throws
    this.executedQueries.push(query);

    // Check queue first (for mockResolvedValueOnce pattern)
    if (this.resultQueue.length > 0) {
      return this.resultQueue.shift() as R;
    }

    const queryName = (query as Any).constructor.name;
    const handler = this.mockHandlers.get(queryName);

    if (handler) {
      // Execute the mock handler
      return await handler(query);
    }
    // Return default result if no handler
    return this.defaultResult as R;
  }

  /**
   * Sets up a mock handler for a specific query type.
   * @param queryType - The query class
   * @param handler - Function that returns the mock result
   */
  mockImplementation<T = Any>(
    queryType: new (...args: Any[]) => T,
    handler: (query: T) => Any,
  ): this {
    this.mockHandlers.set(queryType.name, handler as (query: Any) => Any);
    return this;
  }

  /**
   * Sets the default return value for queries without specific handlers.
   * @param value - The default value to return
   */
  mockReturnValue(value: Any): this {
    this.defaultResult = value;
    return this;
  }

  /**
   * Checks if a specific query type was executed.
   * @param queryType - The query class to check
   */
  hasExecutedQuery<T = Any>(queryType: new (...args: Any[]) => T): boolean {
    const queryName = queryType.name;
    return this.executedQueries.some(
      (query) => (query as Any).constructor.name === queryName,
    );
  }

  /**
   * Gets the number of times a specific query type was executed.
   * @param queryType - The query class to count
   */
  getExecutionCount<T = Any>(queryType?: new (...args: Any[]) => T): number {
    if (!queryType) {
      return this.executedQueries.length;
    }
    const queryName = queryType.name;
    return this.executedQueries.filter(
      (query) => (query as Any).constructor.name === queryName,
    ).length;
  }

  /**
   * Gets all executed queries.
   */
  getExecutedQueries(): Any[] {
    return this.executedQueries;
  }

  /**
   * Gets the last executed query.
   */
  getLastExecutedQuery(): Any | undefined {
    return this.executedQueries[this.executedQueries.length - 1];
  }

  /**
   * Gets the last executed query of a specific type.
   * @param queryType - The query class to find
   */
  getLastExecutedQueryOfType<T = Any>(
    queryType: new (...args: Any[]) => T,
  ): T | undefined {
    const queryName = queryType.name;
    for (let i = this.executedQueries.length - 1; i >= 0; i--) {
      const query = this.executedQueries[i];
      if ((query as Any).constructor.name === queryName) {
        return query as T;
      }
    }
    return undefined;
  }

  /**
   * Gets executed queries of a specific type.
   * @param queryType - The query class to filter by
   */
  getExecutedQueriesOfType<T = Any>(queryType: new (...args: Any[]) => T): T[] {
    const queryName = queryType.name;
    return this.executedQueries.filter(
      (query) => (query as Any).constructor.name === queryName,
    ) as T[];
  }

  /**
   * Adds a value to be returned for the next query execution.
   * @param value - The value to return next
   */
  mockResolvedValueOnce(value: Any): this {
    this.resultQueue.push(value);
    return this;
  }

  /**
   * Adds an error to be thrown for the next query execution.
   * @param error - The error to throw next
   */
  mockRejectedValue(error: Any): this {
    this.resultQueue.push(Promise.reject(error));
    return this;
  }

  /**
   * Clears all executed queries and mock handlers.
   */
  clear(): void {
    this.executedQueries = [];
    this.mockHandlers.clear();
    this.defaultResult = undefined;
    this.resultQueue = [];
  }

  /**
   * Gets the total number of executed queries.
   */
  get executionCount(): number {
    return this.executedQueries.length;
  }
}
