import crypto from 'crypto';

export function generateId(prefix: string = ''): string {
  const random = crypto.randomBytes(8).toString('hex');
  return prefix ? `${prefix}_${random}` : random;
}

