// ============================================================================
// HPEDEP – Platform Ecosystem, Extensibility & Developer Platform
// Shared Types & Interfaces
// ============================================================================

export type PluginType = 'CLINICAL' | 'WORKFLOW' | 'UI' | 'ANALYTICS' | 'AI' | 'INTEROPERABILITY';
export type PluginStatus = 'INSTALLED' | 'ACTIVE' | 'DISABLED' | 'REMOVED';

export interface PlatformPlugin {
  pluginId: string;
  name: string;
  type: PluginType;
  version: string;
  publisher: string;
  minHealthSenseVersion: string;
  status: PluginStatus;
  permissions: string[];
  installedAt: Date;
}

export interface APIKeyConfig {
  apiKey: string;
  developerName: string;
  orgId: string;
  rateLimitRPS: number; // requests per second
  dailyQuota: number;
  active: boolean;
}

export interface APIGatewayRequest {
  requestId: string;
  apiKey: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  payload?: any;
}

export interface APIGatewayResponse<T = any> {
  requestId: string;
  statusCode: number;
  data?: T;
  error?: string;
  rateLimitRemaining: number;
  tracingId: string;
  latencyMs: number;
}

export interface WebhookSubscription {
  subscriptionId: string;
  targetUrl: string;
  secretKey: string;
  subscribedEvents: string[]; // e.g. ["patient.admitted", "alert.critical"]
  active: boolean;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: string;
  timestamp: Date;
  data: Record<string, any>;
  hmacSignature: string;
}

export interface WebhookDeliveryLog {
  deliveryId: string;
  subscriptionId: string;
  eventId: string;
  statusCode: number;
  retryCount: number;
  delivered: boolean;
  deliveredAt: Date;
}

export interface AutomationRule {
  ruleId: string;
  name: string;
  triggerEvent: string; // e.g. "lab.result.flagged"
  conditions: { field: string; operator: 'EQUALS' | 'GREATER_THAN' | 'IN'; value: any }[];
  actions: { actionType: 'SURFACE_ALERT' | 'NOTIFY_CARE_TEAM' | 'CREATE_TASK'; params: Record<string, any> }[];
  active: boolean;
}

export interface MarketplaceListing {
  listingId: string;
  title: string;
  description: string;
  category: PluginType;
  version: string;
  publisher: string;
  rating: number;
  compatible: boolean;
}
