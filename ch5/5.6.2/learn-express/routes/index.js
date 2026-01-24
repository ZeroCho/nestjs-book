const express = require('express');

const router = express.Router();

// GET / 라우터
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});
router.route('/main')
  .get((req, res) => {
    res.send('GET /main');
  })
  .post((req, res) => {
    res.send('POST /main');
  });

module.exports = router;
