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
    let query = {isDeleted: false}
    if(filter){
      const {name, description, isFreeShipping, priceGreaterThan, priceLessThan, style, size, installments} = filter
      if(name){
        query.title= name.trim()
      }
      if(description){
        query.description= description.trim()
      }
      if(isFreeShipping){
        query.isFreeShipping= isFreeShipping
      }
      if(style){
        query.style= style.trim()
      }
      if(installments){
        query.installments= installments
      }
      if(size){
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
        { $or: [{price: {$gt: filter.priceGreaterThan}}, {price: {$lt: filter.priceLessThan}}]} 
        
      ]}
    ).sort({price: filter.priceSort})
   
    return res
      .status(200)
      .send({ status: true, message: "Success", data: data });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

// const getProductsById = async function (req, res) {};

//     }
//     catch(err){
//         return res.status(500).send({status : false , error : err.message})
//     }
// }

const getProducts = async function(req,res){
    try{

        let filter = req.query
        if(filter.priceGreaterThan||filter.priceLessThan){
            filter.price = filter.price
        }
        let data = await productModel.find({ $and : [filter , {isDeleted : false}] })
        return res.status(200).send({status : true, message: "list of products" , data :data})

    }
    catch(err){
        return res.status(500).send({status : false , error : err.message})  
    }
}

const getProductsById = async function(req,res){

}

const updateProduct= async function(req,res){
  try{
    let productId=req.params.productId
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
    catch(err){
      return res.status(500).send({status : false , error : err.message}) 
    }
}

module.exports = {createProduct , getProducts,updateProduct,getProduct}
//module.exports = { createProduct, getProducts };
