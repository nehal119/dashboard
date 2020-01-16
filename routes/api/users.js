const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');


// User Model
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register new user
// @access  Public
router.post('/', (req, res) => {
  const { name,userName, email, password } = req.body;

  // Simple validation
  if(!name ||!userName || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ userName })
    .then(user => {
      if(user) return res.status(400).json({ msg: 'Username already taken' });
    })

  User.findOne({ email })
    .then(user => {
      if(user) return res.status(400).json({ msg: 'Email already exists' });

      const newUser = new User({
        name,
        userName,
        email,
        password
      });

      // Create salt & hash
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => {
              jwt.sign(
                { id: user.id },
                config.get('jwtSecret'),
                { expiresIn: 3600 },
                (err, token) => {
                  if(err) throw err;
                  res.json({
                    token,
                    user: {
                      id: user.id,
                      name: user.name,
                      userName: user.userName,
                      email: user.email
                    }
                  });
                }
              )
            });
        })
      })
    })
});

module.exports = router;
