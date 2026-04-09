import express from "express"
import Product from "../../Model/Products.js"
import multer from "multer"
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router()


router.get("/", async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Multer config for product images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = join(__dirname, '../../uploads/products');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

const productImageUpload = upload.fields([
    { name: "images", maxCount: 8 },
    { name: "image", maxCount: 1 },
]);

const toImageUrl = (file) => `http://localhost:3000/uploads/products/${file.filename}`;

const parseArrayField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const normalizeExistingImages = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
        return product.images;
    }
    if (product?.imageUrl) {
        return [product.imageUrl];
    }
    return [];
};

router.post('/addProduct', productImageUpload, async (req, res) => {
    try {
        const productData = { ...req.body };

        const uploadedFiles = [
            ...(req.files?.images || []),
            ...(req.files?.image || []),
        ];
        const uploadedImageUrls = uploadedFiles.map(toImageUrl);
        const existingBodyImages = parseArrayField(req.body.images);
        const finalImages = [...existingBodyImages, ...uploadedImageUrls].filter(Boolean);

        if (finalImages.length > 0) {
            productData.images = [...new Set(finalImages)];
            productData.imageUrl = productData.images[0];
        }

        const product = new Product(productData);
        await product.save();
        res.status(201).json({ message: "Product added successfully", product });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).send(err.message);
    }
});

router.put('/updateProduct/:id', productImageUpload, async (req, res) => {
    try {
        const productData = { ...req.body };

        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const uploadedFiles = [
            ...(req.files?.images || []),
            ...(req.files?.image || []),
        ];
        const uploadedImageUrls = uploadedFiles.map(toImageUrl);

        const hasRetainImages = typeof req.body.retainImages !== "undefined";
        const retainedImages = parseArrayField(req.body.retainImages);
        const fallbackImages = normalizeExistingImages(existingProduct);
        const baseImages = hasRetainImages ? retainedImages : fallbackImages;
        const finalImages = [...baseImages, ...uploadedImageUrls].filter(Boolean);

        delete productData.retainImages;
        delete productData.images;

        if (finalImages.length > 0) {
            productData.images = [...new Set(finalImages)];
            productData.imageUrl = productData.images[0];
        } else {
            productData.images = [];
            productData.imageUrl = "";
        }

        const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).send(err.message);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router
