export interface ExecutionPolicy {
  execute<T>(action: () => Promise<T>): Promise<T>;
}

export class RetryPolicy implements ExecutionPolicy {
  constructor(private maxRetries: number = 3) {}
  async execute<T>(action: () => Promise<T>): Promise<T> {
    let attempt = 0;
    while(attempt < this.maxRetries) {
      try { return await action(); }
      catch(e) { attempt++; if(attempt >= this.maxRetries) throw e; }
    }
    throw new Error('Max retries exceeded');
  }
}
