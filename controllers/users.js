const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/validation-error');
const ServerError = require('../errors/server-error');
const NotFoundError = require('../errors/not-found-error');
const CastError = require('../errors/cast-error');
const AuthorisationError = require('../errors/authorisation-error');

const { JWT_SECRET } = process.env;

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      throw new ServerError(`Server error: ${err}`);
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('User not found');
      } else if (err.name === 'CastError') {
        throw new CastError('Wrong user Id');
      } else {
        throw new ServerError(`Server error: ${err}`);
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
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
        throw new ValidationError('Validation error');
      } else {
        throw new ServerError(`Server error: ${err}`);
      }
    })
    .catch(next);
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true,
      }).send({ message: 'Authorisation successful' });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        throw new AuthorisationError('Wrong email or password');
      } else {
        throw new ServerError(`Server error: ${err}`);
      }
    })
    .catch(next);
};

const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .then((user) => res.status(200).send(user))
    .catch((err) => res.send({ message: err }));
};

const updateUserInfo = (req, res, next) => {
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
        throw new NotFoundError('User not found');
      } else if (err.name === 'ValidationError') {
        throw new ValidationError('Validation error');
      } else if (err.name === 'CastError') {
        throw new CastError('Wrong user Id');
      } else {
        throw new ServerError(`Server error: ${err}`);
      }
    })
    .catch(next);
};

const updateUserAvatar = (req, res, next) => {
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
        throw new NotFoundError('User not found');
      } else if (err.name === 'ValidationError') {
        throw new ValidationError('Validation error');
      } else if (err.name === 'CastError') {
        throw new CastError('Wrong user Id');
      } else {
        throw new ServerError(`Server error: ${err}`);
      }
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  loginUser,
  getCurrentUser,
};
