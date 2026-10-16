require('dotenv').config();
const { sequelize } = require('../config/db');

async function migrateTrialCreatorFields() {
  const schema = process.env.SCHEMA || 'Abhishek';
  console.log(`[Migration] Starting trial creator fields migration for schema: "${schema}"...`);

  try {
    // 1. Add is_trial column
    await sequelize.query(`
      ALTER TABLE "${schema}".creators 
      ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT FALSE;
    `);
    console.log('✓ Column is_trial added to creators or already exists');

    // 2. Add account_type column
    await sequelize.query(`
      ALTER TABLE "${schema}".creators 
      ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) DEFAULT 'regular';
    `);
    console.log('✓ Column account_type added to creators or already exists');

    // 3. Add trial_session_id column
    await sequelize.query(`
      ALTER TABLE "${schema}".creators 
      ADD COLUMN IF NOT EXISTS trial_session_id VARCHAR(150) DEFAULT NULL;
    `);
    console.log('✓ Column trial_session_id added to creators or already exists');

    // 4. Add trial_expires_at column
    await sequelize.query(`
      ALTER TABLE "${schema}".creators 
      ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);
    console.log('✓ Column trial_expires_at added to creators or already exists');

    // 5. Add trial_completed column
    await sequelize.query(`
      ALTER TABLE "${schema}".creators 
      ADD COLUMN IF NOT EXISTS trial_completed BOOLEAN DEFAULT FALSE;
    `);
    console.log('✓ Column trial_completed added to creators or already exists');

    // 6. Create index on trial_session_id
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS creators_trial_session_id_idx 
      ON "${schema}".creators (trial_session_id) 
      WHERE trial_session_id IS NOT NULL;
    `);
    console.log('✓ Index creators_trial_session_id_idx ensured');

    console.log('[Migration] Trial creator fields migration completed successfully!');
  } catch (err) {
    console.error('[Migration Error]:', err);
    throw err;
  }
}

if (require.main === module) {
  migrateTrialCreatorFields()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = migrateTrialCreatorFields;
