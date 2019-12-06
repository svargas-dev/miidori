'use strict';

const { Router } = require('express');
const router = new Router();
const User = require('./../models/user');
const uploadCloud = require('../middleware/cloudinary');

const bcrypt = require('bcryptjs');

const routeGuard = require('./../middleware/route-guard');
const defaultPhoto =
  'https://res.cloudinary.com/djjmstl4c/image/upload/v1574848928/Captura_de_ecra%CC%83_2019-11-27_a%CC%80s_09.59.42_ewge48.png';
// router.get('/profile/:id', routeGuard, (req, res, next) => {
//   console.log(req.params.id);
//   res.render('user');
//   //used to be private instead of user
// });

router.get('/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const loggedUser = req.user;
  console.log('dentro do get:id', req.params.id);
  User.findById(id)
    .then(user => {
      //   console.log('check if its the params user -> ', user);
      res.render('user/single', {
        user,
        loggedUser
      });
    })
    .catch(error => {
      next(error);
    });
});

router.get('/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const loggedUser = req.user;

  User.findById(id)
    .then(user => {
      res.render('user/edit', {
        user,
        loggedUser
      });
    })
    .catch(error => {
      next(error);
    });
});
//para edit photo
router.post('/:id/edit', uploadCloud.single('photo'), (req, res, next) => {
  const id = req.params.id;
  const { name, email, role, latitude, longitude } = req.body;

  User.findById(id).then(user => {
    User.findByIdAndUpdate(id, {
      name,
      email,
      //está-me a dar sempre a defaultPhoto quando edito a fotografia
      photo: req.file ? req.file.secure_url : user.photo,
      role,
      ...(longitude &&
        latitude && {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        })
    })
      .then(user => {
        console.log('after updating user ->', user);
        res.redirect('/profile/' + user._id);
      })
      .catch(error => {
        next(error);
      });
  });
});

// DELETE PROFILE

router.get('/:id/delete', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const loggedUser = req.user;
  console.log('dentro do get:id', req.params.id);
  User.findById(id)
    .then(user => {
      res.render('user/userDelete', {
        user,
        loggedUser
      });
    })
    .catch(error => {
      next(error);
    });
});

router.post('/:id/delete', (req, res, next) => {
  const id = req.params.id;
  const loggedUser = req.user;
  console.log(id, loggedUser);
  if (JSON.stringify(loggedUser._id) === JSON.stringify(id)) {
    User.findByIdAndDelete(id)
      .then(user => {
        console.log('just deleted this user->', user);
        res.redirect('/');
      })
      .catch(error => {
        next(error);
      });
  }
});
module.exports = router;
