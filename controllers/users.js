const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      res.status(500).send({ message: `Error occurred: ${err}` });
    });
};

const getUserById = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res.status(404).send({ message: 'User not found' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Wrong user Id' });
      } else {
        res.status(500).send({ message: `Error occurred: ${err}` });
      }
    });
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Validation error' });
      } else {
        res.status(500).send({ message: `Error occurred: ${err}` });
      }
    });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .orFail(new Error('NotValidData'))
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'definetely-secret-key', { expires: '7d' });

      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true,
      }).status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'NotValidData') {
        res.status(404).send({ message: 'Wrong email or password' });
      } else {
        res.status(500).send({ message: `Error occurred: ${err}` });
      }
    });
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res.status(404).send({ message: 'User not found' });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Validation error' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Wrong user Id' });
      } else {
        res.status(500).send({ message: `Error occurred: ${err}` });
      }
    });
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res.status(404).send({ message: 'User not found' });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Validation error' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Wrong user Id' });
      } else {
        res.status(500).send({ message: `Error occurred: ${err}` });
      }
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  loginUser,
};
