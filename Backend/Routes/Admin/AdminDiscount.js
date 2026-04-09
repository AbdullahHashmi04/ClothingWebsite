import Discount from '../../Model/Discount.js';
import Product from '../../Model/Products.js';
import express from 'express';

const router = express.Router();

const normalizeStatusByExpiry = (discount) => {
    if (!discount?.expiry) return discount?.status || 'Active';
    return new Date(discount.expiry) < new Date() ? 'Expired' : discount.status || 'Active';
};

const toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const sanitizeDiscountPayload = (payload = {}) => {
    const type = payload.type || 'Percentage';
    const applyScope = payload.applyScope || 'all';

    const data = {
        code: (payload.code || '').toString().trim().toUpperCase(),
        type,
        value: type === 'Free Shipping' ? 0 : toNumber(payload.value, 0),
        minOrder: toNumber(payload.minOrder, 0),
        usageLimit: toNumber(payload.usageLimit, 0),
        status: payload.status || 'Active',
        applyScope,
        targetCategory: applyScope === 'category' ? (payload.targetCategory || '').toString().trim().toLowerCase() : '',
    };

    if (payload.expiry) {
        data.expiry = new Date(payload.expiry);
    }

    return data;
};

const validateDiscountPayload = (payload) => {
    if (!payload.code) return 'Promo code is required';
    if (!payload.expiry || Number.isNaN(payload.expiry.getTime())) return 'Valid expiry date is required';

    if (payload.type === 'Percentage' && (payload.value <= 0 || payload.value > 100)) {
        return 'Percentage discounts must be between 1 and 100';
    }

    if (payload.type === 'Fixed Amount' && payload.value <= 0) {
        return 'Fixed amount discount must be greater than 0';
    }

    if (!['Percentage', 'Fixed Amount', 'Free Shipping'].includes(payload.type)) {
        return 'Invalid discount type';
    }

    if (!['all', 'category'].includes(payload.applyScope)) {
        return 'Invalid apply scope';
    }

    if (payload.applyScope === 'category' && !payload.targetCategory) {
        return 'Target category is required when scope is category';
    }

    return null;
};

router.post('/createDiscount', async (req, res) => {
    try {
        const payload = sanitizeDiscountPayload(req.body);
        const validationError = validateDiscountPayload(payload);

        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const existingCode = await Discount.findOne({ code: payload.code });
        if (existingCode) {
            return res.status(409).json({ success: false, message: 'Discount code already exists' });
        }

        payload.status = normalizeStatusByExpiry(payload);

        const discount = await Discount.create(payload);
        return res.status(201).json({ success: true, message: 'Discount created successfully', discount });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to create discount' });
    }
});

router.get('/getDiscount', async (req, res) => {
    try {
        const discounts = await Discount.find({}).sort({ createdAt: -1 });

        const withComputedStatus = discounts.map((discount) => {
            const computedStatus = normalizeStatusByExpiry(discount);
            return {
                ...discount.toObject(),
                status: computedStatus,
            };
        });

        return res.json(withComputedStatus);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to fetch discounts' });
    }
});

router.delete('/deleteDiscount/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await Discount.findByIdAndDelete(id);

        if (!discount) {
            return res.status(404).json({ success: false, message: 'Discount not found' });
        }

        return res.json({ success: true, message: 'Discount deleted successfully', discount });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to delete discount' });
    }
});

router.put('/updateDiscount/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const payload = sanitizeDiscountPayload(req.body);
        const validationError = validateDiscountPayload(payload);

        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const existingCode = await Discount.findOne({ code: payload.code, _id: { $ne: id } });
        if (existingCode) {
            return res.status(409).json({ success: false, message: 'Discount code already exists' });
        }

        payload.status = normalizeStatusByExpiry(payload);

        const discount = await Discount.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
        if (!discount) {
            return res.status(404).json({ success: false, message: 'Discount not found' });
        }

        return res.json({ success: true, message: 'Discount updated successfully', discount });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to update discount' });
    }
});

router.post('/applyDiscount', async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        const discount = await Discount.findOne({ code: (code || '').toUpperCase() });

        if (!discount) {
            return res.status(404).json({ success: false, message: 'Invalid promo code' });
        }

        const currentStatus = normalizeStatusByExpiry(discount);
        if (currentStatus !== 'Active') {
            return res.status(400).json({ success: false, message: 'This promo code is no longer active' });
        }

        if (discount.minOrder && Number(cartTotal) < discount.minOrder) {
            return res.status(400).json({ success: false, message: `Minimum order of Rs. ${discount.minOrder} required` });
        }

        if (discount.usageLimit > 0 && discount.usageCount >= discount.usageLimit) {
            return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit' });
        }

        let discountAmount = 0;
        if (discount.type === 'Percentage') {
            discountAmount = (Number(cartTotal) * discount.value) / 100;
        } else if (discount.type === 'Fixed Amount') {
            discountAmount = discount.value;
        }

        discountAmount = Math.min(discountAmount, Number(cartTotal));

        await Discount.findByIdAndUpdate(discount._id, { $inc: { usageCount: 1 } });

        return res.json({
            success: true,
            message: 'Promo code applied successfully!',
            discount: {
                code: discount.code,
                type: discount.type,
                value: discount.value,
                discountAmount: Number(discountAmount.toFixed(2)),
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
});

router.post('/applyDiscountToProducts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await Discount.findById(id);

        if (!discount) {
            return res.status(404).json({ success: false, message: 'Discount not found' });
        }

        const currentStatus = normalizeStatusByExpiry(discount);
        if (currentStatus !== 'Active') {
            return res.status(400).json({ success: false, message: 'Only active discounts can be applied to products' });
        }

        if (discount.type === 'Free Shipping') {
            return res.status(400).json({ success: false, message: 'Free shipping discounts cannot be applied to product prices' });
        }

        const productFilter = {};
        if (discount.applyScope === 'category' && discount.targetCategory) {
            productFilter.category = { $regex: `^${discount.targetCategory}$`, $options: 'i' };
        }

        const products = await Product.find(productFilter);
        if (!products.length) {
            return res.status(404).json({ success: false, message: 'No matching products found for this discount scope' });
        }

        const bulkOps = products.map((product) => {
            const basePrice = (typeof product.originalPrice === 'number' && product.originalPrice > product.price)
                ? product.originalPrice
                : product.price;

            let discountedPrice = basePrice;
            if (discount.type === 'Percentage') {
                discountedPrice = basePrice - (basePrice * discount.value) / 100;
            } else if (discount.type === 'Fixed Amount') {
                discountedPrice = basePrice - discount.value;
            }

            discountedPrice = Math.max(0, Number(discountedPrice.toFixed(2)));

            return {
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            originalPrice: basePrice,
                            price: discountedPrice,
                            discountMeta: {
                                discountId: discount._id,
                                code: discount.code,
                                type: discount.type,
                                value: discount.value,
                                appliedAt: new Date(),
                            },
                        },
                    },
                },
            };
        });

        const writeResult = await Product.bulkWrite(bulkOps);

        return res.json({
            success: true,
            message: `Discount ${discount.code} applied to products successfully`,
            updatedProducts: writeResult.modifiedCount || 0,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to apply discount to products' });
    }
});

export default router;