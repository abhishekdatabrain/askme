require('dotenv').config();
const { sequelize } = require('../config/db');

async function migrateViewerProfileFields() {
  const schema = process.env.SCHEMA || 'Abhishek';
  console.log(`[Migration] Starting migration for schema: "${schema}"...`);

  try {
    // 1. Add avatar column
    await sequelize.query(`
      ALTER TABLE "${schema}".users 
      ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) DEFAULT NULL;
    `);
    console.log('✓ Column avatar added or already exists');

    // 2. Add username column
    await sequelize.query(`
      ALTER TABLE "${schema}".users 
      ADD COLUMN IF NOT EXISTS username VARCHAR(100) DEFAULT NULL;
    `);
    console.log('✓ Column username added or already exists');

    // 3. Add bio column
    await sequelize.query(`
      ALTER TABLE "${schema}".users 
      ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
    `);
    console.log('✓ Column bio added or already exists');

    // 4. Add country column
    await sequelize.query(`
      ALTER TABLE "${schema}".users 
      ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
    `);
    console.log('✓ Column country added or already exists');

    // 5. Add social_links column (JSONB)
    await sequelize.query(`
      ALTER TABLE "${schema}".users 
      ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('✓ Column social_links added or already exists');

    // 6. Add email_verified_at column
    await sequelize.query(`
      ALTER TABLE "${schema}".users 
      ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);
    console.log('✓ Column email_verified_at added or already exists');

    // 7. Add mobile_verified_at column
    await sequelize.query(`
      ALTER TABLE "${schema}".users 
      ADD COLUMN IF NOT EXISTS mobile_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);
    console.log('✓ Column mobile_verified_at added or already exists');

    // 8. Create unique index on username (where username is not null)
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx 
      ON "${schema}".users (LOWER(username)) 
      WHERE username IS NOT NULL;
    `);
    console.log('✓ Unique index users_username_unique_idx ensured');

    console.log('[Migration] Migration completed successfully!');
  } catch (err) {
    console.error('[Migration Error]:', err);
    throw err;
  }
}

if (require.main === module) {
  migrateViewerProfileFields()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed:', err);
      process.exit(1);
    });
}

module.exports = migrateViewerProfileFields;
