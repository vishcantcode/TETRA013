import { HCKEPKnowledgeEntry, HCKEPKnowledgeDomain, HCKEPStatus } from './types';

export class HCKEPKnowledgeRepository {
  private static instance: HCKEPKnowledgeRepository;
  private entries: Map<string, HCKEPKnowledgeEntry[]> = new Map(); // id -> versions

  public static getInstance(): HCKEPKnowledgeRepository {
    if (!HCKEPKnowledgeRepository.instance) {
      HCKEPKnowledgeRepository.instance = new HCKEPKnowledgeRepository();
      HCKEPKnowledgeRepository.instance.seedDefaultKnowledge();
    }
    return HCKEPKnowledgeRepository.instance;
  }

  private seedDefaultKnowledge(): void {
    this.publish({
      id: 'gdl-htn-01',
      title: 'AHA/ACC Hypertension Clinical Practice Guidelines',
      domain: 'CHRONIC_DISEASE',
      version: 'v1.0.0',
      status: 'PUBLISHED',
      summary: 'Stage 1 Hypertension defined as Systolic 130-139 or Diastolic 80-89 mmHg.',
      evidenceSource: 'AHA/ACC 2017 Clinical Practice Guidelines',
      criteria: { systolicThreshold: 130, diastolicThreshold: 80 },
      publishedAt: new Date()
    });

    this.publish({
      id: 'gdl-prev-01',
      title: 'USPSTF Cardiovascular Risk & Preventive Screening Guidelines',
      domain: 'PREVENTIVE_CARE',
      version: 'v1.0.0',
      status: 'PUBLISHED',
      summary: 'Adults aged 40-75 should undergo 10-year ASCVD risk assessment.',
      evidenceSource: 'USPSTF 2022 Recommendation Statement',
      criteria: { minAge: 40, maxAge: 75 },
      publishedAt: new Date()
    });
  }

  public publish(entry: HCKEPKnowledgeEntry): void {
    const existing = this.entries.get(entry.id) || [];
    existing.push(entry);
    this.entries.set(entry.id, existing);
  }

  public getLatest(id: string): HCKEPKnowledgeEntry | undefined {
    const list = this.entries.get(id);
    if (!list || list.length === 0) return undefined;
    return list[list.length - 1];
  }

  public getVersion(id: string, version: string): HCKEPKnowledgeEntry | undefined {
    const list = this.entries.get(id);
    if (!list) return undefined;
    return list.find(e => e.version === version);
  }

  public findByDomain(domain: HCKEPKnowledgeDomain): HCKEPKnowledgeEntry[] {
    const result: HCKEPKnowledgeEntry[] = [];
    for (const list of this.entries.values()) {
      const latest = list[list.length - 1];
      if (latest && latest.domain === domain && latest.status === 'PUBLISHED') {
        result.push(latest);
      }
    }
    return result;
  }

  public getAll(): HCKEPKnowledgeEntry[] {
    const result: HCKEPKnowledgeEntry[] = [];
    for (const list of this.entries.values()) {
      if (list.length > 0) result.push(list[list.length - 1]);
    }
    return result;
  }
}
