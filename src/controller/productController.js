const productModel = require("../model/productModel");
const { uploadFile } = require("../aws/aws");
const Validator = require("../validation/validation")

const createProduct = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;
    let { title, description, price, currencyId, currencyFormat, availableSizes } = data

    if (!Validator.isValidBody(data)) {
      return res.status(400).send({
        status: false,
        message: "product data is required for registration",
      })
    }

    if (files && files.length > 0) {
      let fileUrl = await uploadFile(files[0]);
      data.productImage = fileUrl;
    } else {
      return res.status(400).send({ msg: "No file found" });
    }

    if (!Validator.isValidInputValue(title)) {
      return res.status(400).send({
        status: false,
        message: "title  required for registration",
      })
    }
    let uniqueTitle = await productModel.findOne({ title: title })
    if (uniqueTitle) {
      return res.status(400).send({
        status: false,
        message: "title already present",
      })
    }

    if (!Validator.isValidInputValue(description)) {
      return res.status(400).send({
        status: false,
        message: "description  required for registration",
      })
    }

    if (!Validator.isValidInputValue(price)) {
      return res.status(400).send({
        status: false,
        message: "price  required for registration",
      })
    }

    if (!Validator.isValidInputValue(currencyId) || (currencyId != "INR")) {
      return res.status(400).send({
        status: false,
        message: "currencyId required for product registration  it should be INR",
      })
    }

    if (!Validator.isValidInputValue(currencyFormat) || (currencyFormat != "₹")) {
      return res.status(400).send({
        status: false,
        message: "currencyFormat required for registration  it should be ₹ ",
      })
    }

    if (!Validator.isValidInputValue(availableSizes)) {
      console.log(typeof availableSizes)
      return res.status(400).send({
        status: false,
        message: "availableSizes required for registration at least one size ",
      })
    }
    let enumSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    for (let i = 0; i < availableSizes.length; i++) {
      if (!enumSize.includes(availableSizes[i])) {
        return res.status(400).send({
          status: false,
          message: "availableSizes should be-[S, XS,M,X, L,XXL, XL]"
        })
      }
    }
    let savedData = await productModel.create(data);

    return res.status(201).send({
      status: true,
      message: "product created successfully",
      data: savedData,
    });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

const getProduct = async function (req, res) {
  try {
    let filter = req.query;
    let query = { isDeleted: false };
    if (filter) {
      const {
        name,
        description,
        isFreeShipping,
        priceGreaterThan,
        priceLessThan,
        style,
        size,
        installments,
      } = filter;
      if (name) {
        query.title = query.title.includes(name.trim());
      }
      if (description) {
        query.description = description.trim();
      }
      if (isFreeShipping) {
        query.isFreeShipping = isFreeShipping;
      }
      if (style) {
        query.style = style.trim();
      }
      if (installments) {
        query.installments = installments;
      }
      if (size) {
        const sizeArr = size
          .trim()
          .split(",")
          .map((x) => x.trim());
        query.availableSizes = { $all: sizeArr };
      }
    }
    console.log(query);
    // console.log(productModel);
    let data = await productModel.find({
      $or: [
        query,
        { $or: [{ price: { $gt: filter.priceGreaterThan } }, { price: { $lt: filter.priceLessThan } }] }

      ]
    }).sort({ price: filter.priceSort });
    if(data.length===0){  return res
    .status(400)
    .send({ status: false, message: " enter a valid productId" });
    }
    console.log(data);

    return res
      .status(200)
      .send({ status: true, message: "Success", data: data });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

const getProductsById = async function (req, res) {
  try {
    const productId = req.params.productId;

    if (!Validator.isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: " enter a valid productId" });
    }

    const productById = await productModel
      .findOne({ _id: productId, isDeleted: false })
      .collation({ locale: "en", strength: 2 });

    if (!productById) {
      return res
        .status(404)
        .send({
          status: false,
          message: "No product found by this Product id",
        });
    }

    res
      .status(200)
      .send({ status: true, message: "success", data: productById });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

const updateProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    let data = req.body;

    if (!Validator.isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: " enter a valid productId" });
    }


    let files = req.files;
    if (files && files.length > 0) {
      let fileUrl = await uploadFile(files[0]);
      data.productImage = fileUrl;
    }

    let updatedData = await productModel.findOneAndUpdate(
      { _id: productId,isDeleted:false },
      data,
      {
        new: true,
      }
    );
    if (!updatedData) {
      return res
        .status(404)
        .send({
          status: false,
          message: "No product found by this Product id",
        });
    }
    return res.status(200).send({
      status: true,
      message: "product details updated",
      data: updatedData,
    });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

const deleteProduct = async function (req, res) {
  try{
  let productId = req.params.productId;
  if (!Validator.isValidObjectId(productId)) {
    return res
      .status(400)
      .send({ status: false, message: " enter a valid productId" });
  }

 let productDelete= await productModel.findOneAndUpdate(
    { _id: productId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() }
  );
  if (!productDelete) {
    return res
      .status(404)
      .send({
        status: false,
        message: "No product found by this Product id",
      });
  }

  return res
    .status(200)
    .send({ status: true, message: "product deleted successfully" });
  }catch(err){
    return res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getProduct,
  getProductsById,
  deleteProduct,
};
//module.exports = { createProduct, getProducts };
