import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function CustomerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    whatsapp: "",
    address: "",
    password: "",
    confirm_password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error("Password tidak cocok!");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }
    setLoading(true);
    try {
      // Cek apakah nomor WA sudah terdaftar di customer_accounts
      const { data: existing, error: checkError } = await supabase
        .from("customer_accounts")
        .select("id")
        .eq("whatsapp", form.whatsapp);

      if (existing && existing.length > 0) {
        toast.error("Nomor WhatsApp sudah terdaftar!");
        setLoading(false);
        return;
      }

      // 1. Simpan ke customer_accounts (untuk login)
      const { error: accError } = await supabase
        .from("customer_accounts")
        .insert({
          full_name: form.full_name,
          whatsapp: form.whatsapp,
          address: form.address,
          password_hash: form.password, // TODO: hash in production
        });
      if (accError) throw accError;

      // 2. Otomatis simpan ke customers (untuk admin & pembuatan invoice)
      const { error: custError } = await supabase.from("customers").insert({
        full_name: form.full_name,
        whatsapp: form.whatsapp,
        address: form.address,
        zone: 1,
        notes: "Daftar via online",
      });
      // Jika gagal insert customers (misal sudah ada), tidak perlu gagalkan registrasi
      if (custError) {
        console.warn("Gagal sinkron ke data pelanggan:", custError.message);
      }

      toast.success("Pendaftaran berhasil! Silakan login.");
      navigate("/pesan");
    } catch (err) {
      toast.error("Gagal mendaftar: " + err.message);
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
          maxWidth: "440px",
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
          Daftar Akun
        </h2>
        <p
          style={{
            color: "var(--color-text-muted)",
            marginBottom: "28px",
            fontSize: "14px",
          }}
        >
          Buat akun untuk pemesanan batako online
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <FormInput
            label="Nama Lengkap"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            required
          />

          <FormInput
            label="Nomor WhatsApp"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            placeholder="contoh: 081234567890"
            required
            type="tel"
          />

          {/* Alamat */}
          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              Alamat Pengiriman Lengkap
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Tulis alamat pengiriman lengkap beserta kode pos"
              required
              rows={3}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text)",
                fontSize: "15px",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <FormInput
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimal 6 karakter"
            required
            type={showPass ? "text" : "password"}
            suffix={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <FormInput
            label="Konfirmasi Password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            placeholder="Ulangi password"
            required
            type="password"
          />

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
            {loading ? "Mendaftar..." : "Daftar Sekarang"}
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
          Sudah punya akun?{" "}
          <Link
            to="/pesan"
            style={{
              color: "var(--color-orange)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  suffix,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontWeight: "600",
          fontSize: "14px",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: "100%",
            padding: "12px 14px",
            paddingRight: suffix ? "40px" : "14px",
            borderRadius: "10px",
            border: "1.5px solid var(--color-border)",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text)",
            fontSize: "15px",
            boxSizing: "border-box",
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
        {suffix && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
