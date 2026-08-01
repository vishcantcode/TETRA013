import { HCOPCapabilityContract, HCOPCapabilityCategory } from './contracts';

export class HCOPCapabilityRegistry {
  private static instance: HCOPCapabilityRegistry;
  private capabilities: Map<string, HCOPCapabilityContract> = new Map();

  public static getInstance(): HCOPCapabilityRegistry {
    if (!HCOPCapabilityRegistry.instance) {
      HCOPCapabilityRegistry.instance = new HCOPCapabilityRegistry();
    }
    return HCOPCapabilityRegistry.instance;
  }

  public register<TInput = any, TOutput = any>(contract: HCOPCapabilityContract<TInput, TOutput>): void {
    this.capabilities.set(contract.id, contract);
  }

  public get(id: string): HCOPCapabilityContract | undefined {
    return this.capabilities.get(id);
  }

  public findByCategory(category: HCOPCapabilityCategory): HCOPCapabilityContract[] {
    return Array.from(this.capabilities.values()).filter(c => c.category === category);
  }

  public getAll(): HCOPCapabilityContract[] {
    return Array.from(this.capabilities.values());
  }

  public clear(): void {
    this.capabilities.clear();
  }
}
