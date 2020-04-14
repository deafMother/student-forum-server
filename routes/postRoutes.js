const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const postController = require("../controller/postController");

router
  .route("/")
  .post(userController.protect, postController.addPost)
  .get(userController.protect, postController.allPost);

router
  .route("/:postId")
  .get(userController.protect, postController.getPost)
  .patch(userController.protect, postController.addLike);

router
  .route("/bookmark/:postId")
  .patch(userController.protect, postController.addBookmark);

router
  .route("/remove/:postId/:visible")
  .patch(
    userController.protect,
    userController.restrictRoute(["admin"]),
    postController.removePost
  );

module.exports = router;
