const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);
MessageSchema.virtual("employee", {
  ref: "Employee",
  localField: "sender",
  foreignField: "_id",
  justOne: true,
});
// Config
MessageSchema.set("toJSON", { virtuals: true });
MessageSchema.plugin(mongooseLeanVirtuals);
const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
