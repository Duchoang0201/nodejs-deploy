const passport = require("passport");
const express = require("express");
const router = express.Router();

const { Customer } = require("../models");
const yup = require("yup");

const {
  validateSchema,
  loginSchema,
  customerBodySchema,
  customerIdSchema,
  customerBodyPatchSchema,
  getCustomersSchema,
} = require("../validation/customer");

const ObjectId = require("mongodb").ObjectId;

const encodeToken = require("../helpers/jwtHelper");

// let data = [
//     {id: 1, name: 'Peter', email: 'peter@gmail.com', address: 'USA'},
//     {id: 2, name: 'John', email: 'john@gmail.com', address: 'ENGLAND'},
//     {id: 3, name: 'Yamaha', email: "yamaha@gmail.com", address: 'JAPAN'},

// ]
// Methods: POST / PATCH / GET / DELETE / PUT
/* GET home page. */

// GET ALL DATA
// router.get("/", async (req, res, next) => {
//   try {
//     const data = await Customer.find();
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

//Get a Data
// Get all on Multiple conditions
router.get(
  "/",

  validateSchema(getCustomersSchema),

  async (req, res, next) => {
    try {
      const {
        Locked,
        email,
        firstName,
        lastName,
        phoneNumber,
        birthdayFrom,
        birthdayTo,
        address,
        skip,
        limit,
      } = req.query;

      let fromDate = null;
      if (birthdayFrom) {
        fromDate = new Date(birthdayFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (isNaN(fromDate.getTime())) {
          throw new Error("Invalid date format for birthdayFrom");
        }
      }

      let toDate = null;
      if (birthdayTo) {
        const tempToDate = new Date(birthdayTo);
        toDate = new Date(tempToDate.setDate(tempToDate.getDate() + 1));
        toDate.setHours(0, 0, 0, 0);
        if (isNaN(toDate.getTime())) {
          throw new Error("Invalid date format for birthdayTo");
        }
      }

      const query = {
        $expr: {
          $and: [
            Locked && { $eq: ["$Locked", Locked] },
            email && {
              $regexMatch: { input: "$email", regex: email, options: "i" },
            },
            firstName && {
              $regexMatch: {
                input: "$firstName",
                regex: firstName,
                options: "i",
              },
            },
            lastName && {
              $regexMatch: {
                input: "$lastName",
                regex: lastName,
                options: "i",
              },
            },
            fromDate && { $gte: ["$birthday", fromDate] },
            toDate && { $lte: ["$birthday", toDate] },
            address && {
              $regexMatch: {
                input: "$address",
                regex: address,
                options: "i",
              },
            },
            phoneNumber && {
              $regexMatch: {
                input: "$phoneNumber",
                regex: phoneNumber,
                options: "i",
              },
            },
          ].filter(Boolean),
        },
      };

      let results = await Customer.find(query)
        .sort({ Locked: 1 })
        .skip(skip)
        .limit(limit);

      let amountResults = await Customer.countDocuments(query);
      res.json({ results: results, amountResults: amountResults });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }
);

// CREATE DATA
router.post("/", validateSchema(customerBodySchema), async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.body;

    const customerExists = await Customer.findOne({ email, phoneNumber });

    if (customerExists) {
      return res
        .status(400)
        .send({ oke: false, message: "Email or Phone Number already exists" });
    } else {
      const newItem = req.body;
      const data = new Customer(newItem);
      let result = await data.save();
      return res
        .status(200)
        .send({ oke: true, message: "Created succesfully", result: result });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE DATA
router.delete(
  "/:id",
  validateSchema(customerIdSchema),
  async (req, res, next) => {
    const itemId = req.params.id;
    let found = await Customer.findByIdAndDelete(itemId);

    if (found) {
      return res.status(200).send({ message: "Deleted Succesfully!!", found });
    }
    return res.status(410).send({ oke: false, message: "Object not found" });
  }
);

//PATCH DATA

router.patch(
  "/:id",
  validateSchema(customerIdSchema),
  validateSchema(customerBodyPatchSchema),
  async (req, res, next) => {
    try {
      const itemId = req.params.id;
      const itemBody = req.body;

      if (itemId) {
        await Customer.findByIdAndUpdate(itemId, {
          $set: itemBody,
        });
        let itemUpdated = await Customer.findById(itemId);
        res
          .status(200)
          .send({ message: "Updated successfully", result: itemUpdated });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

/// LOGIN
router.post(
  "/login",

  // validateSchema(loginSchema),

  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const customer = await Customer.findOne({ email, password });

      console.log(customer);
      if (!customer) return res.status(404).send({ message: "Not found" });

      const { _id, email: empEmail, firstName, lastName } = customer;

      const token = encodeToken(_id, empEmail, firstName, lastName);

      console.log(token);
      res.status(200).json({
        token,
        payload: customer,
      });
    } catch (err) {
      res.status(401).json({
        statusCode: 401,
        message: "Login Unsuccessful",
      });
    }
  }
);

module.exports = router;
