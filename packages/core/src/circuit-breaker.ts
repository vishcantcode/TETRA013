export class CircuitBreaker {
  async execute<T>(action: () => Promise<T>): Promise<T> {
    try { return await action(); } 
    catch (e) { throw e; }
  }
}
