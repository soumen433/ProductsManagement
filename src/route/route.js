const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const {authentication , authorization} = require("../middleware/middleware")
const { createUserValid, loginValid, getValid, updateValid } = require("../middleware/validations")

router.post("/register",createUserValid, userController.createUser)
router.post("/login" ,loginValid, userController.loginUser)
router.route("/user/:userId/profile")
.get(authentication, getValid, userController.getUser)
.put( authentication,updateValid, userController.updatedUser)


module.exports = router;
