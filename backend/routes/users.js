const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.get('/:id/preferences', userController.getPreferences);
router.put('/:id/preferences', userController.updatePreferences);

module.exports = router;
