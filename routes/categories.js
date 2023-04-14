const express = require("express");
const router = express.Router();
const { Category } = require("../models");
const yup = require("yup");
const {
  validateSchema,
  categoryIdSchema,
  categoryBodySchema,
} = require("../validation/category");

//Get ALL DATA
router.get("/", async (req, res, next) => {
  try {
    let results = await Category.find();
    res.json(results);
  } catch (error) {
    res.status(500);
  }
});

//Get a DATA
router.get(
  "/:id",
  validateSchema(categoryIdSchema),
  async function (req, res, next) {
    const id = req.params.id;

    let found = await Category.findById(id);

    if (found) {
      return res.send({ ok: true, result: found });
    }

    return res.send({ ok: false, message: "Object not found" });
  }
);

//CREATE DATA
router.post(
  "/",
  validateSchema(categoryBodySchema),
  async function (req, res, next) {
    try {
      const newItem = req.body;
      const data = new Category(newItem);
      let result = await data.save();
      return res.send({ oke: true, message: "Created", result });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }
);

//DELETE DATA

router.delete(
  "/:id",
  validateSchema(categoryIdSchema),
  async function (req, res, next) {
    try {
      const itemId = req.params.id;

      let found = await Category.findByIdAndDelete(itemId);

      if (found) {
        return res.send({ message: "Deleted successfully!!", result: found });
      }
      return res.status(410).send({ oke: false, message: "Object not found" });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }
);

//PATCH DATA
router.patch(
  "/:id",
  validateSchema(categoryIdSchema),
  async function (req, res, next) {
    try {
      const itemId = req.params.id;
      const itemBody = req.body;

      if (itemId) {
        let update = await Category.findByIdAndUpdate(itemId, itemBody);
        res.status(200).send("Updated successfully");
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
module.exports = router;
