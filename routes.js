const express = require('express');

const router = express.Router();

const { User, Course } = require('./models');

const { authenticateUser } = require('./middleware/auth');


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

// GET users - return the current authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddress
  });
}));

// POST users - create a new user
router.post('/users', asyncHandler(async (req, res) => {
  try {
    await User.create(req.body);
    res.status(201).location('/').end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      throw error;
    }
  }
  
}));

// GET courses - return a list of courses
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    attributes: { 
      exclude: ['createdAt', 'updatedAt'] 
    },
    include: [
      {
        model: User,
        attributes: { 
          exclude: ['createdAt', 'updatedAt', 'password'] 
        },
      },
    ],
  });
  res.json(courses);
  res.status(200).end();
}));

// GET course - return a single course
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: { 
        exclude: ['createdAt', 'updatedAt'] 
      },
    include: [
      {
        model: User,
        attributes: { 
          exclude: ['createdAt', 'updatedAt', 'password'] 
        },
      },
    ],
  });
  res.json(course);
  res.status(200).end();
}));

// POST courses - create a new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
    let course = await Course.create(req.body);
    let id = course.get('id');
    res.status(201).location('/courses/' + id).end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      throw error;
    }
  }
}));

// PUT courses - update a course
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;

  try {
    const course = await Course.findByPk(req.params.id);
    
    if (user.id === course.userId) {
      await course.update(req.body);
      res.status(204).end();
    } else {
      res.status(403).end();
    }
    
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      throw error;
    }
  }
}));

// DELETE courses - delete a course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);

  if (user.id === course.userId) {
    await course.destroy();
    res.status(204).end();
  } else {
    res.status(403).end();
  }
}));


module.exports = router;