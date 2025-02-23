const pool = require('./db');

const createTables = async () => {
  try {
    console.log("🛠 Đang xóa các bảng cũ nếu tồn tại...");

    // Xóa các bảng theo thứ tự tránh lỗi khóa ngoại
    await pool.query("DROP TABLE IF EXISTS order_items CASCADE;");
    await pool.query("DROP TABLE IF EXISTS orders CASCADE;");
    await pool.query("DROP TABLE IF EXISTS appointments CASCADE;");
    await pool.query("DROP TABLE IF EXISTS services CASCADE;");
    await pool.query("DROP TABLE IF EXISTS barbers CASCADE;");
    await pool.query("DROP TABLE IF EXISTS products CASCADE;");
    await pool.query("DROP TABLE IF EXISTS users CASCADE;");
    await pool.query("DROP TABLE IF EXISTS user_types CASCADE;");

    console.log("✅ Đã xóa các bảng cũ thành công!");

    // Tạo bảng user_types (Loại người dùng)
    await pool.query(`
      CREATE TABLE user_types (
        id SERIAL PRIMARY KEY,
        type_name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Đã tạo bảng 'user_types'!");

    // Chèn dữ liệu mặc định cho user_types
    await pool.query(`
      INSERT INTO user_types (type_name, description) VALUES
      ('Admin', 'Quyền quản trị toàn hệ thống'),
      ('Customer', 'Khách hàng thông thường'),
      ('Manager', 'Quản lý tiệm hoặc nhân viên')
      ON CONFLICT (type_name) DO NOTHING;
    `);
    console.log("✅ Đã thêm dữ liệu mẫu cho 'user_types'!");

    // Tạo bảng users
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        user_type_id INTEGER REFERENCES user_types(id) ON DELETE RESTRICT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Đã tạo bảng 'users'!");

    // Tạo bảng barbers (Thợ cắt tóc)
    await pool.query(`
      CREATE TABLE barbers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
        phone VARCHAR(15) UNIQUE NOT NULL,
        address TEXT NOT NULL,
        join_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Đã tạo bảng 'barbers'!");

    // Tạo bảng services (Dịch vụ cắt tóc)
    await pool.query(`
      CREATE TABLE services (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Đã tạo bảng 'services'!");

    // Tạo bảng appointments (Lịch hẹn)
    await pool.query(`
      CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        barber_id INTEGER REFERENCES barbers(id) ON DELETE SET NULL,
        service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
        appointment_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Đã tạo bảng 'appointments'!");

    // Tạo bảng products (Sản phẩm)
    await pool.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL CHECK (stock >= 0),
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Đã tạo bảng 'products'!");

    // Tạo bảng orders (Đơn hàng)
    await pool.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Đã tạo bảng 'orders'!");

    // Tạo bảng order_items (Chi tiết đơn hàng)
    await pool.query(`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price_at_time DECIMAL(10, 2) NOT NULL
      );
    `);
    console.log("✅ Đã tạo bảng 'order_items'!");

    console.log("🎉 Tất cả bảng đã được tạo thành công!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi tạo bảng:", err);
    process.exit(1);
  }
};

// Chạy lệnh tạo bảng
createTables();
