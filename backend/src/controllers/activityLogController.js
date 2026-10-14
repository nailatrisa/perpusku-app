const db = require('../config/database');

exports.index = async (req, res, next) => {
  try {
    const { user_id, aktivitas, dari, sampai, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('activity_logs')
      .leftJoin('users', 'activity_logs.user_id', 'users.id')
      .select(
        'activity_logs.*',
        'users.name as user_name',
        'users.role as user_role'
      );

    if (user_id) query = query.where('activity_logs.user_id', user_id);
    if (aktivitas) query = query.where('activity_logs.aktivitas', aktivitas);
    if (dari) query = query.whereRaw('DATE(activity_logs.created_at) >= ?', [dari]);
    if (sampai) query = query.whereRaw('DATE(activity_logs.created_at) <= ?', [sampai]);

    const totalQ = query.clone().clearSelect().clearOrder().count('activity_logs.id as total').first();
    const total = (await totalQ).total;

    const logs = await query.orderBy('activity_logs.created_at', 'desc').limit(limit).offset(offset);
    const users = await db('users').select('id', 'name', 'role').orderBy('name');
    const aktivitasList = await db('activity_logs').distinct().pluck('aktivitas');

    res.json({
      success: true,
      data: logs,
      users,
      aktivitas_list: aktivitasList,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) { next(err); }
};