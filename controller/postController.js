const CatchAsync = require("../utils/CatchAsync");
const AppError = require("../utils/AppError");
const Posts = require("../model/postModel");
const User = require("../model/userModel");
const features = require("../utils/Features");

/*
    add a new post: when a user makes a new post the user document must also be updated to contain the the new post id
*/

exports.addPost = CatchAsync(async (req, res) => {
  req.body.postedBy = req.user._id;
  const post = await Posts.create(req.body);
  if (post) {
    // add the  post id to the users data document
    const postId = post._id;
    await User.findByIdAndUpdate(req.body.postedBy, {
      $push: {
        posts: postId, // pushing  the id of the post to the  posts array
      },
    });
  }

  res.status(200).json({
    status: "Success",
    data: post,
  });
});

// fetch all posts: pagination and sorting available

exports.allPost = CatchAsync(async (req, res, next) => {
  // users can fetch only visible posts
  let visible = {};
  if (req.user.role === "user") {
    visible = { visible: true };
  }
  let postsQuery = Posts.find(visible);

  // note: the postQuery is an object ubtil we call await on it it will no perform the query execution
  features.filter(postsQuery, req);
  features.sortPosts(postsQuery);
  features.paginationPosts(postsQuery, req);

  let posts = await postsQuery;
  if (posts) {
    res.status(200).json({
      status: "success",
      data: posts,
    });
  } else {
    return next(new AppError("No Post Found/Error retrieving posts", 404));
  }
});

/*  
  fetch single post by id
*/
exports.getPost = CatchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Posts.findById(postId)
    .populate("postedBy")
    .populate({
      path: "comments",
      options: { sort: "-commentedOn" }, // sorting the populated filed
    });

  if (req.user.role === "admin") {
    // admin can view all post even invisible posts
    if (post) {
      res.status(200).json({
        status: "success",
        data: post,
      });
    } else {
      return next(new AppError("No Post Found/Post Removed/Error", 404));
    }
  } else if (req.user.role === "user") {
    if (post && post.visible === true) {
      res.status(200).json({
        status: "success",
        data: post,
      });
    } else {
      return next(new AppError("No Post Found/Post Removed/Error", 404));
    }
  }
});

/* 
    add remove likes on posts,
    if a user has already liked then remove the like on the post
    the user data also contains a list of liked posts
    : this middleware has not yet been implemented
*/

// this route is protected so the user id is prefetched by the protect middleware
exports.addLike = CatchAsync(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  //1) check if the post is already liked liked if so then remove it

  if (await Posts.findOne({ likes: userId })) {
    // remove from post and user the liked data
    await Posts.findByIdAndUpdate(postId, {
      $pull: {
        likes: userId, // removing  the id of the user from  the  posts like array
      },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: {
        likedPosts: postId, // removing  the id of the post to the  user  likedpost array
      },
    });
    res.status(200).json({
      status: "success",
      message: "liked removed",
    });
    return;
  } else {
    // 2) if the post is not liked then update post and user data
    await Posts.findByIdAndUpdate(postId, {
      $addToSet: {
        likes: userId, // pushing  the id of the user to the  posts array
      },
    }); //likedPosts
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        likedPosts: postId, // pushing  the id of the post to the  posts array
      },
    });
    res.status(200).json({
      status: "success",
      message: "post liked",
    });
  }
});

// this route is protected so the user id is prefetched by the protect middleware
exports.addBookmark = CatchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  // first find if the post exists
  const post = await Posts.findById(postId);
  if (post) {
    //1) check if the post is already bookmarked liked if so then remove it
    if (await User.findOne({ bookmarkedPosts: postId })) {
      // if already bookmarked then remove from bookmarked list
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            bookmarkedPosts: postId, // removing  the id of the post from the bookmarkedposts array
          },
        },
        {
          runValidators: true,
        }
      );
      res.status(200).json({
        status: "success",
        message: "bookmark removed",
      });
      return;
    } else {
      // 2) if the post is not bookmarked then update user data
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            bookmarkedPosts: postId, // pushing  the id of the post to the  posts array
          },
        },
        {
          runValidators: true,
        }
      );
      res.status(200).json({
        status: "success",
        message: "bookmark  added",
      });
    }
  } else {
    return next(new AppError("Unable to find post", 404));
  }
});

// only admin can remove a post

exports.removePost = CatchAsync(async (req, res, next) => {
  // when we remove a post we set its isibility to false, but still keep it in the database

  const { postId, visible } = req.params;

  const post = await Posts.findByIdAndUpdate(
    postId,
    {
      visible,
    },
    {
      runValidators: true,
      new: true,
    }
  );

  if (post) {
    res.status(200).json({
      status: "success",
      message: "Post removed",
      post,
    });
  } else {
    return next(new AppError("No post found", 404));
  }
});

// add likes,comment, bookmark: to a post,  remove post :done

// flag innapropriate posts :pending
