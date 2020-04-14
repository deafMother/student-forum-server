const express = require("express");
const cors = require("cors");

const globalErrorHandler = require("./utils/ErrorHandler");
const AppError = require("./utils/AppError");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const commentRouter = require("./routes/commentRoutes");

const app = express();
app.use(cors());

// body parser
app.use(express.json());

//  serving static files
app.use(express.static(__dirname + "/public"));

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(req.method + " : " + req.url);
    //console.log(req.headers);
    next();
  });
}

// routes
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/comments", commentRouter);

// default undefined routes
app.all("*", (req, res, next) => {
  // throw error using AppError
  next(new AppError("This route is not defined", 404));
});

// global error handler:
app.use(globalErrorHandler);

module.exports = app;
