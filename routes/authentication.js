'use strict';

const { Router } = require('express');
const router = new Router();

const User = require('./../models/user');
const bcrypt = require('bcryptjs');
const uploadCloud = require('../middleware/cloudinary');
const defaultPhoto =
  'https://res.cloudinary.com/djjmstl4c/image/upload/v1574848928/Captura_de_ecra%CC%83_2019-11-27_a%CC%80s_09.59.42_ewge48.png';

router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Hello client!'
  });
});

//Sign-Up
router.get('/sign-up', (req, res, next) => {
  res.render('authentication/sign-up');
});

router.post('/sign-up', uploadCloud.single('photo'), (req, res, next) => {
  const { name, email, password, role } = req.body;
  bcrypt
    .hash(password, 10)
    .then(hash => {
      return User.create({
        name,
        email,
        role,
        photo: req.file ? req.file.secure_url : defaultPhoto,
        passwordHash: hash
      });
    })
    .then(user => {
      console.log('Created user', user);
      req.session.user = user._id;
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

// Sign-in
router.get('/sign-in', (req, res, next) => {
  res.render('authentication/sign-in');
});

router.post('/sign-in', (req, res, next) => {
  let userId;
  const { email, password } = req.body;

  User.findOne({
    email
  })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        return bcrypt.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        req.session.user = userId;
        res.redirect('/profile/' + userId);
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch(error => {
      next(error);
    });
});

// Sign Out
router.get('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
