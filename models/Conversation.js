const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ConversationSchema = Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

const Conversation = model("Conversation", ConversationSchema);
module.exports = Conversation;
