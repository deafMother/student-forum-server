const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

// database config;

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 8000;
console.log(DB_URL);
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connected successfully");
    app.listen(PORT, () => {
      console.log("Server running on port..." + PORT);
    });
  })
  .catch((err) => {
    console.log("Error in connection", err);
  });
