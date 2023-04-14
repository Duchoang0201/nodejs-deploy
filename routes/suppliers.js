const express = require("express");
const router = express.Router();
const yup = require("yup");
const { Supplier } = require("../models");
const { findById } = require("../models/Category");
const ObjectId = require("mongodb").ObjectId;
//Get all Data
router.get("/", async (req, res, next) => {
  try {
    let found = await Supplier.find();
    res.json(found);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

//Get a Data
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
      let found = await Supplier.findById(itemId);
      if (found) {
        return res.status(200).json({ oke: true, result: found });
      }
      return res.status(500).json({ oke: true, message: "Object not found" });
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
  const validationSchema = yup.object().shape({
    body: yup.object({
      id: yup.number(),
      name: yup.string().required().max(100),
      email: yup.string().required().max(50),
      phoneNumber: yup.string().max(50),
      address: yup.string().required().max(100),
    }),
  });
  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const newItem = req.body;
        let data = new Supplier(newItem);
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
      let found = await Supplier.findByIdAndDelete(itemId);
      if (found) {
        return res.status(200).json({
          oke: true,
          message: "Deleted Successfully!!",
          result: found,
        });
      }
      return res.status(500).json({ oke: true, message: "Delete Error!!" });
    })
    .catch((err) => {
      return res.status(400).json({
        type: name,
        errors: err.errors,
        message: err.message,
        provider: "yup",
      });
    });
});
router.patch("/:id", async (req, res, next) => {
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
    body: yup.object({
      id: yup.number(),
      name: yup.string().max(100),
      email: yup.string().max(50),
      phoneNumber: yup.string().max(50),
      address: yup.string().max(100),
    }),
  });
  validationSchema
    .validate({ params: req.params }, { body: req.body }, { abortEarly: false })
    .then(async () => {
      const itemId = req.params.id;
      const itemBody = req.body;
      await Supplier.findByIdAndUpdate(itemId, itemBody);
      let found = await Supplier.findById(itemId);
      if (found) {
        return res.status(200).json({
          oke: true,
          message: "Updated Successfully!!",
          update: found,
        });
      }
      return res.status(500).json({ oke: true, message: "Updated Erorr!!" });
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
module.exports = router;
