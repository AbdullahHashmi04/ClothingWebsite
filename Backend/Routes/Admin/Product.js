import express from "express"
import Product from "../../Model/Products.js"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../../Config/cloudinary.js"
import fs from "fs"
import path from "path"

const router = express.Router()

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
const hasRealEnvValue = (value) => {
    if (typeof value !== "string") return false;
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return ![
        "undefined",
        "null",
        "your_cloud_name",
        "your_api_key",
        "your_api_secret",
        "change_me",
    ].includes(normalized);
};

const cloudinaryConfigured = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
].every(hasRealEnvValue);

const localUploadDir = path.resolve(process.cwd(), "uploads", "products");
fs.mkdirSync(localUploadDir, { recursive: true });

const localDiskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, localUploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const safeExt = allowedExtensions.includes(ext) ? ext : ".jpg";
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
});

const storage = cloudinaryConfigured
    ? new CloudinaryStorage({
        cloudinary,
        params: {
            folder: "products",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
    })
    : localDiskStorage;

const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        if (allowedExtensions.includes(ext)) {
            return cb(null, true);
        }
        return cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
    },
});

const productImageUpload = upload.fields([
    { name: "images", maxCount: 8 },
    { name: "image", maxCount: 1 },
]);

const localUpload = multer({
    storage: localDiskStorage,
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        if (allowedExtensions.includes(ext)) {
            return cb(null, true);
        }
        return cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
    },
});

const localProductImageUpload = localUpload.fields([
    { name: "images", maxCount: 8 },
    { name: "image", maxCount: 1 },
]);

const runLocalProductImageUpload = (req, res) =>
    new Promise((resolve, reject) => {
        localProductImageUpload(req, res, (err) => {
            if (err) return reject(err);
            return resolve();
        });
    });

const runProductImageUpload = (req, res) =>
    new Promise((resolve, reject) => {
        productImageUpload(req, res, (err) => {
            if (
                err &&
                cloudinaryConfigured &&
                /Must supply api_key|cloudinary/i.test(String(err.message || ""))
            ) {
                return runLocalProductImageUpload(req, res)
                    .then(resolve)
                    .catch(reject);
            }

            if (err) return reject(err);
            return resolve();
        });
    });

const toImageUrl = (file) => {
    if (!file) return "";

    if (typeof file.path === "string" && /^https?:\/\//i.test(file.path)) {
        return file.path;
    }

    if (file.filename) {
        return `/uploads/products/${file.filename}`;
    }

    if (typeof file.path === "string") {
        const normalizedPath = file.path.replace(/\\/g, "/");
        const marker = "/uploads/";
        const markerIndex = normalizedPath.lastIndexOf(marker);
        if (markerIndex !== -1) {
            return normalizedPath.slice(markerIndex);
        }
    }

    return "";
};

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

const normalizeCategory = (categoryValue) => {
    if (typeof categoryValue !== "string") return categoryValue;

    const normalized = categoryValue.trim().toLowerCase();
    const categoryMap = {
        shirt: "shirts",
        shirts: "shirts",
        pant: "pants",
        pants: "pants",
        jean: "Jeans",
        jeans: "Jeans",
        dress: "dresses",
        dresses: "dresses",
        jacket: "jackets",
        jackets: "jackets",
        shoe: "shoes",
        shoes: "shoes",
        accessory: "accessories",
        accessories: "accessories",
        men: "men",
        women: "women",
        kid: "kids",
        kids: "kids",
        other: "other",
    };

    return categoryMap[normalized] || normalized;
};

const getServerBaseUrl = (req) => {
    if (process.env.BACKEND_PUBLIC_URL) {
        return process.env.BACKEND_PUBLIC_URL.replace(/\/+$/, "");
    }

    const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
    const forwardedHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();

    const protocol = forwardedProto || req.protocol;
    const host = forwardedHost || req.get("host");
    return `${protocol}://${host}`.replace(/\/+$/, "");
};

const resolveImageUrl = (url, req) => {
    if (!url || typeof url !== "string") return "";
    if (/^https?:\/\//i.test(url)) return url;

    const normalizedPath = url.startsWith("/") ? url : `/${url}`;
    return `${getServerBaseUrl(req)}${normalizedPath}`;
};

const normalizeProductForResponse = (product, req) => {
    const productObject = typeof product?.toObject === "function" ? product.toObject() : { ...product };
    const normalizedImages = normalizeExistingImages(productObject)
        .map((url) => resolveImageUrl(url, req))
        .filter(Boolean);

    return {
        ...productObject,
        images: normalizedImages,
        imageUrl: normalizedImages[0] || resolveImageUrl(productObject.imageUrl, req) || "",
    };
};

router.get("/", async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products: products.map((product) => normalizeProductForResponse(product, req)) });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/addProduct', async (req, res) => {
    try {
        await runProductImageUpload(req, res);

        const productData = { ...req.body };
        productData.category = normalizeCategory(productData.category);

        if (typeof productData.name === "string") productData.name = productData.name.trim();
        if (typeof productData.description === "string") productData.description = productData.description.trim();
        if (typeof productData.price !== "undefined") productData.price = Number(productData.price);
        if (typeof productData.stock !== "undefined") productData.stock = Number(productData.stock);

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
        res.status(201).json({
            message: "Product added successfully",
            product: normalizeProductForResponse(product, req),
        });
    } catch (err) {
        console.error("Error adding product:", err);

        if (err?.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid product data",
                errors: Object.values(err.errors || {}).map((error) => error.message),
            });
        }

        if (err?.message?.includes("Only JPG, JPEG, PNG, and WEBP images are allowed")) {
            return res.status(400).json({ message: err.message });
        }

        if (err?.message?.includes("Must supply api_key")) {
            return res.status(500).json({
                message: "Cloudinary is not configured correctly. Set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET or leave them empty to use local uploads.",
            });
        }

        return res.status(500).json({ message: err?.message || "Failed to add product" });
    }
});

router.put('/updateProduct/:id', async (req, res) => {
    try {
        await runProductImageUpload(req, res);

        const productData = { ...req.body };
        productData.category = normalizeCategory(productData.category);

        if (typeof productData.name === "string") productData.name = productData.name.trim();
        if (typeof productData.description === "string") productData.description = productData.description.trim();
        if (typeof productData.price !== "undefined") productData.price = Number(productData.price);
        if (typeof productData.stock !== "undefined") productData.stock = Number(productData.stock);

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
        res.status(200).json({
            message: "Product updated successfully",
            product: normalizeProductForResponse(product, req),
        });
    } catch (err) {
        console.error("Error updating product:", err);

        if (err?.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid product data",
                errors: Object.values(err.errors || {}).map((error) => error.message),
            });
        }

        if (err?.message?.includes("Only JPG, JPEG, PNG, and WEBP images are allowed")) {
            return res.status(400).json({ message: err.message });
        }

        if (err?.message?.includes("Must supply api_key")) {
            return res.status(500).json({
                message: "Cloudinary is not configured correctly. Set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET or leave them empty to use local uploads.",
            });
        }

        return res.status(500).json({ message: err?.message || "Failed to update product" });
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