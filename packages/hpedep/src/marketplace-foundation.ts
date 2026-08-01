// ============================================================================
// HPEDEP – Capability 7: Marketplace Foundation
// ============================================================================

import { MarketplaceListing } from './types';

export class HPEDEPMarketplaceFoundation {
  private listings: MarketplaceListing[] = [];

  constructor() {
    this.seedDefaultListings();
  }

  private seedDefaultListings(): void {
    this.listings = [
      {
        listingId: 'mkt-oncology-01',
        title: 'Oncology Care Pathway Assistant',
        description: 'Advanced clinical decision support for solid tumor chemotherapy regimens.',
        category: 'CLINICAL',
        version: 'v1.4.0',
        publisher: 'HealthSense Clinical Ecosystem',
        rating: 4.9,
        compatible: true,
      },
      {
        listingId: 'mkt-telehealth-02',
        title: 'Telehealth Video Call UI Extension',
        description: 'Embedded video call launcher for remote care visits in Unified Workspace.',
        category: 'UI',
        version: 'v2.1.0',
        publisher: 'Partner Health Apps',
        rating: 4.8,
        compatible: true,
      },
      {
        listingId: 'mkt-radiology-ai-03',
        title: 'CXR AI Radiographic Classifier',
        description: 'Automated chest X-ray opacity detection integrated into ACDSS.',
        category: 'AI',
        version: 'v1.0.2',
        publisher: 'Radiology AI Labs',
        rating: 4.7,
        compatible: true,
      },
    ];
  }

  public getListings(): MarketplaceListing[] {
    return [...this.listings];
  }
}
