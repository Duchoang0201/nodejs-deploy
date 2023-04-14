const express = require("express");
const router = express.Router();
const { Order } = require("../models");
const yup = require("yup");
const ObjectId = require("mongodb").ObjectId;

//Get All Data
router.get("/", async (req, res, next) => {
  try {
    let found = await Order.find()
      .populate("employee")
      .populate("customer")
      .lean({ virtuals: true });

    res.status(200).json({ oke: true, result: found });
    console.log(req.query);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});
router.post("/", async (req, res, next) => {
  const validationSchema = yup.object().shape({
    body: yup.object({
      orderDetails: yup.array(),
      customerId: yup
        .string()
        .test(
          "Validate ObjectId",
          "{path} is not a valid objectId",
          (value) => {
            return ObjectId.isValid(value);
          }
        ),
      employeeId: yup
        .string()
        .test(
          "Validate ObjectId",
          "{path} is not a valid objectId",
          (value) => {
            return ObjectId.isValid(value);
          }
        ),
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      const newItem = req.body;
      let data = new Order(newItem);
      let found = await data.save();
      res.status(200).json({ oke: true, newItem: found });
    })
    .catch((err) => {
      return res.json({ oke: true, error: err });
    });
});

/// Truy vấn dữ liệu theo ngày:
router.get("/questions", function (req, res, next) {
  try {
    let { status, fromDate, toDate } = req.query;

    fromDate = new Date(fromDate);

    const tmpToDate = new Date(toDate);

    toDate = new Date(tmpToDate.setDate(tmpToDate.getDate() + 1));

    console.log("status", status);
    console.log("fromDate", fromDate);
    console.log("toDate", toDate);

    const compareStatus = { $eq: ["$status", status] };
    const compareFromDate = { $gte: ["$createdDate", fromDate] };
    const compareToDate = { $lt: ["$createdDate", toDate] };

    Order.aggregate([
      {
        $match: {
          $expr: { $and: [compareStatus, compareFromDate] },
        },
      },
    ])
      .project({
        _id: 1,
        status: 1,
        paymentType: 1,
        createdDate: 1,
        orderDetails: 1,
        employeeId: 1,
        customerId: 1,
      })
      .then((result) => {
        // res.send(result);
        // POPULATE
        Order.populate(result, [
          { path: "employee" },
          { path: "customer" },
          {
            path: "orderDetails.product",
            select: { name: 1, price: 1, discount: 1 },
          },
        ])
          .then((data) => {
            res.send(data);
          })
          .catch((err) => {
            res.status(400).send({ message: err.message });
          });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});
module.exports = router;
