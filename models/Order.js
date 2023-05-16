const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Mongoose Datatypes:
// https://mongoosejs.com/docs/schematypes.html

// Validator
// https://mongoosejs.com/docs/validation.html#built-in-validators

const contactInformationSchema = new Schema({
  address: { type: String, required: true },
  // city: { type: String, required: true },
  // district: { type: String, required: true },
  // ward: { type: String, required: true },
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
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
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
});

const shippingInformationSchema = new Schema({
  city: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  addressDetail: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
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
  status: {
    type: String,
    required: true,
    default: "WAITING",
    validate: {
      validator: (value) => {
        if (["WAITING", "COMPLETED", "CANCELED"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Status: {VALUE} is invalid!`,
    },
  },
});

const orderDetailSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, require: true, min: 0 },
});

// Virtual with Populate
orderDetailSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

// Virtuals in console.log()
orderDetailSchema.set("toObject", { virtuals: true });
// Virtuals in JSON
orderDetailSchema.set("toJSON", { virtuals: true });

// ------------------------------------------------------------------------------------------------

const orderSchema = new Schema({
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },

  shippedDate: {
    type: Date,
    validate: {
      validator: function (value) {
        if (!value) return true;

        if (value < this.createdDate) {
          return false;
        }
        return true;
      },
      message: `Shipped date: {VALUE} is invalid!`,
    },
  },
  description: { type: String, require: false },
  shippingAddress: { type: String, require: true },
  paymentType: {
    type: String,
    required: true,
    default: "CASH",
    validate: {
      validator: (value) => {
        if (
          ["CASH", "CREDIT CARD", "MOMO", "VNPAY"].includes(value.toUpperCase())
        ) {
          return true;
        }
        return false;
      },
      message: `Payment type: {VALUE} is invalid!`,
    },
  },

  status: {
    type: String,
    required: true,
    default: "WAITING",
    validate: {
      validator: (value) => {
        if (["WAITING", "COMPLETED", "CANCELED"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Status: {VALUE} is invalid!`,
    },
  },

  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: false },
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: false },
  contactInformation: contactInformationSchema,
  orderDetails: [orderDetailSchema],
});

// Virtual with Populate
orderSchema.virtual("customer", {
  ref: "Customer",
  localField: "customerId",
  foreignField: "_id",
  justOne: true,
});

orderSchema.virtual("employee", {
  ref: "Employee",
  localField: "employeeId",
  foreignField: "_id",
  justOne: true,
});

// Virtuals in console.log()
orderSchema.set("toObject", { virtuals: true });
// Virtuals in JSON
orderSchema.set("toJSON", { virtuals: true });

const Order = model("Order", orderSchema);
module.exports = Order;
