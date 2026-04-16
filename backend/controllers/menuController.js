const db = require('../config/database');

const menuController = {
  getUserMenus: (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = 'SELECT m.*, r.name as recipe_name, r.image_url FROM menus m LEFT JOIN recipes r ON m.recipe_id = r.id WHERE m.user_id = ?';
    let params = [userId];
    
    if (startDate && endDate) {
      query += ' AND m.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY m.date, m.meal_type';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ menus: rows });
    });
  },

  getWeeklyMenu: (req, res) => {
    const { userId } = req.params;
    const { weekStart } = req.query;
    
    const startDate = weekStart || new Date().toISOString().split('T')[0];
    
    db.all(
      `SELECT m.*, r.name as recipe_name, r.image_url, r.nutrition, r.cuisine_type
       FROM menus m 
       LEFT JOIN recipes r ON m.recipe_id = r.id 
       WHERE m.user_id = ? AND m.date >= ? AND m.date < date(?, '+7 days')
       ORDER BY m.date, m.meal_type`,
      [userId, startDate, startDate],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          weeklyMenu: rows.map(row => ({
            ...row,
            nutrition: row.nutrition ? JSON.parse(row.nutrition) : {}
          }))
        });
      }
    );
  },

  generateMenu: (req, res) => {
    const { userId, startDate, days = 7, mode = 'balanced', excludeMeals = [] } = req.body;
    
    db.all('SELECT * FROM recipes ORDER BY RANDOM()', [], (err, recipes) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const mealTypes = ['breakfast', 'lunch', 'dinner'];
      const generatedMenus = [];
      const usedRecipeIds = new Set();
      
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        mealTypes.forEach(mealType => {
          const isExcluded = excludeMeals.some(ex => ex.date === dateStr && ex.mealType === mealType);
          
          if (isExcluded) {
            generatedMenus.push({
              user_id: userId,
              date: dateStr,
              meal_type: mealType,
              is_eating_out: 1
            });
          } else {
            let recipe = null;
            for (const r of recipes) {
              if (!usedRecipeIds.has(r.id)) {
                recipe = r;
                usedRecipeIds.add(r.id);
                if (usedRecipeIds.size >= recipes.length * 0.3) {
                  usedRecipeIds.clear();
                }
                break;
              }
            }
            
            if (!recipe) {
              recipe = recipes[Math.floor(Math.random() * recipes.length)];
            }
            
            generatedMenus.push({
              user_id: userId,
              date: dateStr,
              meal_type: mealType,
              recipe_id: recipe.id,
              is_eating_out: 0
            });
          }
        });
      }
      
      const insertPromises = generatedMenus.map(menu => {
        return new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO menus (user_id, date, meal_type, recipe_id, is_eating_out) VALUES (?, ?, ?, ?, ?)',
            [menu.user_id, menu.date, menu.meal_type, menu.recipe_id, menu.is_eating_out],
            function(err) {
              if (err) reject(err);
              else resolve({ ...menu, id: this.lastID });
            }
          );
        });
      });
      
      Promise.all(insertPromises)
        .then(savedMenus => {
          res.json({ 
            message: 'Menu generated successfully',
            menus: savedMenus
          });
        })
        .catch(err => {
          res.status(500).json({ error: err.message });
        });
    });
  },

  createMenuItem: (req, res) => {
    const { user_id, date, meal_type, recipe_id, is_eating_out = 0 } = req.body;
    db.run(
      'INSERT INTO menus (user_id, date, meal_type, recipe_id, is_eating_out) VALUES (?, ?, ?, ?, ?)',
      [user_id, date, meal_type, recipe_id, is_eating_out],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
          message: 'Menu item created successfully',
          menuId: this.lastID
        });
      }
    );
  },

  updateMenuItem: (req, res) => {
    const { id } = req.params;
    const { recipe_id, is_eating_out } = req.body;
    db.run(
      'UPDATE menus SET recipe_id = ?, is_eating_out = ? WHERE id = ?',
      [recipe_id, is_eating_out, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Menu item updated successfully' });
      }
    );
  },

  deleteMenuItem: (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM menus WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Menu item deleted successfully' });
    });
  },

  replaceRecipe: (req, res) => {
    const { menuId, excludeRecipeIds = [] } = req.body;
    
    db.get('SELECT * FROM menus WHERE id = ?', [menuId], (err, menu) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!menu) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      
      let query = 'SELECT * FROM recipes WHERE id NOT IN (?)';
      let params = [menu.recipe_id, ...excludeRecipeIds];
      
      db.all(query + ' ORDER BY RANDOM() LIMIT 1', params, (err, recipes) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (recipes.length === 0) {
          return res.status(404).json({ error: 'No alternative recipes found' });
        }
        
        const newRecipe = recipes[0];
        db.run(
          'UPDATE menus SET recipe_id = ? WHERE id = ?',
          [newRecipe.id, menuId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ 
              message: 'Recipe replaced successfully',
              newRecipe: {
                ...newRecipe,
                ingredients: JSON.parse(newRecipe.ingredients),
                steps: JSON.parse(newRecipe.steps),
                nutrition: newRecipe.nutrition ? JSON.parse(newRecipe.nutrition) : {},
                tags: newRecipe.tags ? JSON.parse(newRecipe.tags) : []
              }
            });
          }
        );
      });
    });
  }
};

module.exports = menuController;
