const CatchAsync = require("../utils/CatchAsync");
const AppError = require("../utils/AppError");
const Posts = require("../model/postModel");
const User = require("../model/userModel");
const Comment = require("../model/CommentModel");

exports.addComment = CatchAsync(async (req, res, next) => {
  // add a new comment to a post
  // update the user data with this comment id
  // update a post with this comment id

  /* 
    the requset body will contain all info regarding the new comment
  */
  req.body.commentedBy = req.user._id;
  console.log(req.body);
  const userId = req.body.commentedBy;
  const { postedFor } = req.body;
  let comment = await Comment.create(req.body);
  let commentId = comment._id;
  await User.findByIdAndUpdate(userId, {
    $push: {
      comments: commentId,
    },
  });

  await Posts.findByIdAndUpdate(postedFor, {
    $push: {
      comments: commentId,
    },
  });

  res.status(200).json({
    status: "success",
    data: comment,
  });
});

/* 
  flag innapropriate comment,delete a comment
*/
