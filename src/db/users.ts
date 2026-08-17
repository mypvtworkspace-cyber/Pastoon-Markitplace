import { db } from './index.ts';
import { users, workspaceLogs } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string, avatar?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0],
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(avatar ? { avatar } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user in Cloud SQL:', error);
    throw new Error('Database user sync failed.', { cause: error });
  }
}

export async function logWorkspaceActivity(userUid: string, service: string, action: string, details?: string) {
  try {
    const result = await db.insert(workspaceLogs)
      .values({
        userUid,
        service,
        action,
        status: 'success',
        details: details || '',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to log workspace activity:', error);
  }
}
