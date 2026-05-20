import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";
import InvoicePrint from "../../components/invoice/InvoicePrint";
import {
  Search,
  Printer,
  Edit2,
  CheckCircle,
  Trash2,
  X,
  Save,
} from "lucide-react";

export default function InvoiceData() {
  const [invoices, setInvoices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState("unpaid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [filterZone, setFilterZone] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [zonePrices, setZonePrices] = useState([]);

  // Edit invoice state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const printRef = useRef();

  useEffect(() => {
    fetchInvoices();
    fetchZonePrices();
  }, []);

  useEffect(() => {
    let result = invoices.filter(
      (inv) => inv.status === (tab === "unpaid" ? "unpaid" : "paid"),
    );
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoice_number?.toLowerCase().includes(q) ||
          inv.customer_name?.toLowerCase().includes(q),
      );
    }
    if (filterZone)
      result = result.filter((inv) => inv.zone === parseInt(filterZone));
    if (sortBy === "date_desc")
      result.sort(
        (a, b) => new Date(b.invoice_date) - new Date(a.invoice_date),
      );
    else if (sortBy === "date_asc")
      result.sort(
        (a, b) => new Date(a.invoice_date) - new Date(b.invoice_date),
      );
    else if (sortBy === "amount_desc")
      result.sort((a, b) => b.total_amount - a.total_amount);
    else if (sortBy === "amount_asc")
      result.sort((a, b) => a.total_amount - b.total_amount);
    setFiltered(result);
  }, [invoices, tab, search, sortBy, filterZone]);

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoice_summary")
      .select("*")
      .order("created_at", { ascending: false });
    setInvoices(data || []);
  };

  const fetchZonePrices = async () => {
    const { data } = await supabase
      .from("zone_prices")
      .select("*")
      .order("zone");
    setZonePrices(data || []);
  };

  const handleViewDetail = async (inv) => {
    setSelectedInvoice(inv);
    const { data } = await supabase
      .from("invoice_deliveries")
      .select("*, vehicles(plate_number, brand)")
      .eq("invoice_id", inv.id);
    setDeliveries(data || []);
    setShowDetail(true);
  };

  const handleToggleStatus = async (inv) => {
    const newStatus = inv.status === "unpaid" ? "paid" : "unpaid";
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", inv.id);
    if (!error) {
      toast.success(
        `Status diubah ke ${newStatus === "paid" ? "Lunas" : "Belum Lunas"}`,
      );
      fetchInvoices();
      if (selectedInvoice?.id === inv.id) {
        setSelectedInvoice({ ...selectedInvoice, status: newStatus });
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus invoice ini?")) return;
    await supabase.from("invoices").delete().eq("id", id);
    toast.success("Invoice dihapus");
    fetchInvoices();
    setShowDetail(false);
  };

  // ── EDIT INVOICE ──
  const handleOpenEdit = (inv) => {
    setEditForm({
      invoice_date: inv.invoice_date,
      order_method: inv.order_method || "direct",
      status: inv.status,
      notes: inv.notes || "",
      zone: inv.zone,
      price_per_pcs: inv.price_per_pcs,
      net_pcs: inv.net_pcs,
    });
    setShowEditModal(true);
  };

  const handleEditZoneChange = (zone) => {
    const price = zonePrices.find((z) => z.zone === parseInt(zone));
    setEditForm((prev) => ({
      ...prev,
      zone: parseInt(zone),
      price_per_pcs: price?.price_per_pcs || prev.price_per_pcs,
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedInvoice) return;
    setEditLoading(true);
    const newTotal = (editForm.net_pcs || 0) * (editForm.price_per_pcs || 0);
    const { error } = await supabase
      .from("invoices")
      .update({
        invoice_date: editForm.invoice_date,
        order_method: editForm.order_method,
        status: editForm.status,
        notes: editForm.notes,
        zone: editForm.zone,
        price_per_pcs: editForm.price_per_pcs,
        total_amount: newTotal,
      })
      .eq("id", selectedInvoice.id);

    setEditLoading(false);
    if (!error) {
      toast.success("Invoice berhasil diperbarui!");
      setShowEditModal(false);
      fetchInvoices();
      // Update selectedInvoice local state
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              invoice_date: editForm.invoice_date,
              order_method: editForm.order_method,
              status: editForm.status,
              notes: editForm.notes,
              zone: editForm.zone,
              price_per_pcs: editForm.price_per_pcs,
              total_amount: newTotal,
            }
          : null,
      );
    } else {
      toast.error("Gagal memperbarui: " + error.message);
    }
  };
  // ─────────────────

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${selectedInvoice?.invoice_number ?? "print"}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 0; }
      @media print {
        body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  const fmt = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const colStyle = {
    padding: "12px",
    borderBottom: "1px solid var(--color-border)",
    fontSize: "14px",
  };
  const headStyle = {
    padding: "10px 12px",
    borderBottom: "1px solid var(--color-border)",
    color: "var(--color-text-muted)",
    fontWeight: "600",
    fontSize: "12px",
    whiteSpace: "nowrap",
  };
  const fieldStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid var(--color-border)",
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text)",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div>
      <h2
        style={{
          fontSize: "22px",
          fontWeight: "800",
          marginBottom: "24px",
          color: "var(--color-text)",
        }}
      >
        Data Invoice
      </h2>

      {/* Tab */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "20px",
          backgroundColor: "var(--color-bg-secondary)",
          borderRadius: "10px",
          padding: "4px",
          width: "fit-content",
        }}
      >
        {[
          ["unpaid", "Belum Lunas"],
          ["paid", "Sudah Lunas"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              backgroundColor:
                tab === val ? "var(--color-orange)" : "transparent",
              color: tab === val ? "white" : "var(--color-text-muted)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filter & Search */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          />
          <input
            placeholder="Cari nama / nomor invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: "8px",
              border: "1.5px solid var(--color-border)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1.5px solid var(--color-border)",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text)",
            fontSize: "14px",
          }}
        >
          <option value="date_desc">Terbaru</option>
          <option value="date_asc">Terlama</option>
          <option value="amount_desc">Tagihan Terbesar</option>
          <option value="amount_asc">Tagihan Terkecil</option>
        </select>
        <select
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1.5px solid var(--color-border)",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text)",
            fontSize: "14px",
          }}
        >
          <option value="">Semua Zona</option>
          {[1, 2, 3, 4].map((z) => (
            <option key={z} value={z}>
              Zona {z}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 2px 8px var(--color-shadow)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "var(--color-bg-secondary)" }}>
              <tr>
                {[
                  "No Invoice",
                  "Pelanggan",
                  "WA",
                  "Tanggal",
                  "Total",
                  "Status",
                  "Aksi",
                ].map((h) => (
                  <th key={h} style={headStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--color-bg-secondary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={colStyle} onClick={() => handleViewDetail(inv)}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: "600",
                          color: "var(--color-orange)",
                        }}
                      >
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td style={colStyle} onClick={() => handleViewDetail(inv)}>
                      {inv.customer_name}
                    </td>
                    <td
                      style={{ ...colStyle, color: "var(--color-text-muted)" }}
                      onClick={() => handleViewDetail(inv)}
                    >
                      {inv.customer_whatsapp}
                    </td>
                    <td
                      style={{ ...colStyle, color: "var(--color-text-muted)" }}
                      onClick={() => handleViewDetail(inv)}
                    >
                      {new Date(inv.invoice_date).toLocaleDateString("id-ID")}
                    </td>
                    <td
                      style={{ ...colStyle, fontWeight: "600" }}
                      onClick={() => handleViewDetail(inv)}
                    >
                      {fmt(inv.total_amount)}
                    </td>
                    <td style={colStyle}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            inv.status === "paid" ? "#dcfce7" : "#fff7ed",
                          color: inv.status === "paid" ? "#16a34a" : "#f97316",
                        }}
                      >
                        {inv.status === "paid" ? "Lunas" : "Belum Lunas"}
                      </span>
                    </td>
                    <td style={colStyle}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            handleOpenEdit(inv);
                          }}
                          title="Edit Invoice"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#3b82f6",
                            padding: "4px",
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(inv)}
                          title="Ubah Status"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--color-orange)",
                            padding: "4px",
                          }}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          title="Hapus"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            padding: "4px",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedInvoice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-card)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontWeight: "700", fontSize: "18px" }}>
                Detail Invoice: {selectedInvoice.invoice_number}
              </h3>
              <button
                onClick={() => setShowDetail(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Info Pelanggan */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                {[
                  ["Pelanggan", selectedInvoice.customer_name],
                  ["WhatsApp", selectedInvoice.customer_whatsapp],
                  ["Alamat", selectedInvoice.customer_address],
                  ["Metode", selectedInvoice.order_method],
                  [
                    "Tanggal",
                    new Date(selectedInvoice.invoice_date).toLocaleDateString(
                      "id-ID",
                    ),
                  ],
                  ["Zona", `Zona ${selectedInvoice.zone}`],
                  ["Harga/Pcs", fmt(selectedInvoice.price_per_pcs)],
                  [
                    "Status",
                    selectedInvoice.status === "paid" ? "Lunas" : "Belum Lunas",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      backgroundColor: "var(--color-bg-secondary)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontWeight: "600",
                        fontSize: "14px",
                        marginTop: "2px",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Baris Pengiriman */}
              <h4 style={{ fontWeight: "700", marginBottom: "12px" }}>
                Baris Pengiriman
              </h4>
              <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr
                      style={{ backgroundColor: "var(--color-bg-secondary)" }}
                    >
                      {[
                        "Tgl Kirim",
                        "Barang",
                        "Kendaraan",
                        "Rit",
                        "Total Pcs",
                        "Pecah",
                        "Net Pcs",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 10px",
                            textAlign: "left",
                            borderBottom: "1px solid var(--color-border)",
                            fontWeight: "600",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d) => (
                      <tr key={d.id}>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid var(--color-border)",
                          }}
                        >
                          {new Date(d.delivery_date).toLocaleDateString(
                            "id-ID",
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid var(--color-border)",
                          }}
                        >
                          {d.item_type}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid var(--color-border)",
                          }}
                        >
                          {d.vehicles?.brand} {d.vehicles?.plate_number}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid var(--color-border)",
                            fontWeight: "600",
                          }}
                        >
                          {d.rit_count}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid var(--color-border)",
                          }}
                        >
                          {(d.rit_count * 1500).toLocaleString("id-ID")}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid var(--color-border)",
                            color: "#ef4444",
                          }}
                        >
                          {d.broken_count}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid var(--color-border)",
                            fontWeight: "600",
                            color: "#22c55e",
                          }}
                        >
                          {(d.rit_count * 1500 - d.broken_count).toLocaleString(
                            "id-ID",
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div
                style={{
                  backgroundColor: "var(--color-orange-light)",
                  border: "1px solid var(--color-orange)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {[
                    [
                      "Total Pcs",
                      `${selectedInvoice.total_pcs?.toLocaleString("id-ID")} pcs`,
                    ],
                    [
                      "Pecah",
                      `${selectedInvoice.total_broken?.toLocaleString("id-ID")} pcs`,
                    ],
                    [
                      "Net Pcs",
                      `${selectedInvoice.net_pcs?.toLocaleString("id-ID")} pcs`,
                    ],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {l}
                      </p>
                      <p style={{ fontWeight: "700" }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    TOTAL TAGIHAN
                  </p>
                  <p
                    style={{
                      fontWeight: "800",
                      fontSize: "22px",
                      color: "var(--color-orange)",
                    }}
                  >
                    {fmt(selectedInvoice.total_amount)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleOpenEdit(selectedInvoice)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Edit2 size={16} /> Edit Invoice
                </button>
                <button
                  onClick={() => handleToggleStatus(selectedInvoice)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor:
                      selectedInvoice.status === "unpaid"
                        ? "#22c55e"
                        : "#f97316",
                    color: "white",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {selectedInvoice.status === "unpaid"
                    ? "Tandai Lunas"
                    : "Tandai Belum Lunas"}
                </button>
                <button
                  onClick={handlePrint}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-orange)",
                    color: "white",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Printer size={16} /> Cetak PDF
                </button>
                <button
                  onClick={() => handleDelete(selectedInvoice.id)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#fee2e2",
                    color: "#ef4444",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Hapus Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Hidden print area — v3 requires element in DOM, hidden via height:0 */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "210mm",
              overflow: "hidden",
              height: 0,
              zIndex: -1,
            }}
          >
            <div ref={printRef}>
              <InvoicePrint invoice={selectedInvoice} deliveries={deliveries} />
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT INVOICE MODAL ── */}
      {showEditModal && selectedInvoice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-card)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ fontWeight: "700", fontSize: "18px" }}>
                  Edit Invoice
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-muted)",
                    marginTop: "2px",
                    fontFamily: "monospace",
                  }}
                >
                  {selectedInvoice.invoice_number}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Tanggal Invoice */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  Tanggal Invoice
                </label>
                <input
                  type="date"
                  value={editForm.invoice_date}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      invoice_date: e.target.value,
                    }))
                  }
                  style={fieldStyle}
                />
              </div>

              {/* Opsi Pemesanan */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  Opsi Pemesanan
                </label>
                <select
                  value={editForm.order_method}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      order_method: e.target.value,
                    }))
                  }
                  style={fieldStyle}
                >
                  <option value="direct">Langsung</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  Status Pembayaran
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  style={fieldStyle}
                >
                  <option value="unpaid">Belum Lunas</option>
                  <option value="paid">Lunas</option>
                </select>
              </div>

              {/* Zona */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  Zona Pengiriman
                </label>
                <select
                  value={editForm.zone}
                  onChange={(e) => handleEditZoneChange(e.target.value)}
                  style={fieldStyle}
                >
                  {zonePrices.map((z) => (
                    <option key={z.zone} value={z.zone}>
                      Zona {z.zone} — {z.label} — Rp{" "}
                      {z.price_per_pcs?.toLocaleString("id-ID")}/pcs
                    </option>
                  ))}
                </select>
              </div>

              {/* Harga per Pcs */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  Harga per Pcs (Rp)
                </label>
                <input
                  type="number"
                  value={editForm.price_per_pcs}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      price_per_pcs: parseFloat(e.target.value) || 0,
                    }))
                  }
                  style={fieldStyle}
                />
              </div>

              {/* Catatan */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  Catatan
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Catatan tambahan..."
                  style={{ ...fieldStyle, resize: "vertical" }}
                />
              </div>

              {/* Preview Total Baru */}
              <div
                style={{
                  backgroundColor: "var(--color-orange-light)",
                  border: "1px solid var(--color-orange)",
                  borderRadius: "10px",
                  padding: "14px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Preview Total Tagihan Baru
                </p>
                <p
                  style={{
                    fontWeight: "800",
                    fontSize: "20px",
                    color: "var(--color-orange)",
                  }}
                >
                  {fmt((editForm.net_pcs || 0) * (editForm.price_per_pcs || 0))}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    marginTop: "4px",
                  }}
                >
                  {(editForm.net_pcs || 0).toLocaleString("id-ID")} pcs × Rp{" "}
                  {(editForm.price_per_pcs || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div
              style={{ padding: "0 24px 24px", display: "flex", gap: "10px" }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: "transparent",
                  color: "var(--color-text)",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-orange)",
                  color: "white",
                  fontWeight: "700",
                  border: "none",
                  cursor: editLoading ? "not-allowed" : "pointer",
                  opacity: editLoading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Save size={16} />
                {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
