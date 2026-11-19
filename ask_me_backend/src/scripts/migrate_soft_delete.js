const { sequelize } = require('../config/db');

async function migrateSoftDeleteColumns() {
  try {
    await sequelize.authenticate();
    console.log('[Migration] Database connected.');

    const schema = process.env.SCHEMA || 'Abhishek';

    await sequelize.query(`
      ALTER TABLE "${schema}".users 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS scheduled_permanent_deletion_at TIMESTAMPTZ;
    `);
    console.log('[Migration] users table columns added/verified.');

    await sequelize.query(`
      ALTER TABLE "${schema}".creators 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS scheduled_permanent_deletion_at TIMESTAMPTZ;
    `);
    console.log('[Migration] creators table columns added/verified.');

    console.log('[Migration] Soft delete columns migrated successfully.');
  } catch (err) {
    console.error('[Migration Error]:', err.message);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  migrateSoftDeleteColumns();
}

module.exports = { migrateSoftDeleteColumns };
