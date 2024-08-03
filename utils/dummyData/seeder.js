// file system module (core module inside nodeJS)
const fs = require("fs");
const dotenv = require("dotenv");
const productModel = require("../../models/productModel");
const databaseConnect = require("../../config/database");

dotenv.config({ path: "../../config.env" });

// connect to DB
databaseConnect();

// Read data
const products = JSON.parse(fs.readFileSync("./products.json"));

// Insert data into DB
const insertData = async () => {
  try {
    await productModel.create(products);
    console.log("Data Inserted");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await productModel.deleteMany();
    console.log("Data Destroyed");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// to run the script (node seeder.js) -i or -d
if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
