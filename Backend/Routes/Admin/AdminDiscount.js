import Discount from '../../Model/Discount.js'
import express from 'express'
const router = express.Router()


router.post('/createDiscount', (req, res) => {
    const discount = new Discount(req.body);
    discount.save();
    res.status(200)
    res.send("Successful")
})

router.get('/getDiscount', async (req, res) => {
    const discounts = await Discount.find({})
    res.send(discounts)
})

router.delete('/deleteDiscount/:id', async (req, res) => {

    const { id } = req.params;
    const discount = await Discount.findByIdAndDelete(id);
    res.json(discount)

})


router.put('/updateDiscount/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await Discount.findByIdAndUpdate(id, req.body, { new: true });
        res.json(discount)
    } catch (err) {
        res.status(500).send(err.message);
    }
})

router.post('/applyDiscount', async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        const discount = await Discount.findOne({ code: code.toUpperCase() });

        if (!discount) {
            return res.status(404).json({ success: false, message: "Invalid promo code" });
        }

        if (discount.status !== "Active") {
            return res.status(400).json({ success: false, message: "This promo code is no longer active" });
        }

        if (discount.expiry && new Date(discount.expiry) < new Date()) {
            return res.status(400).json({ success: false, message: "This promo code has expired" });
        }

        if (discount.minOrder && cartTotal < discount.minOrder) {
            return res.status(400).json({ success: false, message: `Minimum order of $${discount.minOrder} required` });
        }

        if (discount.usageLimit !== undefined && discount.usageLimit !== null && discount.usageLimit <= 0) {
            return res.status(400).json({ success: false, message: "This promo code has reached its usage limit" });
        }

        let discountAmount = 0;
        if (discount.type === "Percentage") {
            discountAmount = (cartTotal * discount.value) / 100;
        } else if (discount.type === "Fixed Amount") {
            discountAmount = discount.value;
        } else if (discount.type === "Free Shipping") {
            discountAmount = 0;
        }

        discountAmount = Math.min(discountAmount, cartTotal);

        res.json({
            success: true,
            message: "Promo code applied successfully!",
            discount: {
                code: discount.code,
                type: discount.type,
                value: discount.value,
                discountAmount: parseFloat(discountAmount.toFixed(2)),
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
})

export default router