import pool from '../config/database';

export const logAudit = async (
  userId: number | null,
  action: string,
  entityType: string,
  entityId: number | null,
  changes: any,
  ipAddress?: string
): Promise<void> => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, action, entityType, entityId, JSON.stringify(changes), ipAddress]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};
