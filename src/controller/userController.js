const userModel = require("../model/userModel");
const {uploadFile} = require("../aws/aws")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


/* ------------------------------------------------POST/register-------------------------------------------------------- */

const createUser = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;
    if (files && files.length > 0) {
      let fileUrl = await uploadFile(files[0]);
      data.profileImage = fileUrl;
    } else {
      return res.status(400).send({ msg: "No file found" });
    }

    const saltRounds = 10;
    let encryptedPassword = bcrypt
      .hash(data.password, saltRounds)
      .then((hash) => {
        console.log(`Hash: ${hash}`);
        return hash;
      });

    data.password = await encryptedPassword;
   // console.log(data);

    let savedData = await userModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "User created successfully", data: savedData });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
};

const loginUser = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;
    let hash = await userModel.findOne({ email: email }).collation({ locale: "en", strength: 2 });
    if (hash == null) {
      return res
        .status(400)
        .send({ status: false, msg: "Email does not exist" });
    }

    let compare = bcrypt.compare(password, hash.password).then((res) => {
      return res;
    });

    if (!compare) {
      return res
        .status(400)
        .send({ status: false, msg: "credantials not valid" });
    }

    const token = jwt.sign(
      {
        userId: hash._id,
      },
      "group-5-productManangement",
      { expiresIn: "1200s" }
    );

    res.header("Authorization", "Bearer : " + token);
    return res
      .status(200)
      .send({
        status: true,
        msg: "User logged in successfully",
        data: { userId: hash._id, token: token },
      });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
};

/*--------------------------------------------GET/API---------------------------------------------------*/

const getUser = async function (req, res) {
  try {
    let user = req.params.userId;
    let data = await userModel.findOne({
      _id: user,
    }).collation({ locale: "en", strength: 2 });
    if (data == null) {
      return res
        .status(400)
        .send({ status: false, msg: "User does not exist" });
    }

    return res
      .status(200)
      .send({ status: true, message: "User profile details", data: data });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
};

/* ------------------------------------------------PUT/API-------------------------------------------------------- */
const updatedUser = async function (req, res) {
  try {
    let user = req.params.userId;
    let data = req.body;
   
    let files = req.files;
    
    
    if (files && files.length > 0) {
      let fileUrl = await uploadFile(files[0]);
      data.profileImage = fileUrl;
    } 
      
    
    
    let updatedData = await userModel.findOneAndUpdate({ _id: user }, data, {
      new: true,
    }).collation({ locale: "en", strength: 2 });
    return res
      .status(200)
      .send({
        status: true,
        message: "User profile updated",
        data: updatedData,
      });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
};

module.exports = { createUser, updatedUser, loginUser, getUser };
