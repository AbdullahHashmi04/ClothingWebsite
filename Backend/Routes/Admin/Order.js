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


router.patch('/cancel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderDetails.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.Status === 'Cancelled') {
            return res.status(400).json({ error: 'Order is already cancelled' });
        }

        const orderDate = new Date(order.date);
        const now = new Date();
        const diffHours = (now - orderDate) / (1000 * 60 * 60);

        if (diffHours > 24) {
            return res.status(400).json({ error: 'Cancellation window (24 hours) has expired' });
        }

        order.Status = 'Cancelled';
        await order.save();
        res.json({ message: 'Order cancelled successfully', order });
    } catch (err) {
        console.error('Error cancelling order:', err);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
})


router.get('/getUserOrders/:Email', async (req, res) => {

    const { Email } = req.params;
    const orders = await OrderDetails.find({ Email: Email });
    console.log(orders)
    res.json(orders);
})


router.get('/getUserOrdersforChatbot/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const shortId = id.trim().toLowerCase();

        // Fetch all orders and filter by last 6 chars of _id
        const allOrders = await OrderDetails.find({});
        const orders = allOrders.filter(order =>
            order._id.toString().slice(-6).toLowerCase() === shortId
        );

        console.log("Found", orders);
        res.json(orders);
    } catch (err) {
        console.error("Error searching order:", err);
        res.status(500).json({ error: "Failed to search order" });
    }
})


export default router