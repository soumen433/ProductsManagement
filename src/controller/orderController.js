const orderModel=require("../model/orderModel")



const orderCreate=async function(req,res){
    let user_id=req.params.userId 
    let cartDetails=req.body
    
    let itemsArr=cartDetails.items
    let totalQuantity=0
    for(let i=0;i<itemsArr.length;i++){
      totalQuantity+= itemsArr[i].quantity
    }
    cartDetails.totalQuantity=totalQuantity
    if(cartDetails.status!="pending"&&cartDetails.status!="completed"&&cartDetails.status!="cancled"){
        return res.status(400).send({status:false,message:"status should be-'pending','completed','cancled'"})
    }
   let orderDetails=await orderModel.create(cartDetails)
   // console.log(total)
res.send(orderDetails)



}


module.exports={orderCreate}