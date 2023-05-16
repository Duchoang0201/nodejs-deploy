const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const bcrypt = require("bcryptjs");

const customerSchema = Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      validate: {
        validator: function (value) {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        },
        message: `{VALUE} is not a valid email`,
      },
      required: [true, "email is required"],
    },
    password: { type: String, required: true },

    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          const phoneRegex =
            /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
          return phoneRegex.test(value);
        },
        message: `{VALUE} is not a valid phone number`,
      },
    },
    address: { type: String, require: true },
    birthday: { type: Date },
    Locked: { type: Boolean },
    createdDate: {
      type: Date,
    },
    createdBy: { type: Object },
    imageUrl: { type: String },
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

// customerSchema.pre("save", async function (next) {
//   try {
//     // generate salt key
//     const salt = await bcrypt.genSalt(10); // 10 ký tự
//     // generate password = salt key + hash key
//     const hashPass = await bcrypt.hash(this.password, salt);
//     // override password
//     this.password = hashPass;
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

customerSchema.methods.isValidPass = async function (pass) {
  try {
    return await bcrypt.compare(pass, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

const Customer = model("Customer", customerSchema);
module.exports = Customer;
