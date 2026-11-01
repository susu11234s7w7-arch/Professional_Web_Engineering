import { describe, it, expect } from 'vitest';
import { registerSchema, createProjectSchema, createIssueSchema } from '../src/validators/schemas.js';

describe('Zod Validation Schemas', () => {
  it('registerSchema rejects invalid email formats', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'ValidPass123!',
      fullName: 'Valid Name'
    });

    expect(result.success).toBe(false);
  });

  it('registerSchema rejects passwords with no numbers', () => {
    const result = registerSchema.safeParse({
      email: 'valid@devpulse.io',
      password: 'OnlyLettersNoDigits',
      fullName: 'Valid Name'
    });

    expect(result.success).toBe(false);
  });

  it('createProjectSchema rejects keys with special characters', () => {
    const result = createProjectSchema.safeParse({
      name: 'Special Project',
      key: 'INV@LID!',
      description: 'Bad key'
    });

    expect(result.success).toBe(false);
  });

  it('createIssueSchema rejects invalid status values', () => {
    const result = createIssueSchema.safeParse({
      title: 'Valid Title',
      status: 'NOT_A_VALID_STATUS' as any
    });

    expect(result.success).toBe(false);
  });

  it('createIssueSchema validates valid input', () => {
    const result = createIssueSchema.safeParse({
      title: 'Valid Task Title',
      status: 'TODO',
      priority: 'HIGH',
      type: 'BUG'
    });

    expect(result.success).toBe(true);
  });
});

