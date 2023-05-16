const passport = require("passport");
const express = require("express");
const router = express.Router();

const { Employee } = require("../models");
const yup = require("yup");

const {
  validateSchema,
  loginSchema,
  getEmployeeChema,
} = require("../validation/employee");
const encodeToken = require("../helpers/jwtHelper");

const ObjectId = require("mongodb").ObjectId;
// let data = [
//   { id: 1, name: 'Mary', email: 'mary@gmail.com', gender: 'female' },
//   { id: 2, name: 'Honda', email: 'honda@gmail.com', gender: 'male' },
//   { id: 3, name: 'Suzuki', email: 'suzuki@gmail.com', gender: 'male' },
// ];
// Methods: POST / PATCH / GET / DELETE / PUT

// GET ALL DATA
// router.get("/", async (req, res, next) => {
//   try {
//     let data = await Employee.find();
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

// Get all on Multiple conditions
router.get(
  "/",

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

      let results = await Employee.find(query)
        .sort({ Locked: 1 })
        .skip(skip)
        .limit(limit);

      let amountResults = await Employee.countDocuments(query);
      res.json({ results: results, amountResults: amountResults });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }
);

// GET A DATA
router.get("/:id", async (req, res, next) => {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test(
          "validate ObjectId",
          "${path} is not a valid ObjectId",
          (value) => {
            return ObjectId.isValid(value);
          }
        ),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      const itemId = req.params.id;
      let found = await Employee.findById(itemId);
      if (found) {
        return res.status(200).json({ oke: true, result: found });
      }
      return res.status(410).json({ oke: false, message: "Object not found" });
    })
    .catch((err) => {
      return res.status(400).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "Yup",
      });
    });
});
// POST DATA
router.post("/", async (req, res, next) => {
  const validationSchema = yup.object({
    body: yup.object({
      firstName: yup.string().required().max(50),
      lastName: yup.string().required().max(50),
      phoneNumber: yup
        .string()
        .matches(
          /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
          "Phone number is not valid"
        ),
      address: yup.string().required().max(500),
      birthday: yup.date().nullable().min(new Date(1900, 0, 1)),
      email: yup.string().email().required().max(50),
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const newItem = req.body;
        let data = new Employee(newItem);
        let found = await data.save();
        return res.status(200).json({ oke: true, newItem: found });
      } catch (error) {
        res.status(500).json({ error: error });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "yup",
      });
    });
});

router.delete("/:id", async (req, res, next) => {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test(
          "validate ObjectId",
          "${path} is not a valid ObjectId",
          (value) => {
            return ObjectId.isValid(value);
          }
        ),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      const itemId = req.params.id;
      let found = await Employee.findByIdAndDelete(itemId);
      if (found) {
        return res.status(200).json({ oke: true, result: found });
      }
      return res.status(410).json({ oke: false, message: "Object not found" });
    })
    .catch((err) => {
      return res.status(400).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "Yup",
      });
    });
});

// PATCH DATA

router.patch("/:id", async (req, res, next) => {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test(
          "validate ObjectId",
          "${path} is not a valid ObjectId",
          (value) => {
            return ObjectId.isValid(value);
          }
        ),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      const itemId = req.params.id;
      const itemBody = req.body;
      let found = await Employee.findByIdAndUpdate(itemId, { $set: itemBody });
      if (found) {
        return res.status(200).json({ oke: true, result: found });
      }
      return res.status(410).json({ oke: false, message: "Object not found" });
    })
    .catch((err) => {
      return res.status(400).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "Yup",
      });
    });
});

router.post(
  "/login",
  validateSchema(loginSchema),
  passport.authenticate("local", { session: false }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const employee = await Employee.findOne({ email });

      console.log(employee);
      if (!employee) return res.status(404).send({ message: "Not found" });

      const { _id, email: empEmail, firstName, lastName } = employee;

      const token = encodeToken(_id, empEmail, firstName, lastName);

      console.log(token);
      res.status(200).json({
        token,
        payload: employee,
      });
    } catch (err) {
      res.status(401).json({
        statusCode: 401,
        message: "Login Unsuccessful",
      });
    }
  }
);

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const employee = await Employee.findById(req.user._id);

      if (!employee) return res.status(404).send({ message: "Not found" });

      res.status(200).json(employee);
    } catch (err) {
      res.sendStatus(500);
    }
  }
);

module.exports = router;
