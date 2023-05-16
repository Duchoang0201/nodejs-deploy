const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CategorySchema = Schema(
  {
    name: { type: String, required: true },
    description: String,
    promotionPosition: { type: Array },
    coverImageUrl: { type: String },
    sortOrder: { type: Number },
    active: { type: Boolean },
    isDeleted: { type: Boolean },
    createdDate: {
      type: Date,
    },
    createdBy: { type: Object },
    updatedDate: {
      type: Date,
    },
    updatedBy: { type: Object },
    note: { type: String },
  },
  {
    versionKey: false,
  }
);

const Category = model("Category", CategorySchema);

module.exports = Category;
