const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A post title must be provided"],
  },
  detail: {
    type: String,
    required: [true, "The post detail is required"],
  },
  postedBy: {
    // use a pre save middleware to extract user id from the jwt token
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [
      true,
      "Please provide the user id of the user who posted this post",
    ],
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  postedOn: {
    type: Date,
    default: Date.now,
    required: [true, "Please provide the post date"],
  },
  category: {
    type: String,
    enum: ["I", "II", "III", "IV", "V", "VI", "General"],
    required: [true, "Please provide a category"],
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

// PostSchema.pre("save", async function(next) {
// this will refer to the post instance
//   console.log(this._id);
//   next();
// });

const Posts = mongoose.model("Post", PostSchema);
module.exports = Posts;

//add post categories so so that the  posts can be filtered: the categories should be various semesters, and something by the teachers- like 'general posts'
