const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const authenticate = require("../middleware/middleware")
const { createUserValid, loginValid, getValid, updateValid } = require("../middleware/validations")

router.post("/register",createUserValid, userController.createUser)
router.post("/login" ,loginValid, userController.loginUser)
router.route("/user/:userId/profile")
.get(authenticate.authentication, getValid, userController.getUser)
.put( updateValid, userController.updatedUser)


module.exports = router;
