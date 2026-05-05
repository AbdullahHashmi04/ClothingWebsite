import { Phone } from "lucide-react";
import mongoose from "mongoose";

const MyCart = new mongoose.Schema({
    name : String,
    quantity : Number,
    price : String
})

const Details = new mongoose.Schema({
    FullName : String,
    Email : String,
    Phone : Number,
    Address:String,
    date :  String,
    Total : Number,
    Status: String,
    cart :  [MyCart]

})

const OrderDetails =  mongoose.model("OrderDetails",Details)

export default OrderDetails;