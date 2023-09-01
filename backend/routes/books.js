const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/sharp-multer');

const booksCtrl = require('../controllers/books');

router.get('/bestrating', booksCtrl.bestRatingBook);
router.get('/', booksCtrl.getAllBooks);
router.post('/', auth, multer, booksCtrl.createBook);
router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.addRating);


module.exports = router;