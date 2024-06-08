const express = require('express');

const router = express.Router();

const { User, Course } = require('./models');


function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

// GET users 
router.get('/users', asyncHandler(async (req, res) => {
}));

// POST users 
router.post('/users', asyncHandler(async (req, res) => {
  await User.create(req.body);
  res.status(201).location('/').end();
}));

// GET courses
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User,
        as: 'userId',
      },
    ],
  });
  res.json(courses);
  res.status(200).end();
}));

// GET course
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'userId',
      },
    ],
  });
  res.json(course);
  res.status(200).end();
}));

// POST courses
router.post('/courses', asyncHandler(async (req, res) => {
  await Course.create(req.body);
  res.status(201).location('/').end();
}));




module.exports = router;