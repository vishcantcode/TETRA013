// ============================================================================
// HUCWP – Capability 7: Productivity Tools & Command Palette
// ============================================================================

import { QuickAction } from './types';

export class HUCWPProductivityEngine {
  private quickActions: QuickAction[] = [];

  constructor() {
    this.registerDefaultActions();
  }

  private registerDefaultActions(): void {
    this.quickActions = [
      { actionId: 'act-cmd-center', label: 'Open Unified Patient Command Center', shortcut: 'Ctrl+Shift+P', category: 'Navigation' },
      { actionId: 'act-ai-copilot', label: 'Ask AI Clinical Copilot', shortcut: 'Ctrl+Space', category: 'AI Assistant' },
      { actionId: 'act-add-note', label: 'Add Care Team Note', shortcut: 'Ctrl+Shift+N', category: 'Collaboration' },
      { actionId: 'act-run-sim', label: 'Run Outcome Simulation (HCSOF)', shortcut: 'Ctrl+Shift+S', category: 'Simulation' },
      { actionId: 'act-toggle-theme', label: 'Toggle Dark/Light Theme', shortcut: 'Ctrl+Shift+T', category: 'UX' },
    ];
  }

  public searchCommandPalette(query: string): QuickAction[] {
    const q = query.toLowerCase();
    return this.quickActions.filter(a => a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }

  public getQuickActions(): QuickAction[] {
    return [...this.quickActions];
  }
}
