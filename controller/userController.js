const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util"); // neede to promisify a function
const CatchAsync = require("../utils/CatchAsync");
const AppError = require("../utils/AppError");
const User = require("../model/userModel");

// helper functions to handle token generation
// create a fucntion to create jwt token on login
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// generate the jwt token
const generateToken = (user, statusCode, res) => {
  let token = signToken(user.id);
  user.password = undefined; // remove the password from the response
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// restrict route against normal users
// protect routes will generate the valid user then simply check the role
// note this function has to be called with an array of permitted allowed users in the route handler
exports.restrictRoute = (allowedUsers) =>
  CatchAsync(async (req, res, next) => {
    if (!allowedUsers.includes(req.user.role)) {
      return next(
        new AppError("Action not permitted. You do not have the authority", 404)
      );
    }
    console.log("allowed");
    next();
  });

// add a new user to the database, note: only the admin can add new users
// protect this routes agains normal users: pending
exports.addUser = CatchAsync(async (req, res) => {
  const user = await User.create(req.body);
  user.password = undefined;
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// get all users

exports.getAllUsers = CatchAsync(async (req, res) => {
  const users = await User.find().select({
    posts: 0,
    bookmarkedPosts: 0,
    likedPosts: 0,
  }); // exclude these fields in output

  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

// login user, when the user logs in send the new generated jwt

exports.loginIn = CatchAsync(async (req, res, next) => {
  const { rollNo, password } = req.body;
  if (!rollNo || !password) {
    return next(new AppError("Please provide roll no and password", 400));
  }
  const user = await User.findOne({ rollNo }).select("+password");
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError(new AppError("Invalid roll no or password", 404)));
  }
  generateToken(user, 200, res);
});

// check authentication/jwt token status: used in protecting routes and login status of user
const checkTokenStatus = async (req, next) => {
  let token;
  // 1) check if the token exists, i.e  has been send in the request
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies.jwt;
  }
  // console.log("token:", token);

  if (!token) {
    return next(
      new AppError("Authentication failed, Please login in to gain access", 401)
    );
  }
  // 2) validate the user of the token still exists in the database
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3) check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError("The User of this token has been deleted", 401));
  }
  req.user = freshUser;
};

// use for protecting routes
exports.protect = CatchAsync(async (req, res, next) => {
  await checkTokenStatus(req, next);
  if (req.user) {
    next();
  }
});

// use for checking the login status
exports.checkLoginStatus = CatchAsync(async (req, res, next) => {
  await checkTokenStatus(req, next);
  if (req.user) {
    res.status(200).json({
      status: "success",
      data: {
        message: "User logged in",
        data: req.user,
      },
    });
  }
});

// change password,

exports.changePassword = CatchAsync(async (req, res, next) => {
  // first make sure that the new password is not equal to the old password
  // new password is sent in the body
  // find the particular user and simply update the password after encrypting it first

  //1 check if the new password is equal to the old password
  if (
    req.body.password === req.body.newPassword ||
    req.body.name ||
    req.body.email ||
    req.body.rollNo ||
    req.body.active ||
    req.body.role ||
    req.body.posts ||
    req.body.likedPosts ||
    req.body.bookmarkedPosts
  ) {
    return next(
      new AppError(
        "operation not allowed, make sure the new password is not equal to the old password",
        404
      )
    );
  }

  // 2 find the particular user and match the password
  let user = await User.findById(req.user._id).select("+password");
  if (!user || !(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError(new AppError("Invalid credentials ", 404)));
  }

  //3 encrypt the new password and update the user database
  req.body.password = await bcrypt.hash(req.body.newPassword, 12);
  req.body.newPassword = undefined;

  let updateResponse = await user.updateOne(req.body, {
    new: true,
    runValidators: true,
  });

  console.log(updateResponse);

  // 3) generate a new token
  if (updateResponse) {
    generateToken(user, 200, res);
  } else {
    next(new AppError("No user found", 404));
  }
});

// change password feature: done
//forgot password: pending(use nodemailer to send a new password token to the user, only the token can be ised to change the password)
/* maybe a profile details section showing the details of a particular roll no: like details etc */
