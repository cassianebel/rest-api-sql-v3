const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.authenticateUser = async (req, res, next) => {
  let message;

  const credentials = auth(req);

  // Check for user credentials
  if (credentials) {
    const user = await User.findOne({ where: { emailAddress: credentials.name } });
    // If the user was found, compare the passwords
    if (user) {
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      // If the passwords match, store the user on the Request object
      if (authenticated) {
        req.currentUser = user;
      // If the passwords don't match, set a message
      } else {
        message = `Authentication failure for username: ${credentials.name}`;
      }
    // If the user wasn't found, set a message
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  // If credentials weren't provided, set a message
  } else {
    message = 'Auth header not found';
  }

  // If user authentication failed, return a generic message
  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
};