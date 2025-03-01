const Review = require('../models/reviewModel');

exports.createReview = async (req, res) => {
  try {
    const { user_id, barber_id, rating, comment } = req.body;
    const review = await Review.create(user_id, barber_id, rating, comment);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.getAllWithUser();
    res.json(reviews);
  } catch (err) {
    console.error("Lỗi khi lấy đánh giá:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.getReviewsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const reviews = await Review.getByUsernameWithUser(username);
    res.json(reviews);
  } catch (err) {
    console.error("Lỗi khi lấy đánh giá theo username:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};


exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const review = await Review.update(id, rating, comment);
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await Review.delete(id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};