const productModel = require("../model/productModel")
const {uploadFile} = require("../aws/aws")

const createProduct = async function(req,res){
    try{
        let data = req.body;
        let files = req.files;
      // data = JSON.parse(JSON.stringify(data))
        console.log(data)
      //  data.availableSizes = JSON.parse(JSON.stringify(data.availableSizes))

        if (files && files.length > 0) {
            let fileUrl = await uploadFile(files[0]);
            data.productImage = fileUrl;
          } else {
            return res.status(400).send({ msg: "No file found" });
          }
        

        let savedData = await productModel.create(data)
        return res.status(201).send({status : true, message: "product created successfully" , data : savedData})

    }
    catch(err){
        return res.status(500).send({status : false , error : err.message})
    }
}

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



module.exports = {createProduct , getProducts}
