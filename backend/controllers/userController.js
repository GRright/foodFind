const db = require('../config/database');

const userController = {
  login: (req, res) => {
    const { openid, nickname, avatar } = req.body;
    
    db.get('SELECT * FROM users WHERE openid = ?', [openid], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (row) {
        res.json({ user: row });
      } else {
        db.run(
          'INSERT INTO users (openid, nickname, avatar) VALUES (?, ?, ?)',
          [openid, nickname, avatar],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ 
              user: { 
                id: this.lastID, 
                openid, 
                nickname, 
                avatar 
              } 
            });
          }
        );
      }
    });
  },

  getUser: (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user: row });
    });
  },

  updateUser: (req, res) => {
    const { id } = req.params;
    const { nickname, avatar } = req.body;
    db.run(
      'UPDATE users SET nickname = ?, avatar = ? WHERE id = ?',
      [nickname, avatar, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'User updated successfully' });
      }
    );
  },

  getPreferences: (req, res) => {
    const { id } = req.params;
    db.get(
      'SELECT preferences, allergies, movie_preferences FROM users WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({
          preferences: row.preferences ? JSON.parse(row.preferences) : {},
          allergies: row.allergies ? JSON.parse(row.allergies) : [],
          moviePreferences: row.movie_preferences ? JSON.parse(row.movie_preferences) : {}
        });
      }
    );
  },

  updatePreferences: (req, res) => {
    const { id } = req.params;
    const { preferences, allergies, moviePreferences } = req.body;
    db.run(
      'UPDATE users SET preferences = ?, allergies = ?, movie_preferences = ? WHERE id = ?',
      [
        JSON.stringify(preferences),
        JSON.stringify(allergies),
        JSON.stringify(moviePreferences),
        id
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Preferences updated successfully' });
      }
    );
  }
};

module.exports = userController;
