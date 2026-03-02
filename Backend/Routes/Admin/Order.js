import express from "express"
import OrderDetails from "../../Model/OrderDetails.js"

const router = express.Router()


router.get('/getorders', async (req, res) => {
    const orders = await OrderDetails.find({})
    res.send(orders)
})


router.post("/createOrder", (req, res) => {
    const date = new Date().toISOString().split('T')[0];
    // console.log(req.body.data)
    const Status = "paid"
    const query = new OrderDetails({ ...req.body.data, date, Status });
    console.log("Order received: ", query);
    query.save()
    res.status(200)
    res.send("Successful")
})

router.delete('/deleteorder/:id', async (req, res) => {
    try {

        const { id } = req.params;
        const order = await OrderDetails.findByIdAndDelete(id);
        res.json(order)
    } catch (err) {
        res.status(500).send(err.message);
    }
})


router.get('/getUserOrders/:Email', async (req, res) => {

    const { Email } = req.params;
    const orders = await OrderDetails.find({ Email: Email });
    console.log(orders)
    res.json(orders);
})


export default router