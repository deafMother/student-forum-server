const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

// only admins should be able to add new users
router
  .route("/")
  .all(userController.protect, userController.restrictRoute(["admin"]))
  .post(userController.addUser)
  .get(userController.getAllUsers);

router.route("/login").get(userController.loginIn);

router.route("/checkLoginStatus").get(userController.checkLoginStatus);
router
  .route("/changePassword")
  .patch(userController.protect, userController.changePassword);

module.exports = router;
