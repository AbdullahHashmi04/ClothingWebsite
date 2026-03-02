/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import "../../Style/Admin.css";
import { useState } from "react";
import axios from 'axios'
import { useContext } from "react";
import CartContext from "../Context/CartContext";

function Modal({ onClose, editData }) {
  const [form, setForm] = useState(editData || {
    name: "", description: "", price: 0, stock: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editData?.imageUrl || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.post("http://localhost:3000/products/addProduct", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };
  const onUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axios.put(`http://localhost:3000/products/updateProduct/${editData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26,10,46,0.35)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "720px",
        padding: "32px", boxShadow: "0 24px 60px rgba(147,51,234,0.18)",
        animation: "fadeUp 0.3s ease",
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1a0a2e" }}>
              {editData ? "Edit Product" : "Create New Product"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#9ca3af" }}>
              {editData ? "Update product details" : "Add a new product with an image"}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: "34px", height: "34px", borderRadius: "50%",
            border: "1.5px solid #e9d5ff", background: "#faf5ff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", color: "#9333ea",
          }}>×</button>
        </div>

        <div style={{ display: "flex", gap: "32px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Product Name", key: "name", placeholder: "e.g. PR-XXX", type: "text" },
              { label: "Product Description", key: "description", placeholder: "e.g. White-Jeans", type: "text" },
              { label: "Price (Rs)", key: "price", placeholder: "e.g. 1000", type: "number" },
              { label: "Stock", key: "stock", placeholder: "e.g. 50", type: "number" },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px", letterSpacing: "0.04em" }}>
                  {field.label.toUpperCase()}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "1.5px solid #e9d5ff", borderRadius: "10px",
                    fontSize: "13.5px", color: "#1a0a2e",
                    outline: "none", fontFamily: "'DM Sans',sans-serif",
                    background: "#fefcff", boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", letterSpacing: "0.04em", marginBottom: "0px" }}>
              PRODUCT IMAGE
            </label>
            <div
              style={{
                flex: 1,
                border: "2px dashed #e9d5ff", borderRadius: "12px",
                background: "#faf5ff", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", position: "relative",
                overflow: "hidden", cursor: "pointer", padding: "20px", textAlign: "center",
                transition: "all 0.2s ease",
                minHeight: "220px",
              }}
              onClick={() => document.getElementById("file-upload").click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                  <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "#fff", borderRadius: "50%", padding: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  </div>
                </>
              ) : (
                <div style={{ color: "#9333ea", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#e9d5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>Click to upload image</span>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>PNG, JPG or WEBP (Max 5MB)</span>
                  </div>
                </div>
              )}
              <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px", borderRadius: "10px",
            border: "1.5px solid #e9d5ff", background: "#fff",
            fontSize: "13.5px", fontWeight: 600, color: "#6b7280",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
          }}>Cancel</button>
          {editData ? <button onClick={onUpdate} style={{
            flex: 2, padding: "11px", borderRadius: "10px",
            border: "none",  background: "var(--brand-gradient)",
            fontSize: "13.5px", fontWeight: 700, color: "#fff",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 4px 14px rgba(147,51,234,0.3)",
          }}>
            Save Changes
          </button> :
            <button onClick={onSubmit} style={{
              flex: 2, padding: "11px", borderRadius: "10px",
              border: "none", background: "var(--brand-gradient)",
              fontSize: "13.5px", fontWeight: 700, color: "#fff",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              boxShadow: "0 4px 14px rgba(147,51,234,0.3)",
            }}>
              Create Product
            </button>}
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {

  const { productData, setProductData } = useContext(CartContext)
  const [editItem, setEditItem] = useState()
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/products/${id}`);
    setProductData(productData.filter(d => d.id !== id));
  }

  return (
    <div className="admin-stack">
      {showModal && <Modal onClose={() => { setShowModal(false); setEditItem(null); }} editData={editItem} />}

      <div className="admin-card admin-card-pad">
        <div className="admin-card-row">
          <div>
            <div className="admin-card-title">Products</div>
            <div className="admin-muted">Manage catalog, stock and pricing.</div>
          </div>
          <div className="admin-inline">
            {/* <button className="admin-secondary-btn" type="button">
              Import
            </button> */}
            <button className="admin-primary-btn"
              onClick={() => setShowModal(true)}
              type="button">
              + Add Product
            </button>
          </div>
        </div>

        <div className="admin-table admin-mt">
          <div className="admin-table-head">
            <div>SKU</div>
            <div>Product</div>
            <div className="admin-right">Price</div>
            <div className="admin-right">Actions</div>
          </div>
          {productData.map((p) => (
            <div key={p._id} className="admin-table-row">
              {/* <div className="admin-mono">{p.sku}</div> */}
              <div className="admin-strong" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }} />
                ) : (
                  <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "10px", fontWeight: 600, border: "1px dashed #d1d5db" }}>
                    No Img
                  </div>
                )}
              </div>
              <div className="admin-strong">
                <span>{p.name}</span>
              </div>
              <div className="admin-right font-bold">Rs./{p.price}</div>
              <div className="flex gap-2 justify-end">

                {/* Edit */}
                <button
                  onClick={() => { setEditItem(p); setShowModal(true); }}
                  title="Edit"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1.5px solid #e9d5ff", background: "#faf5ff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(p._id)}
                  title="Delete"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1.5px solid #ffe4e6", background: "#fff5f7",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
