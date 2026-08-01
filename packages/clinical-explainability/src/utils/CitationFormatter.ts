import { GuidelineCitation } from '../interfaces/Evidence';

export class CitationFormatter {
  public static formatCitationString(citation: GuidelineCitation): string {
    return `[${citation.source}] ${citation.title} (${citation.version}) - ${citation.section}: ${citation.clinicalRationale}`;
  }
}
