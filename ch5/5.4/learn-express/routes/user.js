const express = require('express');

const router = express.Router();

// GET /user 라우터
router.get('/', (req, res) => {
  res.send('Hello, User');
});
router.get('/user/:id', (req, res) => {
  console.log('얘만 실행됩니다.');
  res.send('Hello, User');
});
router.get('/user/like', (req, res) => {
  console.log('전혀 실행되지 않습니다.');
});

module.exports = router;
