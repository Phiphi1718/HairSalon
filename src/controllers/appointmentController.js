const pool = require('../db');
const User = require('../models/userModel');  // Điều chỉnh đường dẫn nếu cần thiết
const Appointment = require('../models/Appointment'); // Đảm bảo bạn đã tạo model Appointment



// Lấy tất cả lịch hẹn (Chỉ Admin mới được xem)
const getAllAppointments = async (req, res) => {
  try {
    // Truy vấn tất cả lịch hẹn từ cơ sở dữ liệu
    const result = await pool.query('SELECT * FROM appointments');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không có lịch hẹn nào' });
    }

    res.json(result.rows); // Trả về tất cả lịch hẹn
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Không thể lấy thông tin lịch hẹn", error: error.message });
  }
};


const getAppointmentsByUsername = async (req, res) => {
  const { username } = req.params;
  
  try {
    // Lấy user_id từ username
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Câu query JOIN để lấy thông tin đầy đủ về cuộc hẹn, barber và service
    const appointmentsQuery = `
      SELECT 
        a.id, 
        a.user_id, 
        a.barber_id, 
        b.name as barber_name, 
        a.service_id, 
        s.name as service_name,
        a.appointment_date, 
        a.status, 
        a.total_amount,
        a.created_at,
        a.updated_at,
        (SELECT COUNT(*) > 0 FROM reviews r WHERE r.user_id = a.user_id AND r.barber_id = a.barber_id) as has_review
      FROM 
        appointments a
      JOIN 
        barbers b ON a.barber_id = b.id
      JOIN 
        services s ON a.service_id = s.id
      WHERE 
        a.user_id = $1
      ORDER BY 
        a.appointment_date DESC
    `;
    
    const result = await pool.query(appointmentsQuery, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không có cuộc hẹn nào' });
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Chi tiết lỗi:', error);
    res.status(500).json({ message: 'Lỗi khi lấy cuộc hẹn', error: error.message });
  }
};


// Thêm lịch hẹn mới (Ai cũng có thể đặt)
const createAppointment = async (req, res) => {
  const { user_name, barber_name, service_name, appointment_date, status } = req.body;

  try {
    // Tìm ID của user, barber, service dựa trên name
    const user = await pool.query('SELECT id FROM users WHERE username = $1', [user_name]);
    const barber = await pool.query('SELECT id FROM barbers WHERE full_name = $1', [barber_name]);
    const service = await pool.query('SELECT id, price FROM services WHERE service_name = $1', [service_name]);

    if (!user.rows.length || !barber.rows.length || !service.rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy user, barber hoặc service' });
    }

    const user_id = user.rows[0].id;
    const barber_id = barber.rows[0].id;
    const service_id = service.rows[0].id;
    const price = service.rows[0].price;

    // Tính toán tổng tiền
    const total_amount = price;  // Giả sử là giá dịch vụ

    // Thêm lịch hẹn
    const result = await pool.query(
      'INSERT INTO appointments (user_id, barber_id, service_id, appointment_date, status, total_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, barber_id, service_id, appointment_date, status || 'pending', total_amount]
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
    const service = await pool.query('SELECT id, price FROM services WHERE service_name = $1', [service_name]);

    if (!user.rows.length || !barber.rows.length || !service.rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy user, barber hoặc service' });
    }

    const user_id = user.rows[0].id;
    const barber_id = barber.rows[0].id;
    const service_id = service.rows[0].id;
    const price = service.rows[0].price;

    // Tính toán lại tổng tiền
    const total_amount = price;

    const result = await pool.query(
      `UPDATE appointments
       SET appointment_date = $4, status = $5, total_amount = $6
       WHERE user_id = $1 AND barber_id = $2 AND service_id = $3
       RETURNING *`,
      [user_id, barber_id, service_id, appointment_date, status, total_amount]
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


// Xóa lịch hẹn theo ID (Chỉ Admin)
const deleteAppointment = async (req, res) => {
  const { appointment_id } = req.params; // Lấy ID từ URL

  try {
    const result = await pool.query(
      `DELETE FROM appointments WHERE id = $1 RETURNING *`,
      [appointment_id]
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
  getAppointmentsByUsername
};
