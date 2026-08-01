export interface RequestContext {
  correlationId: string;
  userId?: string;
  timestamp: Date;
}
