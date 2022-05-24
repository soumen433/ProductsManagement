const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")

router.post("/register" , userController.createUser)
router.post("/login" , userController.loginUser)
router.route("/user/:userId/profile")
.get(userController.getUser)
.put(userController.updatedUser)


module.exports = router;