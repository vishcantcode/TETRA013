export class Statistics {
  public static calculatePercentage(part: number, total: number): number {
    if (!total || total === 0) return 0;
    return Number(((part / total) * 100).toFixed(1));
  }
}
