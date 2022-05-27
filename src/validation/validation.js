const passwordValidator = require("password-validator");
const mongoose = require('mongoose')

function isValidBody(data) {
  if (Object.keys(data).length == 0)
    return false
  else return true
}
const isValidInputValue = function (data) {
  if (typeof (data) === 'undefined' || data === null) return false
  if (typeof (data) === 'string' && data.trim().length > 0) return true
  return false
}

const isValidObjectId = function (data) {
  return mongoose.Types.ObjectId.isValid(data);
}

const isValidOnlyCharacters = function (data) {
  return /^[A-Za-z]+$/.test(data)
}

function isValidEmail(data) {
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data))
    return false
  else return true
}
function isValidPhone(data) {
  if (/^(\+\d{1,3}[- ]?)?\d{10}$/.test(data))
    return true
  else return false
}

function isValidPassword(data) {
  const schema = new passwordValidator();
  schema.is().min(8).max(15);
  if (!schema.validate(data))
    return false
  else return true
}

const isValidImageType = function (data) {
  const reg = /image\/png|image\/jpeg|image\/jpg/;
  return reg.test(data)
}

const isValidAddress = function (data) {
  if (typeof (data) === "undefined" ||data === null) return false;
  if (typeof (data) === "object" && Array.isArray(data) === false && Object.keys(data).length > 0) return true;
  return false;
};

const isValidPincode = function(data){
  if ((!/^[1-9][0-9]{5}$/.test(data.address[arr1[i]].pincode))) {
    return res
      .status(400)
      .send({ status: false, message: `In ${arr1[i]} , pincode is invalid}`});
  }
}




module.exports = { isValidBody, isValidInputValue, isValidObjectId, isValidImageType, isValidOnlyCharacters, isValidEmail, isValidPhone, isValidPassword, isValidAddress,isValidPincode }