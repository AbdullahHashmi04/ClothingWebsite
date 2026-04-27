/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "../../Style/Admin.css";
import CartContext from "../Context/CartContext";


const BACKEND_URI = (
    import.meta.env.VITE_BACKEND_URI ||
    import.meta.env.VITE_BACKEND_URL ||
    ""
).replace(/\/+$/, "");

const PRODUCT_CATEGORIES = [
  "shirts",
  "pants",
  "Jeans",
  "dresses",
  "jackets",
  "shoes",
  "accessories",
  "men",
  "women",
  "kids",
  "other",
];

const toAbsoluteImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return BACKEND_URI ? `${BACKEND_URI}${normalizedPath}` : normalizedPath;
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const payload = error?.response?.data;

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    return payload.errors.join(", ");
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallbackMessage;
};

const getProductImages = (product) => {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images.map(toAbsoluteImageUrl).filter(Boolean);
  }
  return product?.imageUrl ? [toAbsoluteImageUrl(product.imageUrl)].filter(Boolean) : [];
};

function Modal({ onClose, editData, onSaved }) {
  const [form, setForm] = useState({
    name: editData?.name || "",
    description: editData?.description || "",
    price: editData?.price || 0,
    stock: editData?.stock || 0,
    category: editData?.category || "shirts",
  });

  const [existingImages, setExistingImages] = useState(getProductImages(editData));
  const [imageFiles, setImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const previewUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const allPreviewImages = useMemo(
    () => [
      ...existingImages.map((url, idx) => ({ type: "existing", src: url, id: `existing-${idx}` })),
      ...newImagePreviews.map((src, idx) => ({ type: "new", src, id: `new-${idx}` })),
    ],
    [existingImages, newImagePreviews]
  );

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const imageSlotsLeft = Math.max(0, 8 - (existingImages.length + imageFiles.length));
    const limitedFiles = selectedFiles.slice(0, imageSlotsLeft);

    const previewUrls = limitedFiles.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current.push(...previewUrls);
    setImageFiles((prev) => [...prev, ...limitedFiles]);
    setNewImagePreviews((prev) => [...prev, ...previewUrls]);
    e.target.value = "";
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeNewImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setNewImagePreviews((prev) => {
      const removed = prev[indexToRemove];
      if (removed) {
        URL.revokeObjectURL(removed);
        previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== removed);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const appendFormFields = (formData) => {
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("category", form.category);
    imageFiles.forEach((file) => formData.append("images", file));
  };

  const onSubmit = async () => {
    try {
      setSubmitError("");
      const formData = new FormData();
      appendFormFields(formData);

      await axios.post(`${BACKEND_URI}/products/addProduct`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to add product:", err);
      setSubmitError(getApiErrorMessage(err, "Failed to add product. Please check inputs and try again."));
    }
  };

  const onUpdate = async () => {
    try {
      setSubmitError("");
      const formData = new FormData();
      appendFormFields(formData);
      formData.append("retainImages", JSON.stringify(existingImages));

      await axios.put(`${BACKEND_URI}/products/updateProduct/${editData._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to update product:", err);
      setSubmitError(getApiErrorMessage(err, "Failed to update product. Please check inputs and try again."));
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card admin-modal-card-lg">
        <div className="admin-modal-header">
          <div>
            <h2 className="admin-modal-title">{editData ? "Edit Product" : "Create New Product"}</h2>
            <p className="admin-modal-subtitle">
              {editData
                ? "Update catalog details, stock, and gallery images."
                : "Add a new product with description, pricing, and multiple images."}
            </p>
          </div>
          <button className="admin-modal-close" onClick={onClose} type="button" aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="admin-form-split">
          <div className="admin-stack">
            {[
              { label: "Product Name", key: "name", placeholder: "e.g. Classic Denim", type: "text" },
              { label: "Description", key: "description", placeholder: "Product details", type: "text" },
              { label: "Price (Rs)", key: "price", placeholder: "e.g. 2500", type: "number" },
              { label: "Stock", key: "stock", placeholder: "e.g. 50", type: "number" },
            ].map((field) => (
              <div className="admin-field" key={field.key}>
                <label className="admin-field-label">{field.label}</label>
                <input
                  className="admin-input"
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                />
              </div>
            ))}

            <div className="admin-field">
              <label className="admin-field-label">Category</label>
              <select
                className="admin-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-stack">
            <label className="admin-field-label">Product Images (Up to 8)</label>
            <label className="admin-image-dropzone" htmlFor="files-upload">
              Click to select one or more images
              <span className="admin-dropzone-sub">JPG, PNG, WEBP</span>
            </label>

            <input
              id="files-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <div className="admin-preview-grid">
              {allPreviewImages.map((preview, index) => {
                const isExisting = preview.type === "existing";
                const existingIndex = isExisting ? index : -1;
                const newIndex = isExisting ? -1 : index - existingImages.length;

                return (
                  <div key={preview.id} className="admin-preview-item">
                    <img src={preview.src} alt="Product preview" className="admin-preview-image" />
                    <button
                      type="button"
                      onClick={() => (isExisting ? removeExistingImage(existingIndex) : removeNewImage(newIndex))}
                      className="admin-preview-remove"
                    >
                      ×
                    </button>
                    {isExisting ? <span className="admin-preview-chip">Saved</span> : null}
                  </div>
                );
              })}

              {!allPreviewImages.length ? <div className="admin-empty-state">No images selected</div> : null}
            </div>
          </div>
        </div>

        <div className="admin-modal-actions">
          <button onClick={onClose} className="admin-ghost-btn" type="button">
            Cancel
          </button>
          <button onClick={editData ? onUpdate : onSubmit} className="admin-primary-btn" type="button">
            {editData ? "Save Changes" : "Create Product"}
          </button>
        </div>

        {submitError ? <p className="admin-error-text">{submitError}</p> : null}
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { productData, setProductData } = useContext(CartContext);
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const products = Array.isArray(productData) ? productData : [];

  const refreshProducts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URI}/products`);
      setProductData(response.data.products || []);
    } catch (error) {
      console.error("Failed to refresh products:", error);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URI}/products/${id}`);
      setProductData(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const lowStock = products.filter((product) => Number(product.stock || 0) <= 10).length;
  const outOfStock = products.filter((product) => Number(product.stock || 0) === 0).length;

  return (
    <div className="admin-stack">
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            setEditItem(null);
          }}
          editData={editItem}
          onSaved={refreshProducts}
        />
      )}

      <section className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Catalog Management</p>
          <h2 className="admin-page-title">Products</h2>
          <p className="admin-page-subtitle">Control pricing, stock, categories, and media from one place.</p>
        </div>
        <button className="admin-primary-btn" onClick={() => setShowModal(true)} type="button">
          + Add Product
        </button>
      </section>

      <section className="admin-summary-strip">
        <article className="admin-summary-item">
          <div className="admin-summary-label">Total Products</div>
          <div className="admin-summary-value">{products.length}</div>
        </article>
        <article className="admin-summary-item">
          <div className="admin-summary-label">Low Stock</div>
          <div className="admin-summary-value">{lowStock}</div>
        </article>
        <article className="admin-summary-item">
          <div className="admin-summary-label">Out Of Stock</div>
          <div className="admin-summary-value">{outOfStock}</div>
        </article>
      </section>

      <div className="admin-card admin-card-pad">
        <div className="admin-card-row">
          <div>
            <div className="admin-card-title">Product Directory</div>
            <div className="admin-muted">Detailed inventory view with quick edit and delete controls.</div>
          </div>
        </div>

        <div className="admin-table admin-mt">
          <div className="admin-table-head admin-table-head-products">
            <div>Product</div>
            <div>Category</div>
            <div>Stock</div>
            <div className="admin-right">Price</div>
            <div>Gallery</div>
            <div className="admin-right">Actions</div>
          </div>

          {products.map((product) => {
            const productImages = getProductImages(product);
            const firstImage = productImages[0];
            const stock = Number(product.stock || 0);

            return (
              <div key={product._id} className="admin-table-row admin-table-row-products">
                <div className="admin-product-cell">
                  {firstImage ? (
                    <img src={firstImage} alt={product.name} className="admin-product-thumb" />
                  ) : (
                    <div className="admin-product-thumb admin-product-thumb-empty">
                      No Img
                    </div>
                  )}
                  <div>
                    <div className="admin-strong">{product.name}</div>
                    <div className="admin-muted admin-xs">{product.description || "No description"}</div>
                  </div>
                </div>

                <div>{product.category || "Uncategorized"}</div>

                <div>
                  <span className={`admin-pill ${stock === 0 ? "admin-pill-danger" : stock <= 10 ? "admin-pill-warn" : "admin-pill-paid"}`}>
                    {stock} in stock
                  </span>
                </div>

                <div className="admin-right admin-strong">Rs. {Number(product.price || 0).toLocaleString()}</div>

                <div className="admin-muted">{productImages.length} image(s)</div>

                <div className="admin-actions-right">
                  <button
                    onClick={() => {
                      setEditItem(product);
                      setShowModal(true);
                    }}
                    title="Edit"
                    className="admin-icon-btn"
                    type="button"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDelete(product._id)}
                    title="Delete"
                    className="admin-icon-btn admin-icon-btn-danger"
                    type="button"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}

          {!products.length ? <div className="admin-empty-state">No products in catalog yet.</div> : null}
        </div>
      </div>
    </div>
  );
}