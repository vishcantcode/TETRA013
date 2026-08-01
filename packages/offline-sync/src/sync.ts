import { TriageSession } from '@healthsense/clinical-models';

export class OfflineSyncManager {
  private localQueue: TriageSession[] = [];

  saveOffline(session: TriageSession) {
    this.localQueue.push(session);
  }

  async syncWithServer(apiClient: any): Promise<void> {
    for (const session of this.localQueue) {
      await apiClient.post('/triage/sync', session);
    }
    this.localQueue = [];
  }
}
