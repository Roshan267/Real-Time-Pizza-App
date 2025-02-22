const passport = require('passport');
const User = require('../../models/user');
const bcrypt = require('bcrypt');

function authController() {

  const _getRedirectUrl = (req) =>{
    return req.user.role === 'admin' ? '/admin/orders' :'/customer/orders'
  }
  return {
    login(req, res) {
      res.render('auth/login');
    },

    postLogin(req, res, next) {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          req.flash('error', info.message);
          return next(err);
        }
        if (!user) {
          req.flash('error', info.message);
          return res.redirect('/login');
        }

        req.logIn(user, (err) => {
          if (err) {
            req.flash('error', info.message);
            return next(err);
          }


          return res.redirect(_getRedirectUrl(req));
        });

      })(req, res, next);
    },

    register(req, res) {
      res.render('auth/register');
    },

    async postRegister(req, res) {
      const { name, email, password } = req.body;

      // Validate request
      if (!name || !email || !password) {
        req.flash('error', 'All fields are required');
        req.flash('name', name);
        req.flash('email', email);
        return res.redirect('/register');
      }

      // Check if email exists
      const userExists = await User.exists({ email: email });
      if (userExists) {
        req.flash('error', 'Email already taken');
        req.flash('name', name);
        req.flash('email', email);
        return res.redirect('/register');
      }

      // Hash password
      const hashPassword = await bcrypt.hash(password, 10);

      // Create a user
      const user = new User({
        name,
        email,
        password: hashPassword
      });

      user.save()
        .then(() => {
          // Login
          return res.redirect('/');
        })
        .catch(err => {
          req.flash('error', 'Something went wrong');
          return res.redirect('/register');
        });

    },

    logout(req, res, next) {
      req.logout(err => {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
    }
  };
}

module.exports = authController;
