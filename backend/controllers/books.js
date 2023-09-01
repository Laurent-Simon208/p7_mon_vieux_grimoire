const Book = require('../models/Book');
const mongoose = require('mongoose');
const fs = require('fs');
const { log } = require('console');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error: error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error: error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};


exports.bestRatingBook = (req, res, next) => {
  Book.find()
    .then(book => {
      book.sort((a,b) => b.averageRating - a.averageRating)
      const threeBooks = book.slice(0, 3);
      res.status(200).json(threeBooks);
    }
  )
    .catch(error => {
      res.status(400).json({ error: error });
    });
};


exports.addRating = (req, res, next) => {
  const userId = req.auth.userId;
  const {rating} = req.body; 
  const userRating = {userId, grade:rating};

  Book.findByIdAndUpdate({ _id: req.params.id }, {$push: {ratings: userRating}}, {new: true})
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
        const totalRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        const averageRating = totalRatings / book.ratings.length;
        book.averageRating = averageRating;
        return book
          .save()
          .then(() =>
            res.status(201).json(book)
          )
          .catch((error) => {
            res.status(400).json({ error });
          });
      
    })
    .catch((error) => res.status(500).json({ error }));
};
