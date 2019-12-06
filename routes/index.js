'use strict';

const { Router } = require('express');
const router = new Router();

const User = require('./../models/user');

router.get('/', (req, res, next) => {
  User.find({
    role: 'seller'
  }).then(allTeachers => {
    if (!allTeachers) {
      return Promise.reject(new Error('There are no teachers.'));
    } else {
      res.render('index', { allTeachers });
    }
  });

  // res.render('index', {
  //   title: 'Hello client!'
  // });
});

module.exports = router;
