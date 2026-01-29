// run-auth-updates.js

// Usage: set SUPABASE_DB_URL in env and run: node run-auth-updates.js

const { Client } = require('pg');
const DATABASE_URL = process.env.SUPABASE_DB_URL;

if (!DATABASE_URL) {
  console.error('Set SUPABASE_DB_URL env var (from Supabase Project Settings -> Database -> Connection string).');
  process.exit(1);
}

async function main() {
  const client = new Client({ 
    connectionString: DATABASE_URL 
  });
  
  await client.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1) Drop NOT NULL on email_confirmed_at
    await client.query(`
      ALTER TABLE auth.users
      ALTER COLUMN email_confirmed_at DROP NOT NULL;
    `);
    
    // 2) Confirm existing users
    await client.query(`
      UPDATE auth.users
      SET email_confirmed_at = NOW()
      WHERE email_confirmed_at IS NULL;
    `);
    
    // 3) Disable signup email confirmation in config
    await client.query(`
      UPDATE auth.config
      SET signup_require_email_confirmation = false;
    `);
    
    // 4) Grant permissions to bypass email verification
    await client.query(`
      GRANT ALL ON auth.users TO anon;
      GRANT ALL ON auth.users TO authenticated;
    `);
    
    // 5) Disable RLS on auth.users for signup without email verification
    await client.query(`
      ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
    `);
    
    // 6) Set all users as confirmed
    await client.query(`
      UPDATE auth.users 
      SET email_confirmed_at = NOW() 
      WHERE email_confirmed_at IS NULL;
    `);
    
    await client.query('COMMIT');
    
    console.log('✅ All statements executed successfully!');
    console.log('✅ Email verification has been completely disabled!');
    console.log('✅ Users can now signup without email confirmation!');
    
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error executing statements:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
