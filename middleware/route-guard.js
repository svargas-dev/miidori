// Route Guard Middleware
// This piece of middleware is going to check if a user is authenticated
// If not, it sends the request to the custom error handler with a message
const User = require('./../models/user');

module.exports = (req, res, next) => {
  const profileId = req.params.id;

  User.findById(profileId)
    .then(userData => {
      if (
        (req.user && userData.role === 'seller') ||
        (userData.role === 'client' &&
          req.params.id.toString() === req.user._id.toString())
      ) {
        next();
      } else {
        next(new Error('Please log in to see the producers page.'));
      }
    })
    .catch(error => {
      next(error);
    });
};

// router.get('/:postId/edit', routeGuard, (req, res, next) => {
//   const postId = req.params.postId;
//   Post.findById(postId)
//     .then(post => {
//       if (post.author === req.session.user) {
//         res.render('post/edit', {
//           post
//         });
//       } else {
//         next(new Error('User has no permission to edit post.'));
//       }
//     })
//     .catch(error => {
//       next(error);
//     });
// });
