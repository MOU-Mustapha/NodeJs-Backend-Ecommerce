const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors")
const compression = require("compression")

dotenv.config({ path: "config.env" });

const databaseConnect = require("./config/database");
// after refactor the mount routes
const mountRoutes = require("./routes");

const ApiError = require("./utils/apiError");
const globalErrorHandler = require("./middlewares/errorMiddleware");

// connect with database
databaseConnect();

// express app
const app = express();

// to make all the domains access the application (APIs)
app.use(cors())
app.options('*', cors()) 

// to compress all the responses to better performance 
app.use(compression())

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
    console.log(`Mode: ${process.env.NODE_ENV}`);
}

// routes
mountRoutes(app);
// app.use("/api/v1/categories", categoryRoute);
// app.use("/api/v1/subcategories", subCategoryRoute);
// app.use("/api/v1/brands", brandRoute);
// app.use("/api/v1/products", productRoute);
// app.use("/api/v1/reviews", reviewRoute);
// app.use("/api/v1/users", userRoute);
// app.use("/api/v1/auth", authRoute);
// app.use("/api/v1/wishlist", wishlistRoute);
// app.use("/api/v1/addresses", addressesRoute);
// app.use("/api/v1/coupons", couponRoute);
app.all("*", (req, res, next) => {
    // create error
    // const err = new Error(`cant't find this route: ${req.originalUrl}`);
    // send the error to error handling middleware
    // next(err.message);

    // generate error using reusable class (ApiError class)
    next(new ApiError(`cant't find this route: ${req.originalUrl}`, 400));
});

// global error handling middleware (inside express)
app.use(globalErrorHandler);

const { PORT, NODE_ENV } = process.env;
const server = app.listen(PORT, () => {
    console.log(`app running on port ${PORT} and the environment is: ${NODE_ENV}`);
});

// global rejections handling (outside express)
process.on("unhandledRejection", (err) => {
    console.log(`unhandled rejection errors: ${err.name} | ${err.message}`);
    server.close(() => {
        console.log("shutting down the server");
        process.exit(1);
    });
});
