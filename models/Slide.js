const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const SlideSchema = Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    url: { type: String, required: true },
    imageUrl: { type: String, required: true },
    sortOder: { type: Number, required: true },
    active: { type: Boolean, required: true },
  },
  {
    versionKey: false,
  }
);

const Slide = model("Slide", SlideSchema);

module.exports = Slide;
