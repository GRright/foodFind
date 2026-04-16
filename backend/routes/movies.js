const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);
router.get('/recommend/:recipeId', movieController.getMoviesByRecipe);
router.get('/recommend/meal/:mealType', movieController.getMoviesByMealType);
router.post('/', movieController.createMovie);

module.exports = router;
