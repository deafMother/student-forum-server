const express = require("express");
const router = express.Router();
const CommentController = require("../controller/CommentController");
const userController = require("../controller/userController");

router
  .route("/newComment")
  .post(userController.protect, CommentController.addComment);

module.exports = router;
