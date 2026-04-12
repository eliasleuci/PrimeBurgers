import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ 
  host: 'aws-0-us-west-2.pooler.supabase.com', 
  port: 6543, 
  user: 'postgres.gxfdzjhxhuaenavxpzkj', 
  password: 'Orderix42854674',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE profiles ALTER COLUMN tenant_id DROP NOT NULL;');
    console.log('Successfully dropped NOT NULL constraint on tenant_id');
  } catch (err) {
    console.error('Error altering table:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
