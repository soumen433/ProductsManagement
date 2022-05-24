const jwt = require('jsonwebtoken')

const authentication = async function(req, res, next){
    try{
        let token = req.headers["authorization"];
      
        if (!token)
          return res.status(403).send({ status: false, msg: "Token is required" });

        let token1 = token.split(" ").pop()

          
    let decodedToken = jwt.verify(token1, "group-5-productManangement", {
        ignoreExpiration: true,
      }); 
  
      if (!decodedToken) {
        return res
          .status(403)
          .send({ status: false, message: "Invalid authentication" });
      }
      let exptoken = decodedToken.exp;
      if (exptoken * 1000 < Date.now())
        return res.status(400).send({ status: false, msg: "token exp" });
      req.userId = decodedToken.userId; //error 400
  
      next();
    }
    catch(err){
        return res.status(500).send({err: err.message})
    }
}

module.exports.authentication = authentication;