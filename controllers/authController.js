const User = require("../models/User");
const jwt = require('jsonwebtoken');
const Coupon = require('../models/coupons')
const coupons = require('../codes')

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.signup_post = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  console.log(email, password)

  try {
    const user = await User.create({ email, password, firstName, lastName });
    const token = createToken(user._id);
    // res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id, token });
  }
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    // res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(302).json({ user: user._id, token });
  }
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}


module.exports.coupons_get = async (req, res) => {
  console.log("route hit")

  try {
    const user = await Coupon.create({ coupons: coupons });
    res.status(201).json({ user: user._id });
  }
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.checkCoupon = async (req, res) => {
  // console.log()
  const code = req.body.reedomCoupon;
  console.log("I got hit")

  try {
    const response = await Coupon.findOne({ reedeemed_coupons: code })
    console.log("I got hit 2")
    if (response) {
      throw 'this code is expired/already used!'
    }
    const data = await Coupon.findOneAndUpdate({ coupons: code }, { $push: { reedeemed_coupons: code } })
    console.log("I got hit 3")
    if (data) {
      // Users.findOneAndUpdate({name: req.user.name}, {$push: {friends: friend}});
      res.json({ data: data })
    } else {
      throw 'Invalid Coupon code!!!'
    }

    console.log("check")
  } catch (error) {
    console.log(error, error.message)
  }
}