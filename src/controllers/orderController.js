const pool = require('../db');

// 🟢 Thêm đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { user_name, items } = req.body;

    // Lấy user_id từ user_name
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [user_name]);
    if (userResult.rowCount === 0) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }
    const user_id = userResult.rows[0].id;

    // Tính tổng tiền
    let totalAmount = 0;
    for (let item of items) {
      const productResult = await pool.query('SELECT id, price FROM products WHERE name = $1', [item.product_name]);
      if (productResult.rowCount === 0) {
        return res.status(400).json({ message: `Sản phẩm '${item.product_name}' không tồn tại` });
      }
      const { id, price } = productResult.rows[0];
      item.product_id = id;
      item.price_at_time = price;
      totalAmount += price * item.quantity;
    }

    // Tạo đơn hàng
    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id',
      [user_id, totalAmount]
    );
    const order_id = orderResult.rows[0].id;

    // Thêm sản phẩm vào order_items
    for (let item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
        [order_id, item.product_id, item.quantity, item.price_at_time]
      );
    }

    res.status(201).json({ message: 'Tạo đơn hàng thành công', order_id });
  } catch (err) {
    console.error('Lỗi khi tạo đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ', error: err });
  }
};

// 🟡 Lấy danh sách đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, u.username AS user_name, o.total_amount, o.status, o.created_at,
             json_agg(json_build_object('product_name', p.name, 'quantity', oi.quantity, 'price_at_time', oi.price_at_time)) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.username
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ', error: err });
  }
};

// 🟠 Cập nhật trạng thái đơn hàng
exports.updateOrder = async (req, res) => {
  try {
    const { order_id, status } = req.body;

    // Cập nhật đơn hàng
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, order_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ message: 'Cập nhật đơn hàng thành công', order: result.rows[0] });
  } catch (err) {
    console.error('Lỗi khi cập nhật đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ', error: err });
  }
};

// 🔴 Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
  try {
    const { order_id } = req.body;

    // Xóa đơn hàng
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [order_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ', error: err });
  }
};
