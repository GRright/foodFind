const db = require('../config/database');

const movieController = {
  getAllMovies: (req, res) => {
    const { type, genre, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM movies';
    let params = [];
    let conditions = [];
    
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    
    if (genre) {
      conditions.push('genre = ?');
      params.push(genre);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY rating DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        movies: rows.map(row => ({
          ...row,
          cuisine_match: row.cuisine_match ? JSON.parse(row.cuisine_match) : [],
          meal_type_match: row.meal_type_match ? JSON.parse(row.meal_type_match) : []
        }))
      });
    });
  },

  getMovieById: (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM movies WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.json({
        movie: {
          ...row,
          cuisine_match: row.cuisine_match ? JSON.parse(row.cuisine_match) : [],
          meal_type_match: row.meal_type_match ? JSON.parse(row.meal_type_match) : []
        }
      });
    });
  },

  getMoviesByRecipe: (req, res) => {
    const { recipeId } = req.params;
    
    db.get('SELECT cuisine_type FROM recipes WHERE id = ?', [recipeId], (err, recipe) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      let query = 'SELECT * FROM movies';
      let params = [];
      
      if (recipe && recipe.cuisine_type) {
        query += ' WHERE cuisine_match LIKE ?';
        params.push('%' + recipe.cuisine_type + '%');
      }
      
      query += ' ORDER BY RANDOM() LIMIT 5';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          movies: rows.map(row => ({
          ...row,
          cuisine_match: row.cuisine_match ? JSON.parse(row.cuisine_match) : [],
          meal_type_match: row.meal_type_match ? JSON.parse(row.meal_type_match) : []
        }))
        });
      });
    });
  },

  getMoviesByMealType: (req, res) => {
    const { mealType } = req.params;
    
    db.all(
      'SELECT * FROM movies WHERE meal_type_match LIKE ? ORDER BY RANDOM() LIMIT 5',
      ['%' + mealType + '%'],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          movies: rows.map(row => ({
            ...row,
            cuisine_match: row.cuisine_match ? JSON.parse(row.cuisine_match) : [],
            meal_type_match: row.meal_type_match ? JSON.parse(row.meal_type_match) : []
          }))
        });
      }
    );
  },

  createMovie: (req, res) => {
    const { title, description, type, genre, cuisine_match, meal_type_match, rating, platform, platform_url, image_url, release_year } = req.body;
    db.run(
      `INSERT INTO movies (title, description, type, genre, cuisine_match, meal_type_match, rating, platform, platform_url, image_url, release_year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        type,
        genre,
        JSON.stringify(cuisine_match),
        JSON.stringify(meal_type_match),
        rating,
        platform,
        platform_url,
        image_url,
        release_year
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: 'Movie created successfully',
          movieId: this.lastID
        });
      }
    );
  }
};

module.exports = movieController;
