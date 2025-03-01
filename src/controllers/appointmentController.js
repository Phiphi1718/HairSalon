const pool = require('../db');
const { isAdmin } = require('../middlewares/authMiddleware');

// Lấy tất cả lịch hẹn (Chỉ Admin mới được xem)
const getAllAppointments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id, 
        u.username AS user_name, 
        b.full_name AS barber_name, 
        s.service_name, 
        a.appointment_date, 
        a.status
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lịch hẹn:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch hẹn', error });
  }
};

// Thêm lịch hẹn mới (Ai cũng có thể đặt)
const createAppointment = async (req, res) => {
  const { user_name, barber_name, service_name, appointment_date, status } = req.body;

  try {
    // Tìm ID của user, barber, service dựa trên name
    const user = await pool.query('SELECT id FROM users WHERE username = $1', [user_name]);
    const barber = await pool.query('SELECT id FROM barbers WHERE full_name = $1', [barber_name]);
    const service = await pool.query('SELECT id FROM services WHERE service_name = $1', [service_name]);

    if (!user.rows.length || !barber.rows.length || !service.rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy user, barber hoặc service' });
    }

    const user_id = user.rows[0].id;
    const barber_id = barber.rows[0].id;
    const service_id = service.rows[0].id;

    // Thêm lịch hẹn
    const result = await pool.query(
      'INSERT INTO appointments (user_id, barber_id, service_id, appointment_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, barber_id, service_id, appointment_date, status || 'pending']
    );

    res.status(201).json({ message: 'Lịch hẹn đã được tạo', appointment: result.rows[0] });
  } catch (error) {
    console.error('Lỗi khi tạo lịch hẹn:', error);
    res.status(500).json({ message: 'Lỗi khi tạo lịch hẹn', error });
  }
};

// Cập nhật lịch hẹn (Chỉ Admin)
const updateAppointment = async (req, res) => {
  const { user_name, barber_name, service_name, appointment_date, status } = req.body;

  try {
    const user = await pool.query('SELECT id FROM users WHERE username = $1', [user_name]);
    const barber = await pool.query('SELECT id FROM barbers WHERE full_name = $1', [barber_name]);
    const service = await pool.query('SELECT id FROM services WHERE service_name = $1', [service_name]);

    if (!user.rows.length || !barber.rows.length || !service.rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy user, barber hoặc service' });
    }

    const user_id = user.rows[0].id;
    const barber_id = barber.rows[0].id;
    const service_id = service.rows[0].id;

    const result = await pool.query(
      `UPDATE appointments
       SET appointment_date = $4, status = $5
       WHERE user_id = $1 AND barber_id = $2 AND service_id = $3
       RETURNING *`,
      [user_id, barber_id, service_id, appointment_date, status]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn để cập nhật' });
    }

    res.status(200).json({ message: 'Cập nhật lịch hẹn thành công', appointment: result.rows[0] });
  } catch (error) {
    console.error('Lỗi khi cập nhật lịch hẹn:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật lịch hẹn', error });
  }
};

// Xóa lịch hẹn (Chỉ Admin)
const deleteAppointment = async (req, res) => {
  const { user_name, barber_name, service_name } = req.body;

  try {
    const user = await pool.query('SELECT id FROM users WHERE username = $1', [user_name]);
    const barber = await pool.query('SELECT id FROM barbers WHERE full_name = $1', [barber_name]);
    const service = await pool.query('SELECT id FROM services WHERE service_name = $1', [service_name]);

    if (!user.rows.length || !barber.rows.length || !service.rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy user, barber hoặc service' });
    }

    const user_id = user.rows[0].id;
    const barber_id = barber.rows[0].id;
    const service_id = service.rows[0].id;

    const result = await pool.query(
      `DELETE FROM appointments
       WHERE user_id = $1 AND barber_id = $2 AND service_id = $3
       RETURNING *`,
      [user_id, barber_id, service_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn để xóa' });
    }

    res.status(200).json({ message: 'Xóa lịch hẹn thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa lịch hẹn:', error);
    res.status(500).json({ message: 'Lỗi khi xóa lịch hẹn', error });
  }
};

module.exports = {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};