/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "../../Style/Admin.css";
import CartContext from "../Context/CartContext";

const getProductImages = (product) => {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images;
  }
  return product?.imageUrl ? [product.imageUrl] : [];
};

function Modal({ onClose, editData, onSaved }) {
  const [form, setForm] = useState({
    name: editData?.name || "",
    description: editData?.description || "",
    price: editData?.price || 0,
    stock: editData?.stock || 0,
    category: editData?.category || "",
  });

  const [existingImages, setExistingImages] = useState(getProductImages(editData));
  const [imageFiles, setImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
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
      const formData = new FormData();
      appendFormFields(formData);

      await axios.post("http://localhost:3000/products/addProduct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const onUpdate = async () => {
    try {
      const formData = new FormData();
      appendFormFields(formData);
      formData.append("retainImages", JSON.stringify(existingImages));

      await axios.put(`http://localhost:3000/products/updateProduct/${editData._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(26,10,46,0.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px",
          boxShadow: "0 24px 60px rgba(147,51,234,0.18)",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1a0a2e" }}>
              {editData ? "Edit Product" : "Create New Product"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#9ca3af" }}>
              {editData ? "Update product details and image gallery" : "Add a new product with multiple images"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1.5px solid #e9d5ff",
              background: "#faf5ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "#9333ea",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "Product Name", key: "name", placeholder: "e.g. Classic Denim", type: "text" },
              { label: "Description", key: "description", placeholder: "Product details", type: "text" },
              { label: "Price (Rs)", key: "price", placeholder: "e.g. 2500", type: "number" },
              { label: "Category", key: "category", placeholder: "e.g. shirts", type: "text" },
              { label: "Stock", key: "stock", placeholder: "e.g. 50", type: "number" },
            ].map((field) => (
              <div key={field.key}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b7280",
                    marginBottom: "6px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {field.label.toUpperCase()}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1.5px solid #e9d5ff",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    color: "#1a0a2e",
                    outline: "none",
                    fontFamily: "'DM Sans',sans-serif",
                    background: "#fefcff",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", letterSpacing: "0.04em" }}>
              PRODUCT IMAGES (UP TO 8)
            </label>
            <label
              htmlFor="files-upload"
              style={{
                border: "2px dashed #e9d5ff",
                borderRadius: "12px",
                background: "#faf5ff",
                padding: "14px",
                textAlign: "center",
                color: "#9333ea",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Click to select one or more images
              <div style={{ color: "#9ca3af", fontWeight: 500, marginTop: "4px", fontSize: "12px" }}>
                JPG, PNG, WEBP
              </div>
            </label>
            <input
              id="files-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "8px",
                minHeight: "140px",
              }}
            >
              {allPreviewImages.map((preview, index) => {
                const isExisting = preview.type === "existing";
                const existingIndex = isExisting ? index : -1;
                const newIndex = isExisting ? -1 : index - existingImages.length;

                return (
                  <div key={preview.id} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid #ede9fe" }}>
                    <img src={preview.src} alt="Product preview" style={{ width: "100%", height: "92px", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => (isExisting ? removeExistingImage(existingIndex) : removeNewImage(newIndex))}
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        border: "none",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(17,24,39,0.75)",
                        color: "#fff",
                        cursor: "pointer",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                    {isExisting && (
                      <span
                        style={{
                          position: "absolute",
                          left: "6px",
                          bottom: "6px",
                          fontSize: "10px",
                          background: "rgba(255,255,255,0.88)",
                          padding: "2px 6px",
                          borderRadius: "999px",
                          fontWeight: 700,
                        }}
                      >
                        Saved
                      </span>
                    )}
                  </div>
                );
              })}

              {allPreviewImages.length === 0 && (
                <div
                  style={{
                    border: "1px dashed #d8b4fe",
                    borderRadius: "10px",
                    minHeight: "92px",
                    gridColumn: "1 / -1",
                    display: "grid",
                    placeItems: "center",
                    color: "#9ca3af",
                    fontSize: "12px",
                  }}
                >
                  No images selected
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "10px",
              border: "1.5px solid #e9d5ff",
              background: "#fff",
              fontSize: "13.5px",
              fontWeight: 600,
              color: "#6b7280",
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={editData ? onUpdate : onSubmit}
            style={{
              flex: 2,
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              background: "var(--brand-gradient)",
              fontSize: "13.5px",
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              boxShadow: "0 4px 14px rgba(147,51,234,0.3)",
            }}
          >
            {editData ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { productData, setProductData } = useContext(CartContext);
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const refreshProducts = async () => {
    const response = await axios.get("http://localhost:3000/products");
    setProductData(response.data.products || []);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/products/${id}`);
    setProductData(productData.filter((d) => d._id !== id));
  };

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

      <div className="admin-card admin-card-pad">
        <div className="admin-card-row">
          <div>
            <div className="admin-card-title">Products</div>
            <div className="admin-muted">Manage catalog, stock, pricing and product image gallery.</div>
          </div>
          <div className="admin-inline">
            <button className="admin-primary-btn" onClick={() => setShowModal(true)} type="button">
              + Add Product
            </button>
          </div>
        </div>

        <div className="admin-table admin-mt">
          <div className="admin-table-head">
            <div>Thumbnail</div>
            <div>Product</div>
            <div className="admin-right">Price</div>
            <div className="admin-right">Actions</div>
          </div>

          {productData.map((p) => {
            const productImages = getProductImages(p);
            const firstImage = productImages[0];

            return (
              <div key={p._id} className="admin-table-row">
                <div className="admin-strong" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {firstImage ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={firstImage}
                        alt={p.name}
                        style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}
                      />
                      {productImages.length > 1 && (
                        <span
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-10px",
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#fff",
                            background: "var(--brand-gradient)",
                            borderRadius: "999px",
                            padding: "2px 6px",
                          }}
                        >
                          +{productImages.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "8px",
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        fontSize: "10px",
                        fontWeight: 600,
                        border: "1px dashed #d1d5db",
                      }}
                    >
                      No Img
                    </div>
                  )}
                </div>

                <div className="admin-strong">
                  <span>{p.name}</span>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{p.category}</div>
                </div>

                <div className="admin-right font-bold">Rs. {Number(p.price || 0).toLocaleString()}</div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setEditItem(p);
                      setShowModal(true);
                    }}
                    title="Edit"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: "1.5px solid #e9d5ff",
                      background: "#faf5ff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDelete(p._id)}
                    title="Delete"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: "1.5px solid #ffe4e6",
                      background: "#fff5f7",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
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
        </div>
      </div>
    </div>
  );
}