const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Received Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token hoặc sai định dạng!" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token);

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET chưa được cấu hình trong .env!");
    return res.status(500).json({ message: "Lỗi server: Thiếu JWT_SECRET" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    console.log("Token Expiration:", new Date(decoded.exp * 1000).toLocaleString());

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verify Error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token đã hết hạn! Vui lòng đăng nhập lại." });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token không hợp lệ!" });
    } else {
      return res.status(500).json({ message: "Lỗi xác thực token!", error: error.message });
    }
  }
};

// Middleware kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
  console.log('User info in isAdmin middleware:', req.user);
  if (!req.user || req.user.user_type_id !== 1) {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  }
  next();
};

const verifyRecaptcha = async (req, res, next) => {
  try {
    // Lấy token reCAPTCHA từ request
    const recaptchaToken = req.body.recaptchaToken;
    
    console.log("reCAPTCHA token received:", recaptchaToken ? "Token received" : "No token");
    
    // Kiểm tra token
    if (!recaptchaToken) {
      return res.status(400).json({ success: false, message: 'reCAPTCHA token is required' });
    }
    
    console.log("Secret key exists:", !!process.env.RECAPTCHA_SECRET_KEY);
    
    // Gửi request đến Google với error handling chi tiết hơn
    try {
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: recaptchaToken
          }
        }
      );
      
      console.log("Google reCAPTCHA response:", response.data);
      
      // Kiểm tra kết quả
      if (response.data.success) {
        next(); // Cho phép tiếp tục nếu xác minh thành công
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'reCAPTCHA verification failed',
          details: response.data['error-codes'] 
        });
      }
    } catch (googleError) {
      console.error("Google API error:", googleError.message);
      console.error("Full error:", googleError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error communicating with Google reCAPTCHA service',
        details: googleError.message
      });
    }
  } catch (error) {
    console.error('reCAPTCHA middleware error:', error.message);
    console.error('Full error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error verifying reCAPTCHA',
      details: error.message
    });
  }
};

module.exports = { authMiddleware, isAdmin, verifyRecaptcha };
