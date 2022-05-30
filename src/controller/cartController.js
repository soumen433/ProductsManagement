const cartModel = require('../model/cartModel');
const userModel = require('../model/userModel')
const productModel = require('../model/productModel');
const Validator = require("../validation/validation");

const createCart = async function (req, res) {
  //     const userId = req.params.userId;
  //     if (!Validator.isValidObjectId(userId)) {
  //         return res
  //           .status(400)
  //           .send({ status: false, message: " Enter a valid userId" });
  //       }

  //     let user = await userModel.findById(userId);
  //     if(!user){
  //         return res
  //           .status(400)
  //           .send({ status: false, message: "No user Found!" });
  //     }

  //   const data = req.body
  //   if (!Validator.isValidBody(data)) {
  //       return res.status(400).send({
  //         status: false,
  //         message: "Product data is required for cart",
  //       });
  //     }

  //   const { productId, cartId } = data
  //   if (!Validator.isValidObjectId(productId)) {
  //       return res
  //         .status(400)
  //         .send({ status: false, message: " Enter a valid productId" });
  //     }

  //   let productData = await productModel.findById(productId)

  //   if(!productData){
  //       return res.status(400).send({status: false, message: "Product doesn't exist"})
  //   }

  //   let cartData = await cartModel.findOne({userId: userId})
  //   if(cartData){
  //   if(cartId){
  //       if (!Validator.isValidObjectId(cartId)) {
  //           return res
  //             .status(400)
  //             .send({ status: false, message: " Enter a valid cartId" });
  //         }
  //       if(cartId !== cartData._id){
  //           return res.status(400).send({status: false, message: "This cartId is not for this user"})
  //       }
  //       let arr = cartData.items
  //       let product1 = {
  //           'productId': productId,
  //           'quantity': 1
  //       }
  //       compareId = arr.findIndex( obj => obj.productId == productId)
  //       if(!compareId){
  //          arr.push(product1)
  //       }
  //       arr[compareId].quantity = arr[compareId].quantity + 1
  //       arr[compareId].save()
  //   }
  //   let arr = cartData.items
  //       let product1 = {
  //           'productId': productId,
  //           'quantity': 1
  //       }
  //       compareId = arr.findIndex( obj => obj.productId == productId)
  //       if(!compareId){
  //          arr.push(product1)
  //       }
  //       arr[compareId].quantity = arr[compareId].quantity + 1
  //     //  arr[compareId].save()
  //     await cartData.save()
  // }
  // let itemArr = []
  // let cartData1 = {userId: userId, items: itemArr}
  // let product1 = {
  //   'productId': productId,
  //   'quantity': 1
  // }
  // itemArr.push(product1)

  // let productt = await productModel.findById(productId)

  // cartData1.totalPrice =  productt.price

  // cartData1.totalItems =  1    
  // console.log(cartData1)
  // let cartCreate = await cartModel.create(cartData1)
  // return res.status(201).send({status: true, message: "Cart created successfully", data: cartCreate})
try{
  const userId = req.params.userId;
  if (!Validator.isValidObjectId(userId)) {
    return res
      .status(400)
      .send({ status: false, message: " Enter a valid userId" });
  }

  let user = await userModel.findById(userId);
  if (!user) {
    return res
      .status(400)
      .send({ status: false, message: "No user Found!" });
  }

  const data = req.body
  if (!Validator.isValidBody(data)) {
    return res.status(400).send({
      status: false,
      message: "Product data is required for cart",
    });
  }

  const { productId, cartId } = data
  if (!Validator.isValidObjectId(productId)) {
    return res
      .status(400)
      .send({ status: false, message: " Enter a valid productId" });
  }

  let productData = await productModel.findById(productId)

  if (!productData) {
    return res.status(400).send({ status: false, message: "Product doesn't exist" })
  }

  if (cartId) {
    if (!Validator.isValidObjectId(cartId)) {
      return res
        .status(400)
        .send({ status: false, message: " Enter a valid cartId" });
    }

    let cart = await cartModel.findOne({ _id: cartId })
    if (!cart)
      return res.status(400).send({ status: false, message: "cart does not exist with this id" })


    let cartData = await cartModel.findOne({ userId: userId })

    if (cartId !== cartData._id.toString()) {
      return res.status(400).send({ status: false, message: "This cartId is not for this user" })
    }

    let arr = cartData.items
    let product1 = {
      'productId': productId,
      'quantity': 1
    }
    compareId = arr.findIndex(obj => obj.productId == productId)
    console.log(compareId)
    if (compareId == -1) {
      arr.push(product1)
    }
    else {
      arr[compareId].quantity += 1
    }
    await cartData.save()

    return res.status(201).send({ status: true, message: "product added to the cart successfully", data: cartData })
    //add krna h bas


  }
  else {

    let cartData = await cartModel.findOne({ userId: userId })

    if (cartData) {

      let arr = cartData.items
      let product1 = {
        'productId': productId,
        'quantity': 1
      }
      compareId = arr.findIndex(obj => obj.productId == productId)
      console.log(compareId)
      if (compareId == -1) {
        arr.push(product1)
      }
      else {
        arr[compareId].quantity += 1
      }
      await cartData.save()

      return res.status(200).send({ status: true, message: "product added to the cart successfully", data: cartData })
    }
    else {
      let items = []
      let product1 = {
        'productId': productId,
        'quantity': 1
      }
      items.push(product1)
      let product = await productModel.findOne({ _id: productId })
      let cartBody = {
        userId: userId,
        items: items,
        totalPrice: product.price,
        totalItems: 1
      }

      let cartSavedData = await cartModel.create(cartBody)
      console.log(cartSavedData)
      return res.status(201).send({ status: true, message: "Cart created successfully", data: cartSavedData })
    }

    //     //nhi hai  create kro

  }
}
catch(err){
  return res.status(500).send({status : false , error : err.message})
}

}

const delCart = async (req, res) => {
  try {
    let userId = req.params.userId
    let tokenId = req['userId']

    if (!userId){
      return res.status(400).send({status : false,  message: "Please Provide User Id"})
    }

    if (!(Validator.isValidObjectId(userId))){
      return res.status(400).send({status: false, message: "This user is not a valid User Is"})
    }

    let checkUser = await userModel.findOne({userId: userId})

    if (!checkUser){
      return res.status(404).send({ status: false, message: "This User is Not Exist"})
    }

     /*if (!(userId === tokenId)){
      return res.status(401).send({ status: false, message: "Unauthorized User"})
    }*/ 

    let checkCart = await cartModel.findOne({ userId: userId})
   
    if(!checkCart) {
      return res.status(404).send({ status: false, message: "Cart Not Exist With This User"})
    }
    
    let deleteCart = await cartModel.findOneAndUpdate({ userId: userId}, { items:[], totalPrice: 0, totalItems: 0}, { new: true})
    return res.status(200).send({ status: false, message: "Cart Successfully Deleted", data: deleteCart})
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message})
  }
}


const getsCard = async function (req, res) {
  try {
  let user_Id = req.params.userId
  // if (!Validator.isValidObjectId(user_Id)) {
  //   return res
  //     .status(400)
  //     .send({ status: false, message: " Enter a valid userId" });
  // }
  // let uservalid = await userModel.findById(user_Id)

  // if (!uservalid) return res.status(404).send({ status: false, message: "user not found" })

  let cardDetails = await cartModel.findOne({ userId: user_Id }).populate()

  if (!cardDetails) return res.status(404).send({ status: false, message: "cart not found" })

  return res.status(200).send({ data: cardDetails })
  }
  catch(err){
     return res.status(500).send({status:false,message:err.message})
  }
}

module.exports = { createCart,getsCard, delCart }
