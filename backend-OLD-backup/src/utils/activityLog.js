const db = require('../config/database');

async function catat(userId, aktivitas, deskripsi, ipAddress) {
  try {
    await db('activity_logs').insert({
      user_id: userId,
      aktivitas,
      deskripsi: deskripsi || null,
      ip_address: ipAddress || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
  } catch (error) {
    console.error('Gagal mencatat aktivitas:', error.message);
  }
}

module.exports = { catat };