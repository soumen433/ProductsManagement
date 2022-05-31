const cartModel = require('../model/cartModel');
const userModel = require('../model/userModel')
const productModel = require('../model/productModel');
const Validator = require("../validation/validation");

//------------------------------------------------create cart----------------------------------------------------------------
const createCart = async function (req, res) {

  try {
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
     
      if (compareId == -1) {
        arr.push(product1)
      }
      else {
        arr[compareId].quantity += 1
        cartData.totalItems += 1
        cartData.totalPrice = 0
        for (let i = 0; i < arr.length; i++) {
          let product = await productModel.findOne({ _id: arr[i].productId })
          cartData.totalPrice += arr[i].quantity * (product.price)
        }
      }
      await cartData.save()

      return res.status(201).send({ status: true, message: "product added to the cart successfully", data: cartData })

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
          cartData.totalItems += 1
          cartData.totalPrice = 0
          for (let i = 0; i < arr.length; i++) {
            let product = await productModel.findOne({ _id: arr[i].productId })
            cartData.totalPrice += arr[i].quantity * (product.price)
          }
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
  catch (err) {
    return res.status(500).send({ status: false, error: err.message })
  }

}

//------------------------------------------------------------update cart----------------------------------------------------------

const updateCart = async function (req, res) {
  try {
    let userId = req.params.userId
    let { cartId, productId, removeProduct } = req.body


    if (!Validator.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: " Enter a valid userId" });
    }

    let user = await userModel.findOne({ _id: userId, isDeleted: false })
    if (!user)
      return res.status(400).send({ status: false, msg: "User does not exist" })

    if (!productId)
      return res.status(400).send({ status: false, message: " Please provide productId" });

    if (!Validator.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: " Enter a valid productId" });
    }

    if (!Validator.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: " Enter a valid cartId" });
    }

    let product = await productModel.findOne({ _id: productId, isDeletd: false })
    if (!product)
      return res.status(400).send({ status: false, msg: "Product does not exist" })


    let cart = await cartModel.findOne({ userId: userId })
    if (!cart)
      return res.status(400).send({ status: false, msg: "cart does not exist" })

    if (userId !== cart.userId.toString())
      return res.status(400).send({ status: false, msg: "cart does not belong to the user" })


    let arr = cart.items
    compareId = arr.findIndex(obj => obj.productId == productId)
    if (removeProduct == 0) {

      arr.splice(compareId, 1)
      cart.totalItems -= 1
      cart.totalPrice -= product.price
      await cart.save()

      return res.status(200).send({ status: true, data: cart })
    }
    else if (removeProduct == 1) {
 
      if (arr[compareId].quantity <= 0){
        arr.splice(compareId, 1)
        await cart.save()
        return res.status(200).send({ status: true, data: cart })
      }
        
      arr[compareId].quantity -= 1
      cart.totalItems -= 1
      cart.totalPrice -= product.price
      await cart.save()

      return res.status(200).send({ status: true, data: cart })
    }

  }
  catch (err) {
    return res.status(500).send({ status: false, error: err.message })
  }
}

//--------------------------------------------------------get cart-------------------------------------------------------------------


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
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

module.exports = { createCart, getsCard, updateCart }
