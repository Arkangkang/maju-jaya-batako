import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();
  const [form, setForm] = useState({ admin_id: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("admin_id", form.admin_id)
        .eq("password_hash", form.password)
        .single();

      if (error || !data) {
        toast.error("ID atau password admin salah!");
        setLoading(false);
        return;
      }

      loginAdmin(data);
      toast.success("Login berhasil!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "var(--color-card)",
          borderRadius: "20px",
          padding: "40px",
          border: "1px solid var(--color-border)",
          boxShadow: "0 8px 32px var(--color-shadow)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            display: "block",
            marginBottom: "12px",
            borderRadius: "8px",
            color: "var(--color-text)",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "450",
          }}
        >
          ← Kembali
        </button>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: "var(--color-orange)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "white",
              fontSize: "24px",
              fontWeight: "800",
            }}
          >
            M
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800" }}>Admin Portal</h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            MAJU JAYA BATAKO
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              ID Admin
            </label>
            <input
              type="text"
              value={form.admin_id}
              onChange={(e) => setForm({ ...form, admin_id: e.target.value })}
              placeholder="Masukkan ID admin"
              required
              style={adminInputStyle()}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Masukkan password"
              required
              style={adminInputStyle()}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "13px",
              borderRadius: "10px",
              backgroundColor: "var(--color-orange)",
              color: "white",
              fontWeight: "700",
              fontSize: "15px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "4px",
            }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

const adminInputStyle = () => ({
  width: "100%",
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1.5px solid var(--color-border)",
  backgroundColor: "var(--color-bg)",
  color: "var(--color-text)",
  fontSize: "15px",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
});
