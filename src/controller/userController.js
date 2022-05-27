const userModel = require("../model/userModel");
const { uploadFile } = require("../aws/aws")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Validator = require("../validation/validation");

/* ------------------------------------------------POST/register-------------------------------------------------------- */

const createUser = async function (req, res) {
  try {


    let data = req.body;
    let files = req.files;
    let { fname, lname, email, phone, password, address } = data;
    console.log(files[0].mimetype)

    if (!Validator.isValidBody(data)) {
      return res.status(400).send({
        status: false,
        message: "User data is required for registration",
      });
    }

    if (!Validator.isValidInputValue(fname) || !Validator.isValidOnlyCharacters(fname)) {
      return res.status(400).send({
        status: false,
        message: "First name is required and it should contain only alphabets",
      });
    }

    if (!Validator.isValidInputValue(lname) || !Validator.isValidOnlyCharacters(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "Last name is required and it should contain only alphabets" });
    }

    if (!Validator.isValidInputValue(email) || !Validator.isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "email address is required and should be a valid email address" });
    }

    const notUniqueEmail = await userModel.findOne({ email });

    if (notUniqueEmail) {
      return res
        .status(400)
        .send({ status: false, message: "Email address already exist" });
    }

    if (!Validator.isValidInputValue(phone) || !Validator.isValidPhone(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Phone number is required and should be a valid mobile number" });
    }

    const notUniquePhone = await userModel.findOne({ phone });

    if (notUniquePhone) {
      return res
        .status(400)
        .send({ status: false, message: "phone number already exist" });
    }

    if (!Validator.isValidInputValue(password) || !Validator.isValidPassword(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password is required and should be of 8 to 15 characters and  must have 1 letter and 1 number" });
    }



    if (!Validator.isValidAddress(address)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid address" });
    }

    let arr1 = ['shipping', 'billing']
    let arr2 = ['street', 'city', 'pincode']
    for (let i = 0; i < arr1.length; i++) {
      if (!data.address[arr1[i]])
        return res.status(400).send({ status: false, msg: `${arr1[i]} is mandatory` })
      for (let j = 0; j < arr2.length; j++) {
        if (!data.address[arr1[i]][arr2[j]]) return res.status(400).send({ status: false, msg: `In  ${arr1[i]}, ${arr2[j]} is mandatory` })
      }

      if ((!/^[a-zA-Z ]+$/.test(data.address[arr1[i]].city))) {
        return res
          .status(400)
          .send({
            status: false,
            message: `In ${arr1[i]} , city is invalid`
          });
      }

      if ((!/^[1-9][0-9]{5}$/.test(data.address[arr1[i]].pincode))) {
        return res
          .status(400)
          .send({ status: false, message: `In ${arr1[i]} , pincode is invalid}` });
      }

    }

    if (!files || files.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "no profile image found" });
    }

    if (!Validator.isValidImageType(files[0].mimetype)) {
      return res
        .status(400)
        .send({ status: false, message: "Only images can be uploaded (jpeg/jpg/png)" });
    }

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

    if (!Validator.isValidInputBody(data)) {
      return res.status(400).send({
        status: false,
        message: "User data is required for login",
      });
    }

    if (!Validator.isValidInputValue(email) || !Validator.isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "email is required and should be a valid email" });
    }


    if (!Validator.isValidInputValue(password) || !Validator.isValidPassword(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password is required and should contain 8 to 15 characters and must contain one letter and digit" });
    }


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

    if (!Validator.isValidObjectId(user)) {
      return res
        .status(400)
        .send({ status: false, message: " enter a valid userId" });
    }

    let data = await userModel.findOne({ _id: user, }).collation({ locale: "en", strength: 2 });
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

    if (!Validator.isValidObjectId(user)) {
      return res
        .status(400)
        .send({ status: false, message: " enter a valid userId" });
    }

    const userDetailByUserId = await userModel.findById(user);

    if (!userDetailByUserId) {
      return res
        .status(404)
        .send({ status: false, message: " user not found" });
    }

    const updates = {};

    if (files && files.length > 0) {
      if (!Validator.isValidImageType(files[0].mimetype)) {
        return res
          .status(400)
          .send({ status: false, message: "Only images can be uploaded (jpeg/jpg/png)" });
      }
      const updatedProfileImageUrl = await AWS.uploadFile(files[0]);
      updates["profileImage"] = updatedProfileImageUrl;
    }

    let { fname, lname, email, phone, address, password } = data;

    if (fname) {
      if (!Validator.isValidInputValue(fname) || !Validator.isValidOnlyCharacters(fname)) {
        return res.status(400).send({
          status: false,
          message: "First name should be in valid format and should contains only alphabets",
        });
      }
      updates["fname"] = fname.trim();
    }

    if (lname) {
      if (!Validator.isValidInputValue(lname) || !Validator.isValidOnlyCharacters(lname)) {
        return res.status(400).send({
          status: false,
          message: "Last name should be in valid format and should contains only alphabets",
        });
      }
      updates["lname"] = lname.trim();
    }

    if (email) {
      if (!Validator.isValidInputValue(email) || !Validator.isValidEmail(email)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid email" });
      }

      const notUniqueEmail = await userModel.findOne({ email });

      if (notUniqueEmail) {
        return res
          .status(400)
          .send({ status: false, message: "Email address already exist" });
      }
      updates["email"] = email.trim();
    }

    if (phone) {
      if (!Validator.isValidInputValue(phone) || !Validator.isValidPhone(phone)) {
        return res.status(400).send({
          status: false,
          message: "Enter a valid phone number"
        });
      }

      const notUniquePhone = await userModel.findOne({ phone });

      if (notUniquePhone) {
        return res
          .status(400)
          .send({ status: false, message: "phone number already exist" });
      }
      updates["phone"] = phone.trim();
    }

    if (password) {
      if (!Validator.isValidInputValue(password) || !Validator.isValidPassword(password)) {
        return res.status(400).send({
          status: false,
          message: "password should be valid and should contains 8 to 15 characters and must have 1 letter and 1 number",
        });
      }

      const isOldPasswordSame = await bcrypt.compare(
        password,
        userDetailByUserId.password
      );

      if (isOldPasswordSame) {
        return res
          .status(400)
          .send({ status: false, message: "can not update same password" });
      }

      const saltRounds = 10;
      let encryptedPassword = bcrypt
        .hash(data.password, saltRounds)
        .then((hash) => {
          console.log(`Hash: ${hash}`);
          return hash;
        });

      updates["password"] = await encryptedPassword;
    }

    address = JSON.parse(JSON.stringify(address));

    if (address) {
      if (Validator.isValidInputValue(address)) {
        return res.status(400).send({
          status: false,
          message: "Address should be in valid format ",
        });
      }
     

      // if (!Validator.isValidAddress(address)) {
      //   return res.status(400).send({
      //     status: false,
      //     message: "Address should be in valid format ",
      //   });
      // }

      const { shipping, billing } = address;

      if (address.shipping) {
        if (!Validator.isValidAddress(shipping)) {
          return res.status(400).send({
            status: false,
            message: "Shipping address should be in valid format ",
          });
        }

        const { street, city, pincode } = shipping;

        if (street) {
          if (!Validator.isValidInputValue(street)) {
            return res.status(400).send({
              status: false,
              message: "shipping address: street name should be in valid format ",
            });
          }
          updates["address.shipping.street"] = street.trim();
        }

        if (city) {
          if (!Validator.isValidInputValue(city) || !Validator.isValidOnlyCharacters(city)) {
            return res.status(400).send({
              status: false,
              message: "shipping address: city name should be in valid format ",
            });
          }
          updates["address.shipping.city"] = city.trim();
        }

        if (pincode) {
          if (!Validator.isValidInputValue(pincode)) {
            return res.status(400).send({
              status: false,
              message: "shipping address: pincode should be in valid format ",
            });
          }
          updates["address.shipping.pincode"] = pincode.trim();
        }


        if (address.billing) {
          if (!Validator.isValidAddress(billing)) {
            return res.status(400).send({
              status: false,
              message: "billing address should be in valid format ",
            });
          }

          const { street, city, pincode } = billing;

          if (street) {
            if (!Validator.isValidInputValue(street)) {
              return res.status(400).send({
                status: false,
                message: "billing address: street name should be in valid format ",
              });
            }
            updates["address.billing.street"] = street.trim();
          }

          if (city) {
            if (!Validator.isValidInputValue(city)|| !Validator.isValidOnlyCharacters(city)) {
              return res.status(400).send({
                status: false,
                message: "billing address: city name should be in valid format ",
              });
            }
            updates["address.billing.city"] = city.trim();
          }

          if (pincode) {
            if (!Validator.isValidInputValue(pincode)) {
              return res.status(400).send({
                status: false,
                message: "shipping address: pincode should be in valid format ",
              });
            }
            updates["address.billing.pincode"] = pincode.trim();
          }
        }
      }
    }

    let updatedData = await userModel.findByIdAndUpdate({ _id: user }, { $set: updates }, { new: true }).collation({ locale: "en", strength: 2 });
    return res
      .status(200)
      .send({
        status: true,
        message: "User profile updated",
        data: updatedData,
      });

  }

  catch (err) {
    res.status(500).send({ err: err.message });
  }
};

module.exports = { createUser, updatedUser, loginUser, getUser }
