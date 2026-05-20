import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useCustomerAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { login } = useCustomerAuth();
  const [form, setForm] = useState({ whatsapp: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customer_accounts")
        .select("*")
        .eq("whatsapp", form.whatsapp)
        .eq("password_hash", form.password) // TODO: bcrypt compare di production
        .single();

      if (error || !data) {
        toast.error("Nomor WA atau password salah!");
        setLoading(false);
        return;
      }

      login(data);
      toast.success(`Selamat datang, ${data.full_name}!`);
      navigate("/konfirmasi");
    } catch (err) {
      toast.error("Terjadi kesalahan: " + err.message);
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
          maxWidth: "400px",
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
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "24px",
            fontSize: "14px",
          }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <h2
          style={{ fontSize: "26px", fontWeight: "800", marginBottom: "8px" }}
        >
          Login Pemesanan
        </h2>
        <p
          style={{
            color: "var(--color-text-muted)",
            marginBottom: "28px",
            fontSize: "14px",
          }}
        >
          Masukkan nomor WhatsApp dan password
        </p>

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
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="081234567890"
              required
              style={inputStyle()}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-orange)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
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
              style={inputStyle()}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-orange)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "var(--color-orange)",
              color: "white",
              fontWeight: "700",
              fontSize: "16px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "8px",
            }}
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "var(--color-text-muted)",
          }}
        >
          Belum punya akun?{" "}
          <Link
            to="/daftar"
            style={{
              color: "var(--color-orange)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = () => ({
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1.5px solid var(--color-border)",
  backgroundColor: "var(--color-bg)",
  color: "var(--color-text)",
  fontSize: "15px",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
});
