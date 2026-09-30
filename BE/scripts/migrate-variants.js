const fs = require('node:fs/promises');
const path = require('node:path');
const { pool } = require('../src/config/database');

async function main() {
  const db = await pool.getConnection();
  try {
    const [[lock]] = await db.query("SELECT GET_LOCK('laptop_store_variants_migration',10) acquired");
    if (!lock.acquired) throw new Error('Migration dang duoc chay boi tien trinh khac');
    await db.query('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(100) PRIMARY KEY, step INT NOT NULL DEFAULT 0, completed BOOLEAN NOT NULL DEFAULT FALSE)');
    const [versions] = await db.query("SELECT * FROM schema_migrations WHERE name='001-laptop-variants'");
    if (versions[0]?.completed) return console.log('Migration bien the da hoan tat truoc do.');
    if (!versions.length) {
      const [tables] = await db.query('SHOW TABLES');
      const backup = {};
      for (const row of tables) {
        const table = Object.values(row)[0];
        const [ddl] = await db.query(`SHOW CREATE TABLE \`${table}\``);
        const [data] = await db.query(`SELECT * FROM \`${table}\``);
        backup[table] = { ddl: ddl[0]['Create Table'], data };
      }
      const dir = path.resolve(__dirname, '../backups');
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, `before-variants-${Date.now()}.json`);
      await fs.writeFile(file, JSON.stringify(backup, null, 2));
      console.log(`Da sao luu database: ${file}`);
      await db.query("INSERT INTO schema_migrations(name) VALUES('001-laptop-variants')");
    }
    const sql = await fs.readFile(path.resolve(__dirname, '../database/migrations/001-laptop-variants.sql'), 'utf8');
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (let step = versions[0]?.step || 0; step < statements.length; step++) {
      await db.query(statements[step]);
      await db.query("UPDATE schema_migrations SET step=? WHERE name='001-laptop-variants'", [step + 1]);
    }
    await db.query("UPDATE schema_migrations SET completed=TRUE WHERE name='001-laptop-variants'");
    console.log('Da chuyen san pham, ton kho, gio hang, phieu nhap va don hang sang bien the.');
  } finally {
    await db.query("SELECT RELEASE_LOCK('laptop_store_variants_migration')");
    db.release();
  }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => pool.end());
