const userModel = require("../model/userModel");
const aws = require("aws-sdk");
const jwt = require("jsonwebtoken")
const bcrypt=require("bcrypt")


/* ------------------------------------------------aws config -------------------------------------------------------- */
aws.config.update({

    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

/* ------------------------------------------------aws fileUpload-------------------------------------------------------- */
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = as.s3({ apiVersion: "2006-03-01" })

        var uploadParams = {
            ACL: "public-read",
            Bucket: "product-management",
            Key: "user/" + file.originalname,
            Body: file.buffer

        }
        s3.upload(uploadParams, function (err, data) {
            if (err)
                return reject({ "error": err })

            return resolve(data.Location)

        })


    })

}


 
/* ------------------------------------------------POST/register-------------------------------------------------------- */

const createUser = async function (req, res) {
    try {
        let data = req.body;
        let savedData = await userModel.create(data)
        return res.status(201).send({ status: true, msg: "User created successfully", data: savedData })
    }
    catch (err) {
        res.status(500).send({ err: err.msg })
    }

}

const loginUser = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data
        let savedData = await userModel.findOne(data)
        if (savedData) {
            jwt.sign({
                userId: savedData._id,

            }, "group-5-productManangement", { expiresIn: "1200s" })

            return res.status(201).send({ status: true, msg: "User created successfully", data: savedData })
        }


    }
    catch (err) {
        res.status(500).send({ err: err.msg })
    }


}

/*--------------------------------------------GET/API---------------------------------------------------*/

const getUser = async function (req, res){
try{
    let user = req.params.userId
    let data = await userModel.findOne({
        _id: user
    })
    return res.status(200).send({ status: true, message: "List of user", data: data})
}
catch (err){
    res.status(500).send({ err: err.message})
}   
}

/* ------------------------------------------------PUT/API-------------------------------------------------------- */
const updatedUser = async function (req, res) {
    try {
        let user = req.params.userId
        let data = req.body

        let updatedData = await userModel.findOneUpdate({ _id: user, data, new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedData })
    }
    catch (err) {
        res.status(500).send({ err: err.message })
    }
}


module.exports = { createUser,updatedUser,loginUser , getUser}
