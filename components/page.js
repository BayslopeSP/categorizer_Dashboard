"use client";
import { useEffect, useState } from "react";

export default function DataPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then(setRows);
  }, []);

  if (!rows.length) return <div style={{ padding: 40 }}>Loading...</div>;

  const columns = Object.keys(rows[0]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Full Patent Dataset</h2>

      <div style={{ overflow: "auto", maxHeight: "80vh" }}>
        <table border="1" cellPadding="8">
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#111",
              color: "#fff",
            }}
          >
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
