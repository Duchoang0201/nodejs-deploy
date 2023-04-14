const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CategorySchema = Schema(
  {
    name: { type: String, required: true },
    description: String,
  },
  {
    versionKey: false,
  }
);

const Category = model("Category", CategorySchema);

module.exports = Category;
