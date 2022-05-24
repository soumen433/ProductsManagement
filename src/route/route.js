const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")

router.post("/register" , userController)
router.post("/login" , userController)
router.route("/user/:userId/profile")
.get(userController)
.put(userController)


module.exports = router;