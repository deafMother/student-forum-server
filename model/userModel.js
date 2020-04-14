const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide a user name"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
      //select: false //wont show up in the output even in the middlewares like login etc
    },
    passwordConfirm: {
      type: String,
      required: [true, "please provide a password"],
      validate: {
        // this only works on new doc creation !!
        validator: function (value) {
          return value === this.password;
        },
        message: "Password not matching",
      },
    },
    rollNo: {
      type: String,
      required: [true, "please provide a roll no"],
      unique: [true, "User with this roll-no already exists"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      //unique: true, note: this should be unique in production
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "faculty"],
      default: "user",
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    bookmarkedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.checkPassword = async function (
  givenPassword,
  userPassword
) {
  //console.log(this.password);
  return await bcrypt.compare(givenPassword, userPassword);
};

// pre save middleware
userSchema.pre("save", async function (next) {
  console.log("Pre save password encryption running");
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
