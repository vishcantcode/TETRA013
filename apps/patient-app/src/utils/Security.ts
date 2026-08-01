export class SecurityUtils {
  public static maskName(name: string): string {
    if (!name) return 'Anonymous Patient';
    const parts = name.split(' ');
    if (parts.length === 1) return `${parts[0][0]}***`;
    return `${parts[0][0]}*** ${parts[parts.length - 1][0]}***`;
  }

  public static maskAbhaId(abhaId: string): string {
    if (!abhaId) return 'XX-XXXX-XXXX-XXXX';
    return abhaId.replace(/(\d{2})-\d{4}-\d{4}-(\d{4})/, '$1-XXXX-XXXX-$2');
  }

  public static maskPhone(phone: string): string {
    if (!phone) return '+91 XXXXX XXXXX';
    return phone.replace(/(\+\d{2}\s?\d{2})\d{5}(\d{3})/, '$1XXXXX$2');
  }

  public static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }
}
