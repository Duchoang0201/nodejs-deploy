const express = require("express");
const router = express.Router();
const yup = require("yup");
const { Product } = require("../models");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const ObjectId = require("mongodb").ObjectId;
// let data = [
//     {id: 1, name: 'iphone 14 ProMax', price: 1500},
//     {id: 2, name: 'iphone 13 ProMax', price: 1200},
//     {id: 3, name: 'iphone 12 ProMax', price: 1000},
//     {id: 4, name: 'iphone 11 ProMax', price: 800},
//     {id: 5, name: 'iphone X', price: 500},
// ];

// Methods: POST / PATCH / GET / DELETE / PUT
/* GET home page. */

// Get all
router.get("/", async (req, res, next) => {
  try {
    let results = await Product.find()
      .populate("category")
      .populate("supplier")
      .lean({ virtuals: true });

    res.json(results);
  } catch (error) {
    res.status(500).json({ ok: false, error });
  }
});

//Get a data
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
      const itemId = req.params.id;
      let found = await Product.findById(itemId);
      if (found) {
        return res.status(200).json({ oke: true, result: found });
      }
      return res.status(500).send({ oke: false, message: "Object not found" });
    })
    .catch((err) => {
      return res.status(500).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "Yup",
      });
    });
});
router.post("/", async (req, res, next) => {
  const validationSchema = yup.object({
    body: yup.object({
      name: yup.string().required().max(50),
      price: yup.number().required().positive(),
      discount: yup.number().required().positive().min(0).max(75),
      stock: yup.number().required().positive().integer(),
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const newItem = req.body;
        let data = new Product(newItem);
        let result = data.save();
        return res.status(200).json({
          oke: true,
          message: "Created successfully!",
          result: result,
        });
      } catch (error) {
        res.status(500).json({ error: error });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provier: "Yup",
      });
    });
});

// Delete data
router.delete("/:id", async (req, res, next) => {
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
      let found = await Product.findByIdAndDelete(itemId);
      if (found) {
        return res.status(200).json({ oke: true, result: found });
      }
      return res.status(500).send({ oke: false, message: "Object not found" });
    })
    .catch((err) => {
      return res.status(500).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "Yup",
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
          let update = await Product.findByIdAndUpdate(itemId, itemBody);
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

module.exports = router;
