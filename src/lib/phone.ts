/**
 * Normaliza um telefone brasileiro digitado no formato livre
 * (ex: "(11)99999-9999") para o formato E.164 exigido pelo Cognito
 * (ex: "+5511999999999").
 *
 * Retorna `null` se o número não parecer um telefone BR válido.
 */
export function normalizePhoneBR(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');

  // Já com DDI: 55 + DDD (2) + número (8 ou 9)
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`;
  }
  // Sem DDI: DDD (2) + número (8 ou 9)
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }
  return null;
}
