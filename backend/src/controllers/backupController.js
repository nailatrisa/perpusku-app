const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const { catat } = require('../utils/activityLog');

const BACKUP_DIR = path.join(__dirname, '../../storage/backups');

exports.index = async (req, res, next) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith('.sql'))
      .map((f) => {
        const stat = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          name: f,
          size: stat.size,
          size_formatted: (stat.size / 1024).toFixed(2) + ' KB',
          created_at: stat.mtime,
        };
      })
      .sort((a, b) => b.created_at - a.created_at);

    res.json({ success: true, data: files });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    const tables = await db.raw('SHOW TABLES');
    const tableKey = Object.keys(tables[0][0])[0];
    const tableNames = tables[0].map((t) => t[tableKey]);

    let sqlContent = `-- PerpusKu Backup\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
    sqlContent += `-- Database: ${process.env.DB_NAME || 'library'}\n\n`;
    sqlContent += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

    for (const table of tableNames) {
      const createTable = await db.raw(`SHOW CREATE TABLE \`${table}\``);
      sqlContent += `-- Table: ${table}\n`;
      sqlContent += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      sqlContent += createTable[0][0]['Create Table'] + ';\n\n';

      const rows = await db(table).select('*');
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]).map((c) => `\`${c}\``).join(', ');
        for (const row of rows) {
          const values = Object.values(row).map((v) => {
            if (v === null) return 'NULL';
            if (typeof v === 'number') return v;
            if (typeof v === 'boolean') return v ? 1 : 0;
            if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(v).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
          }).join(', ');
          sqlContent += `INSERT INTO \`${table}\` (${columns}) VALUES (${values});\n`;
        }
        sqlContent += `\n`;
      }
    }

    sqlContent += `SET FOREIGN_KEY_CHECKS=1;\n`;

    fs.writeFileSync(filepath, sqlContent, 'utf8');

    await catat(req.user.id, 'backup_db', `Backup database: ${filename}`, req.ip);

    res.json({
      success: true,
      message: 'Backup berhasil dibuat.',
      data: {
        name: filename,
        size: fs.statSync(filepath).size,
      },
    });
  } catch (err) {
    console.error('Backup error:', err);
    next(err);
  }
};

exports.download = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, message: 'File backup tidak ditemukan.' });
    }

    res.download(filepath, filename);
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      await catat(req.user.id, 'hapus_backup', `Hapus backup: ${filename}`, req.ip);
    }

    res.json({ success: true, message: 'Backup dihapus.' });
  } catch (err) { next(err); }
};