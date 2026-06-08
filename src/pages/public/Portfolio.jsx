import { useState, useEffect } from "react";
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
import heroBg1 from "../../assets/image/354dadda-c7fc-440d-99b5-e699e01ffe68.jpg";
import heroBg2 from "../../assets/image/380e2c31-910b-4c20-b623-a63920ff3431.jpg";
import heroBg3 from "../../assets/image/50b56e43-1047-4479-ae7a-fde47b9c146e.jpg";
import heroBg4 from "../../assets/image/68785ac1-1ea2-4bcc-8cc5-6a22d29dda55.jpg";
import heroBg5 from "../../assets/image/738930a2-6664-4f6a-9b37-96ceecc6a140.jpg";

const HERO_BACKGROUNDS = [heroBg1, heroBg2, heroBg3, heroBg4, heroBg5];
import productImg from "../../assets/image/product-batako.webp"; // GANTI → import productImg from '../../assets/image/product-batako.jpg'

import logoHalim from "../../assets/Logo Portofolio/Halim.jpg";
import logoSumBekasi from "../../assets/Logo Portofolio/Summarecon_Bekasi.svg";
import logoCrownGading from "../../assets/Logo Portofolio/crown-gading-logo-circle.png";
import logoNusantara from "../../assets/Logo Portofolio/Nusantara.jpeg";
import logoPanjibuwono from "../../assets/Logo Portofolio/02d2c2e969cb4c.png";

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
    project: "Proyek Infrastruktur",
    icon: <img src={logoHalim} alt="Halim Perdana Kusuma" style={{ height: "48px", width: "auto", objectFit: "contain" }} />,
  },
  {
    name: "Summarecon Bekasi",
    project: "Proyek Property Berskala Besar",
    icon: <img src={logoSumBekasi} alt="Summarecon Bekasi" style={{ height: "48px", width: "auto", objectFit: "contain" }} />,
  },
  {
    name: "Summarecon Crown Gading",
    project: "Proyek Property Premium",
    icon: <img src={logoCrownGading} alt="Summarecon Crown Gading" style={{ height: "48px", width: "auto", objectFit: "contain" }} />,
  },
  { name: "Nusantara", project: "Proyek Property", icon: <img src={logoNusantara} alt="Nusantara" style={{ height: "48px", width: "auto", objectFit: "contain" }} /> },
  { name: "Panjibuwono", project: "Proyek Pembangunan", icon: <img src={logoPanjibuwono} alt="Panjibuwono" style={{ height: "48px", width: "auto", objectFit: "contain" }} /> },
];

export default function Portfolio() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % HERO_BACKGROUNDS.length);
    }, 5000); // Ganti gambar setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        minHeight: "100vh",
      }}
    >
      {/* ===== NAVBAR ===== */}
      <nav className="portfolio-navbar">
        <div className="portfolio-navbar-inner">
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={logoImg}
              alt="MAJU JAYA BATAKO Logo"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
            <span style={{ fontWeight: "700", fontSize: "18px" }}>
              MAJU JAYA BATAKO
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="portfolio-nav-links">
            <a
              href="#"
              style={{
                color: "var(--color-orange)",
                fontWeight: "600",
                textDecoration: "none",
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
              }}
            >
              {theme === "dark" ? (
                <Sun size={18} color="var(--color-orange)" />
              ) : (
                <Moon size={18} color="var(--color-text-muted)" />
              )}
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="portfolio-mobile-toggle">
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
              }}
            >
              {theme === "dark" ? (
                <Sun size={18} color="var(--color-orange)" />
              ) : (
                <Moon size={18} color="var(--color-text-muted)" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mobileMenuOpen ? (
                <X size={20} color="var(--color-text)" />
              ) : (
                <Menu size={20} color="var(--color-text)" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="portfolio-mobile-menu">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: "var(--color-orange)",
                fontWeight: "600",
                textDecoration: "none",
                padding: "12px 24px",
                display: "block",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              Portfolio
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/pesan");
              }}
              style={{
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "15px",
                padding: "12px 24px",
                display: "block",
                width: "100%",
                textAlign: "left",
              }}
            >
              Pemesanan Online
            </button>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="portfolio-hero">
        {/* Background Image Carousel */}
        {HERO_BACKGROUNDS.map((bg, index) => (
          <div
            key={index}
            className="portfolio-hero-bg"
            style={{
              backgroundImage: `url('${bg}')`,
              opacity: currentBgIndex === index ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
            }}
          />
        ))}
        {/* Overlay untuk readability — lebih kuat agar teks jelas */}
        <div
          className="portfolio-hero-overlay"
          style={{
            backgroundColor:
              theme === "dark"
                ? "rgba(0, 0, 0, 0.6)"
                : "rgba(255, 255, 255, 0.6)",
          }}
        />
        <div className="portfolio-hero-content">
          <div className="portfolio-hero-grid">
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
                  letterSpacing: "0.3px",
                }}
              >
                Produsen Batako Press Terpercaya
              </div>
              <h1 className="portfolio-hero-title">
                Maju Jaya
                <br />
                <span style={{ color: "var(--color-orange)" }}>Batako</span>
              </h1>
              <p className="portfolio-hero-desc" style={{ color: theme === "dark" ? "#ffffff" : "#000000", fontWeight: "500" }}>
                {COMPANY_INFO.description}
              </p>
              <div className="portfolio-hero-buttons">
                <button
                  onClick={() => navigate("/daftar")}
                  className="portfolio-btn-primary"
                >
                  Daftar <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/pesan")}
                  className="portfolio-btn-outline"
                >
                  Pesan Sekarang
                </button>
              </div>
            </div>

            {/* Product Card */}
            <div className="portfolio-product-card">
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
                  overflow: "hidden",
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
      <section className="portfolio-section">
        <div className="portfolio-container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 className="portfolio-section-title">
              Kemitraan &{" "}
              <span style={{ color: "var(--color-orange)" }}>Proyek</span>
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "16px" }}>
              Dipercaya oleh berbagai pengembang properti dan proyek
              infrastruktur
            </p>
          </div>
          <div className="portfolio-partners-grid">
            {PARTNERS.map((partner) => (
              <div
                key={partner.name}
                className="portfolio-partner-card"
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
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px", minHeight: "60px" }}>
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
        className="portfolio-section"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
        }}
      >
        <div className="portfolio-container">
          <h2
            className="portfolio-section-title"
            style={{ textAlign: "center" }}
          >
            Lokasi &{" "}
            <span style={{ color: "var(--color-orange)" }}>Kontak</span>
          </h2>
          <div className="portfolio-contact-grid">
            <ContactCard
              icon={<MapPin size={24} color="var(--color-orange)" />}
              title="Alamat"
              value={COMPANY_INFO.location}
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
