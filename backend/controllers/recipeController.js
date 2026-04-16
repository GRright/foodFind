const db = require('../config/database');

const recipeController = {
  getAllRecipes: (req, res) => {
    const { page = 1, limit = 20, cuisine_type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM recipes';
    let params = [];
    
    if (cuisine_type) {
      query += ' WHERE cuisine_type = ?';
      params.push(cuisine_type);
    }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        recipes: rows.map(row => ({
          ...row,
          ingredients: JSON.parse(row.ingredients),
          steps: JSON.parse(row.steps),
          nutrition: row.nutrition ? JSON.parse(row.nutrition) : {},
          tags: row.tags ? JSON.parse(row.tags) : []
        }))
      });
    });
  },

  getRecipeById: (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      res.json({
        recipe: {
          ...row,
          ingredients: JSON.parse(row.ingredients),
          steps: JSON.parse(row.steps),
          nutrition: row.nutrition ? JSON.parse(row.nutrition) : {},
          tags: row.tags ? JSON.parse(row.tags) : []
        }
      });
    });
  },

  createRecipe: (req, res) => {
    const { name, description, ingredients, steps, nutrition, tags, cuisine_type, difficulty, cooking_time, image_url } = req.body;
    db.run(
      `INSERT INTO recipes (name, description, ingredients, steps, nutrition, tags, cuisine_type, difficulty, cooking_time, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        JSON.stringify(ingredients),
        JSON.stringify(steps),
        JSON.stringify(nutrition),
        JSON.stringify(tags),
        cuisine_type,
        difficulty || 'medium',
        cooking_time,
        image_url
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
          message: 'Recipe created successfully',
          recipeId: this.lastID
        });
      }
    );
  },

  updateRecipe: (req, res) => {
    const { id } = req.params;
    const { name, description, ingredients, steps, nutrition, tags, cuisine_type, difficulty, cooking_time, image_url } = req.body;
    db.run(
      `UPDATE recipes 
       SET name = ?, description = ?, ingredients = ?, steps = ?, nutrition = ?, 
           tags = ?, cuisine_type = ?, difficulty = ?, cooking_time = ?, image_url = ?
       WHERE id = ?`,
      [
        name,
        description,
        JSON.stringify(ingredients),
        JSON.stringify(steps),
        JSON.stringify(nutrition),
        JSON.stringify(tags),
        cuisine_type,
        difficulty,
        cooking_time,
        image_url,
        id
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Recipe updated successfully' });
      }
    );
  },

  deleteRecipe: (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM recipes WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Recipe deleted successfully' });
    });
  },

  searchRecipes: (req, res) => {
    const { q } = req.query;
    const searchTerm = `%${q}%`;
    db.all(
      'SELECT * FROM recipes WHERE name LIKE ? OR description LIKE ? OR tags LIKE ?',
      [searchTerm, searchTerm, searchTerm],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          recipes: rows.map(row => ({
            ...row,
            ingredients: JSON.parse(row.ingredients),
            steps: JSON.parse(row.steps),
            nutrition: row.nutrition ? JSON.parse(row.nutrition) : {},
            tags: row.tags ? JSON.parse(row.tags) : []
          }))
        });
      }
    );
  },

  getRecommendedRecipes: (req, res) => {
    const { userId } = req.params;
    db.all('SELECT * FROM recipes ORDER BY RANDOM() LIMIT 10', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        recipes: rows.map(row => ({
          ...row,
          ingredients: JSON.parse(row.ingredients),
          steps: JSON.parse(row.steps),
          nutrition: row.nutrition ? JSON.parse(row.nutrition) : {},
          tags: row.tags ? JSON.parse(row.tags) : []
        }))
      });
    });
  }
};

module.exports = recipeController;
