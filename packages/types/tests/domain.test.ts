import { describe, it, expect } from 'vitest';
import { UserFactory } from '../src/domain/user';

describe('User Domain', () => {
  it('creates valid user', () => {
    const user = UserFactory.create({ name: 'Test' });
    expect(user.id).toBeDefined();
  });
});
