const express = require('express');
const router = express.Router();
const { createUser, loginUser, getUser, updatedUser} = require("../controller/userController")
const {createProduct , getProduct, updateProduct, getProductsById, deleteProduct} = require("../controller/productController")
const { createCart,getsCard , updateCart, delCart} = require('../controller/cartController')
const {authentication , authorization} = require("../middleware/middleware")

//..........................USER.........................................
router.post("/register", createUser)
router.post("/login" , loginUser)
router.route("/user/:userId/profile")
.get(authentication,authorization, getUser)
.put(authentication,authorization, updatedUser)

//...........................PRODUCT.......................................
router.route("/products")
.post(createProduct)
.get(getProduct)
router.route("/products/:productId")
.get(getProductsById)
.put(updateProduct)
.delete(deleteProduct)

//..............................CART.......................................
router.route("/users/:userId/cart")
.post(createCart)
.put(updateCart)
.get(getsCard)
.delete (delCart)

module.exports = router;
