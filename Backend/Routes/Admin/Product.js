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

router.post('/addProduct', upload.single('image'), async (req, res) => {
    try {
        const productData = { ...req.body };
        if (req.file) {
            productData.imageUrl = `http://localhost:3000/uploads/products/${req.file.filename}`;
        }
        const product = new Product(productData);
        await product.save();
        res.status(201).json({ message: "Product added successfully", product });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).send(err.message);
    }
});

router.put('/updateProduct/:id', upload.single('image'), async (req, res) => {
    try {
        const productData = { ...req.body };
        if (req.file) {
            productData.imageUrl = `http://localhost:3000/uploads/products/${req.file.filename}`;
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
