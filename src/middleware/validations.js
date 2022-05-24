const userModel = require("../model/userModel");
const passwordValidator = require("password-validator");
const ObjectId=require("mongoose").Types.ObjectId

const createUserValid = async function (req, res, next) {
  let data = req.body;
  if (Object.keys(data).length == 0) {
    return res
      .status(404)
      .send({ status: false, msg: "Please provide details" });
  }
  let required = ["fname", "lname", "email", "phone", "password", "address"];
  let keys = Object.keys(data);

  for (let i = 0; i < required.length; i++) {
    if (keys.includes(required[i])) continue;
    else
      return res
        .status(400)
        .send({ status: false, msg: `Required field - ${required[i]}` });
  }

  //checking for empty values
  for (const property in data) {
    if (typeof data[property] == "string" && data[property].trim().length == 0)
      return res
        .status(400)
        .send({ status: false, msg: `Please provide data for - ${property}` });
    else continue;
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    return res
      .status(400)
      .send({ status: false, message: "Email should be valid" });
  }
  let email1 = await userModel.findOne({ email: data.email });
  if (email1) {
    return res.status(400).send({ status: false, msg: "Email already exists" });
  }
  const validMobile = /^(\+\d{1,3}[- ]?)?\d{10}$/.test(data.phone);
  if (!validMobile) {
    return res
      .status(400)
      .send({ status: false, msg: "Enter valid mobile no." });
  }
  let phone1 = await userModel.findOne({ phone: data.phone });
  if (phone1) {
    return res
      .status(400)
      .send({ status: false, msg: "Phone number already exists" });
  }
  const schema = new passwordValidator();
  schema.is().min(8).max(15);
  if (!schema.validate(data.password)) {
    return res.status(400).send({
      status: false,
      msg: "length of password should be 8-15 characters",
    });
  }
  next();
};

const loginValid = async function(req,res, next){
    let data = req.body;
    if (Object.keys(data).length == 0) {
      return res
        .status(404)
        .send({ status: false, msg: "Please provide details" });
    }
    if(!data.email){
        return res.status(400).send({
                  status: false,
                  msg: "please provide email",
                });
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
        return res
          .status(400)
          .send({ status: false, message: "Email should be valid" });
      }
    if(!data.password){
        return res.status(400).send({
                  status: false,
                  msg: "please provide password",
                });
    }
    const schema = new passwordValidator();
  schema.is().min(8).max(15);
  if (!schema.validate(data.password)) {
    return res.status(400).send({
      status: false,
      msg: "length of password should be 8-15 characters",
    });
  }
  next()
}

const getValid = async function(req,res, next){
    let user = req.params.userId
    if(!user){
        return res.status(400).send({
            status: false,
            msg: "please provide userId",
          });
    }
    if(!ObjectId.isValid(user)){
        return res.status(400).send({status:false,message:"Please enter valid bookId"})
    }
    next()
}

const updateValid = async function(req,res, next){
    let user = req.params.userId
    if(!user){
        return res.status(400).send({
            status: false,
            msg: "please provide userId",
          });
    }
    if(!ObjectId.isValid(user)){
        return res.status(400).send({status:false,message:"Please enter valid bookId"})
    }
    let data = req.body;
    if (Object.keys(data).length == 0) {
      return res
        .status(404)
        .send({ status: false, msg: "Please provide details" });
    }
    next()
}

module.exports = { createUserValid, loginValid, getValid, updateValid };
