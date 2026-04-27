import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../Style/Admin.css";
 
const BACKEND_URI = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URI )

const statusColor = {
  Active: { bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e" },
  Expired: { bg: "#fff1f2", text: "#e11d48", dot: "#f43f5e" },
  Scheduled: { bg: "#fefce8", text: "#ca8a04", dot: "#facc15" },
};

const defaultDiscountForm = {
  code: "",
  type: "Percentage",
  value: "",
  minOrder: "",
  usageLimit: "",
  expiry: "",
  status: "Active",
  applyScope: "all",
  targetCategory: "",
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

function StatCard({ label, value, badge }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f0eaff",
        borderRadius: "14px",
        padding: "20px 22px",
        flex: 1,
        minWidth: "160px",
        position: "relative",
        boxShadow: "0 1px 4px rgba(147,51,234,0.06)",
      }}
    >
      <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500, marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: "#1a0a2e" }}>{value}</div>
      {badge && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "#fdf4ff",
            border: "1px solid #e9d5ff",
            borderRadius: "100px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#9333ea",
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

function Modal({ onClose, editData, categories, onSaved }) {
  const [form, setForm] = useState(() => {
    if (!editData) return defaultDiscountForm;
    return {
      code: editData.code || "",
      type: editData.type || "Percentage",
      value: editData.value ?? "",
      minOrder: editData.minOrder ?? "",
      usageLimit: editData.usageLimit ?? "",
      expiry: toDateInput(editData.expiry),
      status: editData.status || "Active",
      applyScope: editData.applyScope || "all",
      targetCategory: editData.targetCategory || "",
    };
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        value: Number(form.value || 0),
        minOrder: Number(form.minOrder || 0),
        usageLimit: Number(form.usageLimit || 0),
      };

      if (payload.type === "Free Shipping") {
        payload.value = 0;
      }

      if (payload.applyScope !== "category") {
        payload.targetCategory = "";
      }

      if (editData?._id) {
        await axios.put(`${BACKEND_URI}/discounts/updateDiscount/${editData._id}`, payload);
      } else {
        await axios.post(`${BACKEND_URI}/discounts/createDiscount`, payload);
      }

      await onSaved();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save discount");
    } finally {
      setSaving(false);
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
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
          boxShadow: "0 24px 60px rgba(147,51,234,0.18)",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1a0a2e" }}>
              {editData ? "Edit Discount" : "Create New Discount"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#9ca3af" }}>
              Configure coupon and product scope
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
              fontSize: "16px",
              color: "#9333ea",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>PROMO CODE</label>
            <input
              type="text"
              placeholder="e.g. SUMMER25"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e9d5ff", borderRadius: "10px", fontSize: "13.5px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>TYPE</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e9d5ff", borderRadius: "10px", fontSize: "13.5px" }}
              >
                <option>Percentage</option>
                <option>Fixed Amount</option>
                <option>Free Shipping</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>VALUE</label>
              <input
                type="number"
                placeholder="e.g. 20"
                disabled={form.type === "Free Shipping"}
                value={form.type === "Free Shipping" ? 0 : form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e9d5ff", borderRadius: "10px", fontSize: "13.5px", background: form.type === "Free Shipping" ? "#f3f4f6" : "#fff" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>MIN ORDER (RS)</label>
              <input
                type="number"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e9d5ff", borderRadius: "10px", fontSize: "13.5px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>USAGE LIMIT</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e9d5ff", borderRadius: "10px", fontSize: "13.5px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>EXPIRY DATE</label>
              <input
                type="date"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e9d5ff", borderRadius: "10px", fontSize: "13.5px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>STATUS</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e9d5ff", borderRadius: "10px", fontSize: "13.5px" }}
              >
                <option>Active</option>
                <option>Scheduled</option>
                <option>Expired</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>APPLY SCOPE</label>
              <select
                value={form.applyScope}
                onChange={(e) => setForm({ ...form, applyScope: e.target.value, targetCategory: "" })}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e9d5ff", borderRadius: "10px", fontSize: "13.5px" }}
              >
                <option value="all">All Products</option>
                <option value="category">Category Only</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>TARGET CATEGORY</label>
              <select
                value={form.targetCategory}
                disabled={form.applyScope !== "category"}
                onChange={(e) => setForm({ ...form, targetCategory: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e9d5ff", borderRadius: "10px", fontSize: "13.5px", background: form.applyScope !== "category" ? "#f3f4f6" : "#fff" }}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
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
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 2,
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              background: "var(--brand-gradient)",
              fontSize: "13.5px",
              fontWeight: 700,
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.75 : 1,
              boxShadow: "0 4px 14px rgba(147,51,234,0.3)",
            }}
          >
            {saving ? "Saving..." : editData ? "Save Changes" : "Create Discount"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [discountRes, productRes] = await Promise.all([
        axios.get(`${BACKEND_URI}/discounts/getDiscount`),
        axios.get(`${BACKEND_URI}/products`),
      ]);

      const allProducts = productRes.data?.products || [];
      const uniqueCategories = [...new Set(allProducts.map((item) => (item.category || "").toLowerCase()).filter(Boolean))];

      setCategories(uniqueCategories);
      setDiscounts(discountRes.data || []);
    } catch (error) {
      console.error("Failed to load discounts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filtered = filterStatus === "All" ? discounts : discounts.filter((d) => d.status === filterStatus);

  const stats = useMemo(() => {
    return {
      active: discounts.filter((d) => d.status === "Active").length,
      scheduled: discounts.filter((d) => d.status === "Scheduled").length,
      expired: discounts.filter((d) => d.status === "Expired").length,
      totalUses: discounts.reduce((sum, discount) => sum + Number(discount.usageCount || 0), 0),
    };
  }, [discounts]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URI}/discounts/deleteDiscount/${id}`);
      setDiscounts((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete discount");
    }
  };

  const handleApplyToProducts = async (discountId) => {
    setActionLoading((prev) => ({ ...prev, [discountId]: true }));
    try {
      const res = await axios.post(`${BACKEND_URI}/discounts/applyDiscountToProducts/${discountId}`);
      alert(res.data?.message || "Discount applied to products");
      await fetchAllData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to apply discount to products");
    } finally {
      setActionLoading((prev) => ({ ...prev, [discountId]: false }));
    }
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
          categories={categories}
          onSaved={fetchAllData}
        />
      )}

      <div className="admin-card admin-card-pad">
        <div className="admin-card-row">
          <div>
            <div className="admin-card-title">Discounts</div>
            <div className="admin-muted">Create coupons and apply them directly to product prices.</div>
          </div>
          <button className="admin-primary-btn" onClick={() => setShowModal(true)} type="button">
            + Create Discount
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "14px", flexWrap: "wrap" }}>
          <StatCard label="Active Discounts" value={stats.active} badge="live" />
          <StatCard label="Scheduled" value={stats.scheduled} badge="upcoming" />
          <StatCard label="Expired" value={stats.expired} badge="inactive" />
          <StatCard label="Total Uses" value={stats.totalUses} badge="all time" />
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "14px", marginBottom: "14px" }}>
          {["All", "Active", "Scheduled", "Expired"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: "7px 18px",
                borderRadius: "100px",
                border: filterStatus === status ? "1.5px solid transparent" : "1.5px solid #e9d5ff",
                background: filterStatus === status ? "var(--brand-gradient)" : "#fff",
                color: filterStatus === status ? "#fff" : "#6b7280",
                fontSize: "12.5px",
                fontWeight: filterStatus === status ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="admin-table">
          <div
            className="admin-table-head"
            style={{ gridTemplateColumns: "1.4fr 1fr 0.7fr 1fr 0.8fr 0.9fr 1.3fr" }}
          >
            <div>Code</div>
            <div>Type</div>
            <div>Value</div>
            <div>Scope</div>
            <div>Status</div>
            <div>Usage</div>
            <div className="admin-right">Actions</div>
          </div>

          {!loading && filtered.map((discount) => {
            const status = statusColor[discount.status] || statusColor.Active;
            const isApplying = !!actionLoading[discount._id];

            return (
              <div
                key={discount._id}
                className="admin-table-row"
                style={{ gridTemplateColumns: "1.4fr 1fr 0.7fr 1fr 0.8fr 0.9fr 1.3fr" }}
              >
                <div>
                  <div className="admin-strong">{discount.code}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                    Expires {toDateInput(discount.expiry)}
                  </div>
                </div>
                <div>{discount.type}</div>
                <div className="admin-strong">
                  {discount.type === "Percentage" ? `${discount.value}%` : discount.type === "Fixed Amount" ? `Rs. ${discount.value}` : "Free"}
                </div>
                <div style={{ textTransform: "capitalize" }}>
                  {discount.applyScope === "category" ? `Category: ${discount.targetCategory}` : "All Products"}
                </div>
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: status.bg,
                      borderRadius: "100px",
                      padding: "4px 10px",
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                    <span style={{ fontSize: "11.5px", fontWeight: 600, color: status.text }}>{discount.status}</span>
                  </span>
                </div>
                <div>
                  {discount.usageCount || 0}
                  {discount.usageLimit > 0 ? ` / ${discount.usageLimit}` : ""}
                </div>
                <div className="admin-right" style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => handleApplyToProducts(discount._id)}
                    disabled={isApplying}
                    className="admin-secondary-btn"
                    style={{ padding: "6px 10px", fontSize: "12px" }}
                  >
                    {isApplying ? "Applying..." : "Apply to Products"}
                  </button>

                  <button
                    onClick={() => {
                      setEditItem(discount);
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
                    onClick={() => handleDelete(discount._id)}
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

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px 24px", color: "#c4b5d4" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏷️</div>
              <p style={{ fontSize: "15px", color: "#9ca3af", margin: 0 }}>No discounts found for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}