const mongoose=require("mongoose")

const orderSchema= new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            _id: false
        }],
        totalPrice: {
            type: Number,
            required: true
        },
        totalItems: {
            type: Number,
            required: true
        },
        totalQuantity:{
            type:Number,
            required:true
        },
        cancellable:{
            type:Boolean,

            default:true
        },
        status:{
            type:String,
            enum:["pending", "completed", "cancled"],
            default:"pending"
        },
        isDeleted:{
            type:Boolean,
            default:false
        },
    },{timestamps: true}
)
module.exports = mongoose.model("order", orderSchema);
