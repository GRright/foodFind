require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./config/database');
const { insertSampleData } = require('./data/sample-data');

const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');
const menuRoutes = require('./routes/menus');
const movieRoutes = require('./routes/movies');
const feedbackRoutes = require('./routes/feedback');
const recommendationRoutes = require('./routes/recommendations');
const onboardingRoutes = require('./routes/onboarding');

app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FoodFind API is running!' });
});

setTimeout(() => {
  insertSampleData();
}, 1000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
