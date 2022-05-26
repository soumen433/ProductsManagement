const productModel = require("../model/productModel");
const { uploadFile } = require("../aws/aws");

const createProduct = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;

    if (files && files.length > 0) {
      let fileUrl = await uploadFile(files[0]);
      data.productImage = fileUrl;
    } else {
      return res.status(400).send({ msg: "No file found" });
    }

    let savedData = await productModel.create(data);
    console.log(savedData);

    return res
      .status(201)
      .send({
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
    const { name, description, isFreeShipping, priceGreaterThan, priceLessThan, style, size, installments } = filter
    let query = { isDeleted: false }
    if (filter) {
     
      if (name) {
        query.title = name.trim()
      }
      if (description) {
        query.description = description.trim()
      }
      if (isFreeShipping) {
        query.isFreeShipping = isFreeShipping
      }
      if (style) {
        query.style = style.trim()
      }
      if (installments) {
        query.installments = installments
      }
      if (size) {
        const sizeArr = size
          .trim()
          .split(",")
          .map((x) => x.trim());
        query.availableSizes = { $all: sizeArr };
      }
    }

    let data = await productModel.find({
      $and: [
        query,
        { $or: [{ price: { $gt: priceGreaterThan } }, { price: { $lt: priceLessThan } }] }

      ]
    }
    ).sort({ price: filter.priceSort })

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

    const productById = await productModel.findOne({ _id: productId, isDeleted: false }).collation({ locale: "en", strength: 2 });

    if (!productById) { return res.status(404).send({ status: false, message: "No product found by this Product id", }); }

    res.status(200).send({ status: true, message: "success", data: productById });
  }

  catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
}

const updateProduct = async function (req, res) {
  try {
    let productId = req.params.productId
    let data = req.body;

    let files = req.files
    if (files && files.length > 0) {
      let fileUrl = await uploadFile(files[0]);
      data.productImage = fileUrl;
    }



    let updatedData = await productModel.findOneAndUpdate({ _id: productId }, data, {
      new: true,
    });
    return res
      .status(200)
      .send({
        status: true,
        message: "product details updated",
        data: updatedData,
      });
  }
  catch (err) {
    return res.status(500).send({ status: false, error: err.message })
  }
}

const deleteProduct = async function (req, res) {
  let productId = req.params.productId
   await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() })
  return res.status(200).send({ status: true, message: "product deleted successfully", })
}

module.exports = { createProduct, updateProduct, getProduct, getProductsById, deleteProduct }
//module.exports = { createProduct, getProducts };
