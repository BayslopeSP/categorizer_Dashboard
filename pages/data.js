import { useEffect, useState } from "react";
import Link from "next/link";

export default function DataPage() {
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [search, setSearch] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((resData) => {
        setRows(resData.data || []);
        setMapping(resData.mapping || {});
      })
      .catch(err => console.error("Error loading json:", err));
  }, []);

  if (!rows || rows.length === 0) {
    return (
      <div style={{ padding: 40, color: "#fff", background: "#070C1A", height: "100vh", textAlign: "center" }}>
        <div style={{ fontSize: 20, marginBottom: 10 }}>Loading Patent Data...</div>
        
      </div>
    );
  }

  const allColumns = Object.keys(rows[0]).filter(c => !c.toLowerCase().includes("unnamed"));
  
  // Group columns by category
  const groupedCols = [];
  let currentGroup = { name: null, cols: [] };

  allColumns.forEach(col => {
    const cat = mapping[col];
    if (cat !== currentGroup.name) {
      if (currentGroup.cols.length > 0) groupedCols.push(currentGroup);
      currentGroup = { name: cat, cols: [col] };
    } else {
      currentGroup.cols.push(col);
    }
  });
  groupedCols.push(currentGroup);

  const filteredRows = rows.filter(r => 
    Object.values(r).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
  );

  const getCatColor = (cat) => {
    if (!cat) return "transparent";
    if (cat.includes("Sensing")) return "#D9EAD3"; // Light Green
    if (cat.includes("Ablation")) return "#FCE5CD"; // Light Orange
    if (cat.includes("Computational")) return "#D0E2F3"; // Light Blue
    return "#E2E8F0";
  };

  return (
    <div style={{ padding: 0, background: "#070C1A", minHeight: "100vh", color: "#F1F5F9", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0B1224" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/">
            <button style={{ 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              color: "#F1F5F9", 
              padding: "6px 14px", 
              borderRadius: 6, 
              fontSize: 12, 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              ← Back to Dashboard
            </button>
          </Link>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#00D4FF" }}>Patent Database</h2>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <input 
            type="text" 
            placeholder="Search patents..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              background: "#1A2235", 
              border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: 6, 
              color: "#fff", 
              padding: "6px 12px", 
              outline: "none", 
              width: 250,
              fontSize: 12
            }}
          />
          <div style={{ background: "rgba(0, 212, 255, 0.1)", color: "#00D4FF", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "1px solid rgba(0, 212, 255, 0.2)" }}>
            {filteredRows.length} Patents
          </div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <div
          style={{
            overflow: "auto",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            maxHeight: "calc(100vh - 100px)",
            background: "#0B1224"
          }}
        >
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "11px" }}>
            <thead style={{ position: "sticky", top: 0, background: "#1A2235", zIndex: 10 }}>
              {/* Category Header Row */}
              <tr>
                {groupedCols.map((group, i) => (
                  <th key={i} colSpan={group.cols.length} style={{ 
                    padding: "8px 12px", 
                    background: getCatColor(group.name),
                    color: group.name ? "#333" : "transparent",
                    fontSize: "10px",
                    fontWeight: 700,
                    textAlign: "center",
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                    borderRight: "1px solid rgba(0,0,0,0.05)",
                    textTransform: "uppercase"
                  }}>
                    {group.name || ""}
                  </th>
                ))}
              </tr>
              {/* Sub-category Header Row */}
              <tr>
                {allColumns.map((col) => (
                  <th key={col} style={{ 
                    padding: "10px 12px", 
                    textAlign: "left", 
                    background: "#1A2235",
                    color: "#94A3B8",
                    borderBottom: "1px solid rgba(255,255,255,0.1)", 
                    borderRight: "1px solid rgba(255,255,255,0.05)",
                    whiteSpace: "nowrap", 
                    fontWeight: 600,
                    fontSize: "10px",
                    textTransform: "uppercase"
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {allColumns.map((col) => (
                    <td 
                      key={col} 
                      onClick={() => row[col] && setSelectedCell({ col, val: row[col] })}
                      style={{ 
                        padding: "8px 12px", 
                        color: "#CBD5E1", 
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                        maxWidth: 300, 
                        overflow: "hidden", 
                        textOverflow: "ellipsis", 
                        whiteSpace: "nowrap",
                        cursor: row[col] ? "pointer" : "default"
                      }}
                      title={row[col] ? "Click to view full text" : ""}
                    >
                      {row[col] === 1 || row[col] === "1" || row[col] === "R" || row[col] === "✔" ? (
                        <span style={{ color: "#00D4FF" }}>✔</span>
                      ) : (
                        row[col] || "-"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Popup Modal */}
      {selectedCell && (
        <div 
          onClick={() => setSelectedCell(null)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 40
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: "#1A2235",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: 32,
              maxWidth: 800,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              position: "relative"
            }}
          >
            <button 
              onClick={() => setSelectedCell(null)}
              style={{
                position: "absolute",
                top: 16, right: 16,
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                fontSize: 24,
                cursor: "pointer",
                outline: "none"
              }}
            >
              ×
            </button>
            <div style={{ fontSize: 10, color: "#00D4FF", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>
              {selectedCell.col}
            </div>
            <div style={{ fontSize: 14, color: "#F1F5F9", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {selectedCell.val}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
