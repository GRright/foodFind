const db = require('../config/database');

const feedbackController = {
  createFeedback: (req, res) => {
    const { user_id, type, item_id, rating, comment } = req.body;
    db.run(
      'INSERT INTO feedback (user_id, type, item_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [user_id, type, item_id, rating, comment],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: 'Feedback created successfully',
          feedbackId: this.lastID
        });
      }
    );
  },

  getUserFeedback: (req, res) => {
    const { userId } = req.params;
    db.all(
      'SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ feedback: rows });
      }
    );
  },

  getItemFeedback: (req, res) => {
    const { type, id } = req.params;
    db.all(
      'SELECT f.*, u.nickname FROM feedback f LEFT JOIN users u ON f.user_id = u.id WHERE f.type = ? AND f.item_id = ? ORDER BY f.created_at DESC',
      [type, id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const avgRating = rows.length > 0 
          ? rows.reduce((sum, f) => sum + (f.rating || 0), 0) / rows.length 
          : 0;
          
        res.json({
          feedback: rows,
          averageRating: parseFloat(avgRating.toFixed(1)),
          totalCount: rows.length
        });
      }
    );
  }
};

module.exports = feedbackController;
