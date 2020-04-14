const mongoose = require("mongoose");
const validator = require("validator");

const CommentSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "A comment message must be provided"],
  },
  commentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [
      true,
      "Please provide the user id of the user who comment this message",
    ],
  },
  postedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: [
      true,
      "Please provide the post id of the post for which this comment belongs to",
    ],
  },
  commentedOn: {
    type: Date,
    default: Date.now,
    required: [true, "Please provide the comment date"],
  },
});
const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
