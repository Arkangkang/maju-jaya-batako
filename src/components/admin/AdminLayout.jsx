import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  Truck,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
} from "lucide-react";

const MENU_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/buat-invoice", label: "Buat Invoice", icon: FilePlus },
  { path: "/admin/data-invoice", label: "Data Invoice", icon: FileText },
  { path: "/admin/data-pelanggan", label: "Data Pelanggan", icon: Users },
  { path: "/admin/data-kendaraan", label: "Data Kendaraan", icon: Truck },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logoutAdmin } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotif, setShowNotif] = useState(false);
  const [notifInvoices, setNotifInvoices] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchUnpaidCount();
  }, []);

  useEffect(() => {
    // Subscribe to real-time changes in invoices table
    const invoicesChannel = supabase
      .channel("invoices-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "invoices" },
        (payload) => {
          // Ketika ada invoice baru (dengan status unpaid), tambah count
          if (payload.new.status === "unpaid") {
            setUnpaidCount((prev) => prev + 1);
          }
          if (showNotif) fetchNotifInvoices();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "invoices" },
        (payload) => {
          // Ketika status berubah dari unpaid ke paid, kurangi count
          if (
            payload.old.status === "unpaid" &&
            payload.new.status === "paid"
          ) {
            setUnpaidCount((prev) => Math.max(0, prev - 1));
          }
          // Ketika status berubah dari paid ke unpaid, tambah count
          if (
            payload.old.status === "paid" &&
            payload.new.status === "unpaid"
          ) {
            setUnpaidCount((prev) => prev + 1);
          }
          if (showNotif) fetchNotifInvoices();
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "invoices" },
        (payload) => {
          // Ketika invoice dihapus dan sebelumnya unpaid, kurangi count
          if (payload.old.status === "unpaid") {
            setUnpaidCount((prev) => Math.max(0, prev - 1));
          }
          if (showNotif) fetchNotifInvoices();
        },
      )
      .subscribe();

    return () => {
      invoicesChannel.unsubscribe();
    };
  }, [showNotif]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnpaidCount = async () => {
    const { count } = await supabase
      .from("invoices")
      .select("id", { count: "exact" })
      .eq("status", "unpaid");
    setUnpaidCount(count || 0);
  };

  const fetchNotifInvoices = async () => {
    const { data } = await supabase
      .from("invoice_summary")
      .select("*")
      .eq("status", "unpaid")
      .order("created_at", { ascending: false })
      .limit(5);
    setNotifInvoices(data || []);
  };

  const handleBellClick = () => {
    if (!showNotif) fetchNotifInvoices();
    setShowNotif((prev) => !prev);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  const sidebarVisible = isMobile ? sidebarOpen : true;

  const fmt = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          backgroundColor: "var(--color-card)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
          transform: sidebarVisible ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "var(--color-orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "800",
              }}
            >
              M
            </div>
            <div>
              <p style={{ fontWeight: "700", fontSize: "13px" }}>MAJU JAYA</p>
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                BATAKO
              </p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  marginBottom: "4px",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: active ? "700" : "500",
                  backgroundColor: active
                    ? "var(--color-orange)"
                    : "transparent",
                  color: active ? "white" : "var(--color-text)",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Ke Beranda & Logout */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "11px 14px",
              borderRadius: "10px",
              border: "1.5px solid var(--color-orange)",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
              backgroundColor: "var(--color-orange-light)",
              color: "var(--color-orange)",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            <Home size={18} />
            Ke Beranda
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "11px 14px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
              backgroundColor: "transparent",
              color: "var(--color-text-muted)",
              fontWeight: "500",
            }}
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 39,
          }}
        />
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            height: "60px",
            backgroundColor: "var(--color-card)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {sidebarOpen && isMobile ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1
              style={{
                fontSize: "15px",
                fontWeight: "700",
                whiteSpace: "nowrap",
              }}
            >
              {MENU_ITEMS.find((m) => m.path === location.pathname)?.label ||
                "Admin"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Notifikasi Bell */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                onClick={handleBellClick}
                style={{
                  position: "relative",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text)",
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                  borderRadius: "8px",
                  backgroundColor: showNotif
                    ? "var(--color-bg-secondary)"
                    : "transparent",
                }}
              >
                <Bell size={20} />
                {unpaidCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-orange)",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unpaidCount > 99 ? "99+" : unpaidCount}
                  </span>
                )}
              </button>

              {/* Dropdown Notifikasi */}
              {showNotif && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "44px",
                    width: isMobile ? "290px" : "320px",
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "14px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                    zIndex: 50,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--color-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: "700", fontSize: "14px" }}>
                        Notifikasi
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {unpaidCount} invoice belum lunas
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        backgroundColor: "var(--color-orange-light)",
                        color: "var(--color-orange)",
                      }}
                    >
                      {unpaidCount} Pending
                    </span>
                  </div>
                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {notifInvoices.length === 0 ? (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "var(--color-text-muted)",
                          fontSize: "13px",
                        }}
                      >
                        Tidak ada invoice pending
                      </div>
                    ) : (
                      <>
                        {notifInvoices.slice(0, 1).map((inv) => (
                          <div
                            key={inv.id}
                            onClick={() => {
                              navigate("/admin/data-invoice");
                              setShowNotif(false);
                            }}
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid var(--color-border)",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <div>
                              <p
                                style={{
                                  fontWeight: "600",
                                  fontSize: "13px",
                                  fontFamily: "monospace",
                                  color: "var(--color-orange)",
                                }}
                              >
                                {inv.invoice_number}
                              </p>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "var(--color-text-muted)",
                                  marginTop: "2px",
                                }}
                              >
                                {inv.customer_name}
                              </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p
                                style={{ fontWeight: "700", fontSize: "13px" }}
                              >
                                {fmt(inv.total_amount)}
                              </p>
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: "var(--color-text-muted)",
                                  marginTop: "2px",
                                }}
                              >
                                {new Date(inv.invoice_date).toLocaleDateString(
                                  "id-ID",
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                        {notifInvoices.length > 1 && (
                          <div
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              color: "var(--color-text-muted)",
                              fontSize: "12px",
                              borderBottom: "1px solid var(--color-border)",
                            }}
                          >
                            dan {notifInvoices.length - 1} invoice lainnya
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      padding: "10px 16px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <button
                      onClick={() => {
                        navigate("/admin/data-invoice");
                        setShowNotif(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "var(--color-orange)",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      Lihat Semua Invoice <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleTheme}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text)",
                display: "flex",
                alignItems: "center",
                padding: "8px",
              }}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profil */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor: "var(--color-bg-secondary)",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                {admin?.name?.[0]?.toUpperCase() || "A"}
              </div>
              {!isMobile && (
                <div>
                  <p style={{ fontWeight: "600", fontSize: "13px" }}>
                    {admin?.name}
                  </p>
                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "11px",
                    }}
                  >
                    ID: {admin?.admin_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? "16px" : "24px",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
