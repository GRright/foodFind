const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/:userId', menuController.getUserMenus);
router.get('/:userId/week', menuController.getWeeklyMenu);
router.post('/generate', menuController.generateMenu);
router.post('/', menuController.createMenuItem);
router.put('/:id', menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);
router.post('/replace', menuController.replaceRecipe);

module.exports = router;
