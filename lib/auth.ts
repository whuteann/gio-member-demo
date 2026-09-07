// Demo-only credential handling. This is a frontend prototype with no server,
// so this is intentionally NOT a real password hash — never reuse this pattern
// against a real backend.
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 31 + password.charCodeAt(i)) >>> 0;
  }
  return `demo$${hash.toString(36)}$${password.length}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateGid(): string {
  const chunk = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GIO-${chunk()}-${chunk()}`;
}
