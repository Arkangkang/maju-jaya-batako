import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Moon,
  Sun,
  Phone,
  MessageCircle,
  MapPin,
  ChevronRight,
  Star,
  Menu,
  X,
} from "lucide-react";

import logoImg from "../../assets/logo.png";
import heroBg from "../../assets/hero-bg.webp"; // GANTI → import heroBg from '../../assets/hero-bg.jpg'
import productImg from "../../assets/product-batako.webp"; // GANTI → import productImg from '../../assets/product-batako.jpg'

const COMPANY_INFO = {
  name: "MAJU JAYA BATAKO",
  tagline: "Produsen Batako Press Berkualitas Tinggi",
  description:
    "Kami adalah perusahaan produsen batako press yang telah berpengalaman melayani kebutuhan konstruksi residensial, komersial, dan infrastruktur di Jawa Barat dan sekitarnya.",
  product: {
    name: "Batako Press",
    dimensions: "38 x 18 x 9 cm",
    description:
      "Batako press dengan tekanan tinggi, kuat, presisi, dan tahan lama untuk berbagai kebutuhan konstruksi.",
  },
  location:
    "R5M9+5GV, Jl. Raya Sukatani, Kp.Kempes, Sukamulya, Kec. Sukatani, Kabupaten Bekasi, Jawa Barat 17630",
  phone: "0821-1408-8588",
  whatsapp: "0821-1408-8588",
  whatsappRaw: "6282114088588",
};

const PARTNERS = [
  {
    name: "Halim Perdana Kusuma",
    project: "Proyek Residensial & Komersial",
    icon: "🏢",
  },
  {
    name: "Summarecon Bekasi",
    project: "Proyek Property Berskala Besar",
    icon: "🏙️",
  },
  {
    name: "Summarecon Crown Gading",
    project: "Proyek Property Premium",
    icon: "👑",
  },
  { name: "Nusantara", project: "Proyek Infrastruktur", icon: "🏗️" },
  { name: "Panjibuwono", project: "Proyek Pembangunan", icon: "🔨" },
];

export default function Portfolio() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        minHeight: "100vh",
      }}
    >
      {/* ===== NAVBAR ===== */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "0 1px 8px var(--color-shadow)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <img
              src={logoImg}
              alt="MAJU JAYA BATAKO Logo"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <span style={{
              fontWeight: "700",
              fontSize: "clamp(13px, 3.5vw, 18px)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              MAJU JAYA BATAKO
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
            className="desktop-nav"
          >
            <a
              href="#"
              style={{
                color: "var(--color-orange)",
                fontWeight: "600",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Portfolio
            </a>
            <button
              onClick={() => navigate("/pesan")}
              style={{
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "15px",
                whiteSpace: "nowrap",
              }}
            >
              Pemesanan Online
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {theme === "dark" ? (
                <Sun size={18} color="var(--color-orange)" />
              ) : (
                <Moon size={18} color="var(--color-text-muted)" />
              )}
            </button>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}
            className="mobile-nav"
          >
            <button
              onClick={toggleTheme}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {theme === "dark" ? (
                <Sun size={16} color="var(--color-orange)" />
              ) : (
                <Moon size={16} color="var(--color-text-muted)" />
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div
            className="mobile-nav"
            style={{
              borderTop: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <a
              href="#"
              onClick={() => setMenuOpen(false)}
              style={{
                color: "var(--color-orange)",
                fontWeight: "600",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: "8px",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            >
              Portfolio
            </a>
            <button
              onClick={() => { setMenuOpen(false); navigate("/pesan"); }}
              style={{
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "15px",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: "8px",
              }}
            >
              Pemesanan Online
            </button>
          </div>
        )}
      </nav>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav { display: none !important; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>

      {/* ===== HERO SECTION ===== */}
      <section
        style={{
          backgroundImage: `url('${heroBg}')`,
          backgroundSize: "88%",
          backgroundPosition: "center",
          backgroundAttachment: "scroll",
          position: "relative",
          padding: "80px 24px",
        }}
      >
        {/* Overlay untuk readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor:
              theme === "dark"
                ? "rgba(0, 0, 0, 0.7)"
                : "rgba(255, 253, 248, 0.85)",
            zIndex: 1,
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "60px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "280px" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "999px",
                  backgroundColor: "var(--color-orange)",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "20px",
                }}
              >
                Produsen Batako Press Terpercaya
              </div>
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: "800",
                  lineHeight: 1.1,
                  marginBottom: "20px",
                }}
              >
                Maju Jaya
                <br />
                <span style={{ color: "var(--color-orange)" }}>Batako</span>
              </h1>
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.7,
                  marginBottom: "32px",
                  maxWidth: "480px",
                }}
              >
                {COMPANY_INFO.description}
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate("/daftar")}
                  style={{
                    padding: "14px 28px",
                    borderRadius: "10px",
                    backgroundColor: "var(--color-orange)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "16px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  Daftar <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/pesan")}
                  style={{
                    padding: "14px 28px",
                    borderRadius: "10px",
                    backgroundColor: "transparent",
                    color: "var(--color-orange)",
                    fontWeight: "700",
                    fontSize: "16px",
                    border: "2px solid var(--color-orange)",
                    cursor: "pointer",
                  }}
                >
                  Pesan Sekarang
                </button>
              </div>
            </div>

            {/* Product Card */}
            <div
              style={{
                flex: "0 0 300px",
                backgroundColor: "var(--color-card)",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid var(--color-border)",
                boxShadow: "0 8px 32px var(--color-shadow)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  borderRadius: "12px",
                  backgroundColor: theme === "dark" ? "#2a2a2a" : "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  fontSize: "48px",
                }}
              >
                {
                  <img
                    src={productImg}
                    alt="Batako Press"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                }
              </div>
              <h3
                style={{
                  fontWeight: "700",
                  fontSize: "20px",
                  marginBottom: "8px",
                }}
              >
                {COMPANY_INFO.product.name}
              </h3>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  marginBottom: "12px",
                  fontSize: "15px",
                }}
              >
                Dimensi:{" "}
                <strong style={{ color: "var(--color-text)" }}>
                  {COMPANY_INFO.product.dimensions}
                </strong>
              </p>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {COMPANY_INFO.product.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KEMITRAAN ===== */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "800",
                marginBottom: "12px",
              }}
            >
              Kemitraan &{" "}
              <span style={{ color: "var(--color-orange)" }}>Proyek</span>
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "16px" }}>
              Dipercaya oleh berbagai pengembang properti dan proyek
              infrastruktur
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {PARTNERS.map((partner) => (
              <div
                key={partner.name}
                style={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                  padding: "28px 20px",
                  textAlign: "center",
                  boxShadow: "0 2px 12px var(--color-shadow)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px var(--color-shadow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 12px var(--color-shadow)";
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>
                  {partner.icon}
                </div>
                <h4
                  style={{
                    fontWeight: "700",
                    fontSize: "15px",
                    marginBottom: "6px",
                  }}
                >
                  {partner.name}
                </h4>
                <p
                  style={{ color: "var(--color-text-muted)", fontSize: "13px" }}
                >
                  {partner.project}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LOKASI & KONTAK ===== */}
      <section
        style={{
          padding: "80px 24px",
          backgroundColor: "var(--color-bg-secondary)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "800",
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            Lokasi &{" "}
            <span style={{ color: "var(--color-orange)" }}>Kontak</span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            <ContactCard
              icon={<MapPin size={24} color="var(--color-orange)" />}
              title="Alamat"
              value={COMPANY_INFO.location}
            />
            <ContactCard
              icon={<Phone size={24} color="var(--color-orange)" />}
              title="Telepon"
              value={COMPANY_INFO.phone}
            />
            <ContactCard
              icon={<MessageCircle size={24} color="var(--color-orange)" />}
              title="WhatsApp"
              value={COMPANY_INFO.whatsapp}
              link={`https://wa.me/${COMPANY_INFO.whatsappRaw}`}
            />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          padding: "32px 24px",
          borderTop: "1px solid var(--color-border)",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "14px",
        }}
      >
        © 2025 MAJU JAYA BATAKO. All rights reserved.
      </footer>

      {/* ===== PORTAL ADMIN (tersembunyi di kanan bawah) ===== */}
      <button
        onClick={() => navigate("/admin/login")}
        title="Admin Portal"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "var(--color-border)",
          border: "none",
          cursor: "pointer",
          opacity: 0.4,
          fontSize: "14px",
          color: "var(--color-text-muted)",
          transition: "opacity 0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.target.style.opacity = "0.4")}
      >
        ⚙
      </button>
    </div>
  );
}

function ContactCard({ icon, title, value, link }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        padding: "28px",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
        boxShadow: "0 2px 8px var(--color-shadow)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: "var(--color-orange-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontWeight: "600", marginBottom: "4px" }}>{title}</p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--color-orange)", textDecoration: "none" }}
          >
            {value}
          </a>
        ) : (
          <p style={{ color: "var(--color-text-muted)", fontSize: "15px" }}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
