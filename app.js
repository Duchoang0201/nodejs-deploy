const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors"); // cho phép Export API để bên FE get về

const passport = require("passport");
require("dotenv").config();

// Định nghĩa các routes(IMPORTS)
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const suppliersRouter = require("./routes/suppliers");
const employeesRouter = require("./routes/employees");
const customersRouter = require("./routes/customers");
const actionRouter = require("./routes/action");
const categoriesRouter = require("./routes/categories");
const ordersRouter = require("./routes/orders");
const questionsRouter = require("./routes/questions");
const uploadRouter = require("./routes/upload");
// Routes for writting in file

//test mongoDB
// const db = require('./config/db/index');
// db.connect()

// MONGOOSE
const { default: mongoose } = require("mongoose");
const { CONNECTION_STRING } = require("./constants/dbSettings");

const {
  passportConfig,
  passportConfigLocal,
} = require("./middlewares/passport");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json()); //khả năng xử lý với Json ( cần thiết)
app.use(express.urlencoded({ extended: false })); //Làm cho đường dẫn trở nên an toàn ( ví dụ dấu cách chuyển thành % vd: NGUYEN VAN -> NGUYEN%VAN)
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Export API
app.use(
  cors({
    origin: "*",
  })
);

// MONGOOSE
mongoose.set("strictQuery", false);
mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (err) => {
  if (err) {
    console.error(err);

    mongoose.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

// DKy Passport
passport.use(passportConfig);
passport.use(passportConfigLocal);

// Đăng ký các routes vào express ( REGISTER ROUTERS)
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/suppliers", suppliersRouter);
app.use("/employees", employeesRouter);
app.use("/customers", customersRouter);
app.use("/action", actionRouter);
app.use("/categories", categoriesRouter);
app.use("/orders", ordersRouter);
app.use("/questions", questionsRouter);

app.use("/upload", uploadRouter);

app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
