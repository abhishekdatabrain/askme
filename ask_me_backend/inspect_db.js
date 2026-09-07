require('dotenv').config();
const sequelize = require('./src/config/database');

(async () => {
  try {
    const schema = process.env.SCHEMA || 'Abhishek';
    const [cols] = await sequelize.query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_schema = '${schema}' AND table_name = 'notifications';
    `);
    console.log('Columns:', cols);

    const [fks] = await sequelize.query(`
      SELECT conname, pg_get_constraintdef(c.oid) 
      FROM pg_constraint c 
      JOIN pg_namespace n ON n.oid = c.connamespace 
      WHERE n.nspname = '${schema}' AND conrelid = '${schema}.notifications'::regclass;
    `);
    console.log('Constraints:', fks);

    const [users] = await sequelize.query(`
      SELECT id, full_name, role FROM "${schema}".users LIMIT 5;
    `);
    console.log('Sample Users:', users);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
    process.exit();
  }
})();
