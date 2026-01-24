const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  next('route');
}, (req, res, next) => {
  console.log('두 번째 미들웨어는 실행되지 않습니다');
  next();
}, (req, res, next) => {
  console.log('세 번째 미들웨어는 실행되지 않습니다');
  next();
});
router.get('/', (req, res) => {
  console.log('실행됩니다');
  res.send('Hello, Express');
});
router.route('/main')
  .get((req, res) => {
    res.send('GET /main');
  })
  .post((req, res) => {
    res.send('POST /main');
  });

module.exports = router;
