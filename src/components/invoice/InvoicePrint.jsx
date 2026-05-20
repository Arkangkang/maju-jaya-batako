// components/invoice/InvoicePrint.jsx

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n || 0);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

export default function InvoicePrint({ invoice, deliveries = [] }) {
  if (!invoice) return null;

  const totalPcs = deliveries.reduce((s, d) => s + d.rit_count * 1500, 0);
  const totalPecah = deliveries.reduce((s, d) => s + d.broken_count, 0);
  const netPcs = totalPcs - totalPecah;

  // Use invoice-level values when available, fallback to computed
  const displayTotalPcs = invoice.total_pcs ?? totalPcs;
  const displayTotalPecah = invoice.total_broken ?? totalPecah;
  const displayNetPcs = invoice.net_pcs ?? netPcs;
  const displayPrice = invoice.price_per_pcs ?? 0;
  const displayTotal = invoice.total_amount ?? displayNetPcs * displayPrice;

  /* ─── Colour palette (print-safe, no CSS vars) ─── */
  const NAVY = "#1a2744";
  const ORANGE = "#f26522";
  const LIGHT = "#fdf6f2";
  const MUTED = "#6b7280";
  const BORDER = "#e5e7eb";
  const WHITE = "#ffffff";
  const STRIPE = "#f9fafb";

  return (
    <>
      {/* Print-only stylesheet */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body { margin: 0; }
        }
      `}</style>

      <div
        style={{
          fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
          width: "210mm",
          minHeight: "297mm",
          backgroundColor: WHITE,
          color: NAVY,
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* ── TOP ACCENT STRIP ── */}
        <div
          style={{
            height: "6px",
            background: `linear-gradient(90deg, ${NAVY} 0%, ${ORANGE} 100%)`,
          }}
        />

        {/* ── HEADER ── */}
        <div
          style={{
            backgroundColor: NAVY,
            padding: "28px 36px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Company */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: ORANGE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "14px",
                  color: WHITE,
                  letterSpacing: "-0.5px",
                }}
              >
                MJB
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "800",
                    fontSize: "15px",
                    color: WHITE,
                    letterSpacing: "0.5px",
                  }}
                >
                  Maju Jaya Batako
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.55)",
                    marginTop: "1px",
                  }}
                >
                  Industri Batako &amp; Material Bangunan
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Badge */}
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "800",
                color: WHITE,
                letterSpacing: "-1px",
                lineHeight: 1,
              }}
            >
              INVOICE
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "12px",
                color: ORANGE,
                fontWeight: "700",
                letterSpacing: "1px",
              }}
            >
              {invoice.invoice_number}
            </p>
          </div>
        </div>

        {/* ── META ROW (date, status, zone) ── */}
        <div
          style={{
            backgroundColor: LIGHT,
            borderBottom: `1px solid ${BORDER}`,
            padding: "14px 36px",
            display: "flex",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {[
            ["Tanggal Invoice", fmtDate(invoice.invoice_date)],
            ["Zona Pengiriman", `Zona ${invoice.zone ?? "-"}`],
            [
              "Metode Order",
              invoice.order_method === "whatsapp"
                ? "WhatsApp"
                : invoice.order_method === "online"
                  ? "Online"
                  : "Langsung",
            ],
            ["Status", invoice.status === "paid" ? "LUNAS ✓" : "BELUM LUNAS"],
          ].map(([label, value]) => (
            <div key={label}>
              <p
                style={{
                  margin: 0,
                  fontSize: "9px",
                  color: MUTED,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "12px",
                  fontWeight: "700",
                  color:
                    label === "Status"
                      ? invoice.status === "paid"
                        ? "#16a34a"
                        : ORANGE
                      : NAVY,
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── BILLING TO ── */}
        <div style={{ padding: "20px 36px 0", display: "flex", gap: "36px" }}>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "9px",
                fontWeight: "700",
                color: ORANGE,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
              }}
            >
              Kepada
            </p>
            <p
              style={{
                margin: "0 0 2px",
                fontWeight: "800",
                fontSize: "15px",
                color: NAVY,
              }}
            >
              {invoice.customer_name}
            </p>
            {invoice.customer_address && (
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: "11px",
                  color: MUTED,
                  lineHeight: 1.4,
                }}
              >
                {invoice.customer_address}
              </p>
            )}
            {invoice.customer_whatsapp && (
              <p style={{ margin: "0", fontSize: "11px", color: MUTED }}>
                WA: {invoice.customer_whatsapp}
              </p>
            )}
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ padding: "16px 36px 14px" }}>
          <div style={{ height: "1.5px", backgroundColor: BORDER }} />
        </div>

        {/* ── DELIVERY TABLE ── */}
        <div style={{ padding: "0 36px" }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "9px",
              fontWeight: "700",
              color: ORANGE,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
            }}
          >
            Rincian Pengiriman
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "11px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: NAVY }}>
                {[
                  "No",
                  "Tgl Kirim",
                  "Barang",
                  "Srt Jalan",
                  "Kendaraan",
                  "Jml Pcs/RIT",
                  "Pecah",
                  "Net Pcs",
                  "Harga",
                  "Subtotal",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 8px",
                      color: WHITE,
                      fontWeight: "700",
                      fontSize: "9px",
                      textAlign: h === "No" ? "center" : "left",
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d, i) => {
                const pcs = d.rit_count * 1500;
                const net = pcs - d.broken_count;
                const sub = net * displayPrice;
                const isEven = i % 2 === 0;
                return (
                  <tr
                    key={d.id}
                    style={{ backgroundColor: isEven ? WHITE : STRIPE }}
                  >
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        color: MUTED,
                        fontWeight: "600",
                        fontSize: "10px",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td style={{ padding: "8px", whiteSpace: "nowrap" }}>
                      {fmtDate(d.delivery_date)}
                    </td>
                    <td style={{ padding: "8px", fontWeight: "600" }}>
                      {d.item_type}
                    </td>
                    <td style={{ padding: "8px", color: MUTED }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td style={{ padding: "8px", whiteSpace: "nowrap" }}>
                      {d.vehicles?.brand} {d.vehicles?.plate_number}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: "600",
                      }}
                    >
                      {pcs.toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "right",
                        color: "#ef4444",
                        fontWeight: "600",
                      }}
                    >
                      {d.broken_count > 0 ? (
                        d.broken_count.toLocaleString("id-ID")
                      ) : (
                        <span style={{ color: MUTED }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: "700",
                        color: "#16a34a",
                      }}
                    >
                      {net.toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "right",
                        color: MUTED,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmt(displayPrice)}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmt(sub)}
                    </td>
                  </tr>
                );
              })}

              {/* TOTAL ROW */}
              <tr style={{ backgroundColor: NAVY }}>
                <td
                  colSpan={5}
                  style={{
                    padding: "10px 8px",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "10px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    padding: "10px 8px",
                    textAlign: "right",
                    fontWeight: "800",
                    color: WHITE,
                    fontSize: "12px",
                  }}
                >
                  {displayTotalPcs.toLocaleString("id-ID")}
                </td>
                <td
                  style={{
                    padding: "10px 8px",
                    textAlign: "right",
                    fontWeight: "800",
                    color: "#fca5a5",
                    fontSize: "12px",
                  }}
                >
                  {displayTotalPecah.toLocaleString("id-ID")}
                </td>
                <td
                  style={{
                    padding: "10px 8px",
                    textAlign: "right",
                    fontWeight: "800",
                    color: "#86efac",
                    fontSize: "12px",
                  }}
                >
                  {displayNetPcs.toLocaleString("id-ID")}
                </td>
                <td style={{ padding: "10px 8px" }} />
                <td
                  style={{
                    padding: "10px 8px",
                    textAlign: "right",
                    fontWeight: "800",
                    color: ORANGE,
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(displayTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── BOTTOM SECTION ── */}
        <div
          style={{
            padding: "20px 36px",
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "8px",
          }}
        >
          {/* Payment Info */}
          <div
            style={{
              flex: 1,
              minWidth: "200px",
              border: `1.5px solid ${BORDER}`,
              borderRadius: "10px",
              padding: "16px",
              borderLeft: `4px solid ${ORANGE}`,
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "9px",
                fontWeight: "700",
                color: ORANGE,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
              }}
            >
              Pembayaran ke
            </p>
            {[
              ["Bank", "BCA"],
              ["No. Rekening", "52111209535"],
              ["A/N", "Billioner Silaban"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "6px",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{ fontSize: "10px", color: MUTED, minWidth: "80px" }}
                >
                  {label}
                </span>
                <span
                  style={{ fontSize: "11px", fontWeight: "700", color: NAVY }}
                >
                  : {value}
                </span>
              </div>
            ))}
          </div>

          {/* Grand Total Box */}
          <div
            style={{
              background: `linear-gradient(135deg, ${NAVY} 0%, #2d3f6f 100%)`,
              borderRadius: "10px",
              padding: "16px 20px",
              minWidth: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: "9px",
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
              }}
            >
              Jumlah Tagihan
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "800",
                color: ORANGE,
                lineHeight: 1.1,
              }}
            >
              {fmt(displayTotal)}
            </p>
            <div
              style={{
                marginTop: "10px",
                paddingTop: "10px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                gap: "16px",
              }}
            >
              {[
                ["Total Pcs", displayTotalPcs],
                ["Pecah", displayTotalPecah],
                ["Net Pcs", displayNetPcs],
              ].map(([l, v]) => (
                <div key={l}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "8px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {l}
                  </p>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontSize: "10px",
                      fontWeight: "700",
                      color: WHITE,
                    }}
                  >
                    {(v || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── NOTES ── */}
        {invoice.notes && (
          <div style={{ padding: "0 36px 16px" }}>
            <div
              style={{
                backgroundColor: STRIPE,
                borderRadius: "8px",
                padding: "12px 14px",
                border: `1px solid ${BORDER}`,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "9px",
                  fontWeight: "700",
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Catatan
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: NAVY,
                  lineHeight: 1.5,
                }}
              >
                {invoice.notes}
              </p>
            </div>
          </div>
        )}

        {/* ── SIGNATURE ROW ── */}
        <div
          style={{
            padding: "0 36px 24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ textAlign: "center", minWidth: "140px" }}>
            <p style={{ margin: "0 0 48px", fontSize: "10px", color: MUTED }}>
              Hormat kami,
            </p>
            <div
              style={{ borderTop: `1.5px solid ${NAVY}`, paddingTop: "6px" }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: "700",
                  color: NAVY,
                }}
              >
                Maju Jaya Batako
              </p>
            </div>
          </div>
        </div>

        {/* ── FOOTER STRIP ── */}
        <div
          style={{
            backgroundColor: NAVY,
            padding: "10px 36px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "9px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Dokumen ini dibuat secara otomatis oleh sistem
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "9px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {invoice.invoice_number} · {fmtDate(invoice.invoice_date)}
          </p>
        </div>
            
        <div
          style={{
            height: "4px",
            background: `linear-gradient(90deg, ${ORANGE} 0%, ${NAVY} 100%)`,
          }}
        />
      </div>
    </>
  );
}
