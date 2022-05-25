const express = require('express');
const router = express.Router();
const { createUser, loginUser, getUser, updatedUser} = require("../controller/userController")
const {createProduct , getProducts} = require("../controller/productController")
const {authentication , authorization} = require("../middleware/middleware")
const { createUserValid, loginValid, getValid, updateValid } = require("../middleware/userValidation")

//..........................USER.........................................
router.post("/register",createUserValid, createUser)
router.post("/login" ,loginValid, loginUser)
router.route("/user/:userId/profile")
.get(authentication, getValid, getUser)
.put( updateValid, updatedUser)

//...........................PRODUCT.......................................
router.route("/products")
.post(createProduct)
.get(getProducts)
router.route("/products/:productId")
.get()
.put()
.delete()


module.exports = router;
