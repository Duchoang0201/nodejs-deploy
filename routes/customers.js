const express = require("express");
const router = express.Router();
const yup = require("yup");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcryptjs");

const { Customer } = require("../models");

// let data = [
//     {id: 1, name: 'Peter', email: 'peter@gmail.com', address: 'USA'},
//     {id: 2, name: 'John', email: 'john@gmail.com', address: 'ENGLAND'},
//     {id: 3, name: 'Yamaha', email: "yamaha@gmail.com", address: 'JAPAN'},

// ]
// Methods: POST / PATCH / GET / DELETE / PUT
/* GET home page. */

// GET ALL DATA
router.get("/", async (req, res, next) => {
  try {
    const data = await Customer.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

//GET A DATA
router.get("/:id", async (req, res, next) => {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test(
          "Validate ObjectId",
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
      const id = req.params.id;
      const found = await Customer.findById(id);

      if (found) {
        return res.status(200).send({ oke: true, result: found });
      }
      return res.status(500).send({ oke: false, message: "Object not found" });
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
// CREATE DATA
router.post("/", function (req, res, next) {
  const validationSchema = yup.object({
    body: yup.object({
      firstName: yup.string().required().max(50),
      lastName: yup.string().required().max(50),
      email: yup.string().email().required().max(50),
      phoneNumber: yup
        .string()
        .matches(
          /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
          "Phone number is not valid"
        ),
      address: yup.string().required().max(500),
      birthday: yup.date().nullable().min(new Date(1900, 0, 1)),
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const newItem = req.body;
        const data = new Customer(newItem);
        let result = await data.save();
        return res.status(200).send({ oke: true, message: "Created", result });
      } catch (error) {
        return res.status(500).json({ error: error });
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

// DELETE DATA
router.delete("/:id", function (req, res, next) {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test(
          "Validate ObjectId",
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
      let found = await Customer.findByIdAndDelete(itemId);

      if (found) {
        return res
          .status(200)
          .send({ message: "Deleted Succesfully!!", found });
      }
      return res.status(410).send({ oke: false, message: "Object not found" });
    })
    .catch((err) => {
      return res.status(400).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "yup",
      });
    });
});

//PATCH DATA

router.patch("/:id", function (req, res, next) {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test(
          "Validate ObjectId",
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
      try {
        const itemId = req.params.id;
        const itemBody = req.body;

        if (itemId) {
          let update = await Customer.findByIdAndUpdate(itemId, {
            $set: itemBody,
          });
          res.status(200).send("Updated successfully");
        }
      } catch (error) {
        res.status(500).send(error);
      }
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

//Get data with show specific Disstrict
// router.get("/login", val);
module.exports = router;
