import { useState, useRef, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────
const PATENT_DATA = {
  total: 480,
  categoryData: [
    { name: "Sensing Modality", count: 149, fill: "#00D4FF" },
    { name: "Tissue / Anatomical Target", count: 102, fill: "#7C3AED" },
    { name: "Data / Computational Framework", count: 81, fill: "#10B981" },
    { name: "Ablation Energy Modality", count: 68, fill: "#F59E0B" },
  ],
  subcatData: {
    "Sensing Modality": [
      { name: "Electrical / Impedance", count: 50 },
      { name: "Thermal / Infrared", count: 33 },
      { name: "Optical / Photonic", count: 19 },
      { name: "Ultrasound / Acoustic", count: 19 },
      { name: "Imaging Based", count: 19 },
      { name: "Mechanical / Contact Force", count: 6 },
      { name: "Photoacoustic", count: 3 },
    ],
    "Ablation Energy Modality": [
      { name: "Pulsed Electric Field (PEF)", count: 23 },
      { name: "Laser Ablation", count: 15 },
      { name: "Radiofrequency (RF) Ablation", count: 12 },
      { name: "Microwave Ablation", count: 10 },
      { name: "Ultrasound Ablation (HIFU)", count: 6 },
      { name: "Cryoablation", count: 2 },
    ],
    "Data / Computational Framework": [
      { name: "Statistical / Empirical Models", count: 26 },
      { name: "Image Processing Algorithms", count: 18 },
      { name: "AI / ML", count: 14 },
      { name: "Signal Processing Algorithms", count: 13 },
      { name: "Multimodal Data Fusion", count: 10 },
    ],
    "Tissue / Anatomical Target": [
      { name: "Other / Non-Specific", count: 38 },
      { name: "Oncology / Tumor", count: 28 },
      { name: "Cardiac", count: 24 },
      { name: "Neurological / Nerve", count: 6 },
      { name: "Pulmonary / Airway", count: 3 },
      { name: "Gastrointestinal", count: 2 },
      { name: "Renal / Perirenal", count: 1 },
    ],
  },
  filingTrend: [
    { year: "2020", count: 10 },
    { year: "2021", count: 79 },
    { year: "2022", count: 103 },
    { year: "2023", count: 79 },
    { year: "2024", count: 105 },
    { year: "2025", count: 104 },
  ],
  geoData: [
    { country: "China", code: "CN", count: 260, flag: "🇨🇳", fill: "#EF4444" },
    { country: "PCT / International", code: "WO", count: 80, flag: "🌐", fill: "#6366F1" },
    { country: "United States", code: "US", count: 72, flag: "🇺🇸", fill: "#3B82F6" },
    { country: "Europe", code: "EP", count: 26, flag: "🇪🇺", fill: "#10B981" },
    { country: "Japan", code: "JP", count: 20, flag: "🇯🇵", fill: "#F59E0B" },
    { country: "India", code: "IN", count: 8, flag: "🇮🇳", fill: "#FF6B35" },
    { country: "Germany", code: "DE", count: 7, flag: "🇩🇪", fill: "#8B5CF6" },
    { country: "South Korea", code: "KR", count: 5, flag: "🇰🇷", fill: "#06B6D4" },
    { country: "France", code: "FR", count: 1, flag: "🇫🇷", fill: "#EC4899" },
  ],
  assigneeData: [
    { name: "Chinese MedTech Company", count: 127, fill: "#EF4444" },
    { name: "MedTech Startup / SME", count: 125, fill: "#00D4FF" },
    { name: "Research & Academic", count: 74, fill: "#7C3AED" },
    { name: "Large MedTech Corporation", count: 59, fill: "#F59E0B" },
    { name: "Hospital / Clinical", count: 36, fill: "#10B981" },
    { name: "Other", count: 23, fill: "#6B7280" },
  ],
  taxonomyMap: [
    {
      category: "Sensing Modality",
      color: "#00D4FF",
      icon: "📡",
      desc: "How the device senses & measures",
      subs: ["Electrical / Impedance", "Optical / Photonic", "Ultrasound / Acoustic", "Photoacoustic", "Thermal / Infrared", "Mechanical / Contact Force", "Imaging Based"],
    },
    {
      category: "Ablation Energy Modality",
      color: "#F59E0B",
      icon: "⚡",
      desc: "Energy type used to ablate tissue",
      subs: ["Radiofrequency (RF) Ablation", "Pulsed Electric Field (PEF)", "Microwave Ablation", "Laser Ablation", "Cryoablation", "Ultrasound Ablation (HIFU)", "Phototherapy / Photothermal"],
    },
    {
      category: "Data / Computational Framework",
      color: "#10B981",
      icon: "🧠",
      desc: "Algorithms & processing methods",
      subs: ["Signal Processing Algorithms", "Image Processing Algorithms", "Statistical / Empirical Models", "AI / ML", "Multimodal Data Fusion"],
    },
    {
      category: "Tissue / Anatomical Target",
      color: "#7C3AED",
      icon: "🫀",
      desc: "Anatomical region addressed",
      subs: ["Cardiac", "Renal / Perirenal", "Pulmonary / Airway", "Gastrointestinal", "Oncology / Tumor", "Neurological / Nerve", "Other / Non-Specific"],
    },
  ],
};

const CHAT_CONTEXT = `You are a patent intelligence analyst for Bayslope Technologies. You have deep knowledge of 480 medical device/ablation therapy patents analyzed and tagged with a custom taxonomy. Answer questions about this patent dataset accurately and concisely.

KEY DATASET FACTS:
- Total Patents: 480
- Filing Years: 2020–2025 (peak in 2024 with 105 patents)
- Top Geography: China (260 patents, 54%), then PCT/International (80), US (72), Europe (26), Japan (20)

TAXONOMY:
- Sensing Modality: 149 patents [Electrical/Impedance: 50, Thermal/IR: 33, Optical: 19, Ultrasound: 19, Imaging: 19, Mechanical: 6, Photoacoustic: 3]
- Tissue/Anatomical Target: 102 patents [Other/Non-Specific: 38, Oncology/Tumor: 28, Cardiac: 24, Neurological: 6, Pulmonary: 3, GI: 2, Renal: 1]
- Data/Computational Framework: 81 patents [Statistical Models: 26, Image Processing: 18, AI/ML: 14, Signal Processing: 13, Multimodal Fusion: 10]
- Ablation Energy Modality: 68 patents [PEF/Electroporation: 23, Laser: 15, RF Ablation: 12, Microwave: 10, HIFU: 6, Cryoablation: 2]

ASSIGNEE TYPES: Chinese MedTech Companies (127), Startups/SMEs (125), Research/Academic (74), Large MedTech Corporations (59), Hospital/Clinical (36), Other (23)

FILING TREND: 10 (2020) → 79 (2021) → 103 (2022) → 79 (2023) → 105 (2024) → 104 (2025)

Answer only questions related to this patent dataset. Be precise and reference specific numbers.`;

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#070C1A",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  accent: "#00D4FF",
  accent2: "#7C3AED",
  text: "#F1F5F9",
  muted: "#64748B",
  grid: "rgba(255,255,255,0.05)",
};
const CHART_COLORS = ["#00D4FF", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#8B5CF6"];

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, ...style }}>
    {children}
  </div>
);

const ChartTitle = ({ title, subtitle }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</div>
    {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{subtitle}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111827", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.accent, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ─── CHARTS ──────────────────────────────────────────────────────────────────
const Chart1_Category = () => (
  <Card>
    <ChartTitle title="Patent Count by Category" subtitle="480 patents tagged across 4 primary taxonomy categories" />
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={PATENT_DATA.categoryData} layout="vertical" margin={{ left: 20, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
        <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis dataKey="name" type="category" width={200} tick={{ fill: C.text, fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="count" name="Patents" radius={[0, 8, 8, 0]} barSize={36}>
          {PATENT_DATA.categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
      {PATENT_DATA.categoryData.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.fill }} />
          <span style={{ fontSize: 11, color: C.muted }}>{d.name.split("/")[0].trim()} ({d.count})</span>
        </div>
      ))}
    </div>
  </Card>
);

const Chart2_Subcategory = () => {
  const cats = Object.keys(PATENT_DATA.subcatData);
  const [selected, setSelected] = useState(cats[0]);
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <ChartTitle title="Patent Count by Sub-Category" subtitle="Select a category to explore its sub-dimensions" />
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{ background: "#111827", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "8px 14px", fontSize: 12, cursor: "pointer", outline: "none" }}
        >
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={PATENT_DATA.subcatData[selected]} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
          <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" width={210} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="count" name="Patents" radius={[0, 8, 8, 0]} barSize={28}>
            {PATENT_DATA.subcatData[selected].map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

const Chart3_FilingTrend = () => (
  <Card>
    <ChartTitle title="Filing Trend Over Time" subtitle="Number of patents filed per year (2020–2025)" />
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={PATENT_DATA.filingTrend} margin={{ left: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
        <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: C.muted, fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone" dataKey="count" name="Patents Filed"
          stroke={C.accent} strokeWidth={3}
          dot={{ fill: C.accent, r: 6, strokeWidth: 2, stroke: C.bg }}
          activeDot={{ r: 8, fill: "#fff", stroke: C.accent, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
    <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
      {[{ label: "Peak Year", val: "2024 (105)" }, { label: "2025 YTD", val: "104" }, { label: "Total", val: "480 Patents" }, { label: "Growth 21→24", val: "+33%" }].map((s, i) => (
        <div key={i}>
          <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{s.val}</div>
        </div>
      ))}
    </div>
  </Card>
);

const Chart4_Geography = () => {
  const total = PATENT_DATA.geoData.reduce((a, b) => a + b.count, 0);
  return (
    <Card>
      <ChartTitle title="Patent Filing by Geography" subtitle="Distribution of patents by jurisdiction/country of filing" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={PATENT_DATA.geoData} cx="50%" cy="50%" outerRadius={110} innerRadius={55} dataKey="count" nameKey="country" paddingAngle={2}>
              {PATENT_DATA.geoData.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="transparent" />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PATENT_DATA.geoData.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{d.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{d.code} — {d.country}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{d.count} ({Math.round(d.count / total * 100)}%)</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${d.count / total * 100}%`, height: "100%", background: d.fill, borderRadius: 4 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const Chart5_Taxonomy = () => (
  <Card>
    <ChartTitle title="Patent Taxonomy — Categories & Sub-Categories" subtitle="Structural map of the classification framework used across all 480 patents" />
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {PATENT_DATA.taxonomyMap.map((cat, ci) => (
        <div key={ci} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
          <div style={{
            width: 190, flexShrink: 0, borderRadius: "14px 0 0 14px",
            background: `${cat.color}18`, border: `1px solid ${cat.color}44`, borderRight: "none",
            padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 5,
          }}>
            <div style={{ fontSize: 20 }}>{cat.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: cat.color, lineHeight: 1.3 }}>{cat.category}</div>
            <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{cat.desc}</div>
          </div>
          <div style={{ width: 24, flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "100%", height: 2, background: `linear-gradient(90deg, ${cat.color}60, ${cat.color}20)` }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, zIndex: 1 }} />
          </div>
          <div style={{
            flex: 1, borderRadius: "0 14px 14px 0",
            border: `1px solid ${cat.color}22`, borderLeft: `2px solid ${cat.color}33`,
            background: "rgba(255,255,255,0.02)", padding: "14px 16px",
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
          }}>
            {cat.subs.map((s, si) => (
              <div key={si} style={{
                padding: "6px 14px", borderRadius: 20,
                background: `${cat.color}14`, border: `1px solid ${cat.color}35`,
                fontSize: 12, fontWeight: 500, color: cat.color, cursor: "default",
              }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${C.border}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, color: C.muted }}>📋 4 top-level categories</span>
      <span style={{ fontSize: 11, color: C.muted }}>🏷️ 31 sub-categories total</span>
      <span style={{ fontSize: 11, color: C.muted }}>📄 480 patents tagged</span>
    </div>
  </Card>
);

const Chart6_Assignee = () => {
  const total = PATENT_DATA.assigneeData.reduce((a, b) => a + b.count, 0);
  return (
    <Card>
      <ChartTitle title="Patents by Assignee Category" subtitle="Assignees logically classified by organisation type" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={PATENT_DATA.assigneeData} cx="50%" cy="50%" outerRadius={110} innerRadius={50} dataKey="count" nameKey="name" paddingAngle={3}>
              {PATENT_DATA.assigneeData.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="transparent" />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PATENT_DATA.assigneeData.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: `${d.fill}11`, borderRadius: 10, border: `1px solid ${d.fill}33` }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: d.fill, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{d.count} patents · {Math.round(d.count / total * 100)}%</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: C.muted, marginTop: 4, paddingLeft: 4 }}>
            * Classification based on organisation naming patterns &amp; geography
          </div>
        </div>
      </div>
    </Card>
  );
};

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Patent Intelligence Assistant. Ask me anything about this dataset — categories, filing trends, geographies, assignees, or specific technologies." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      // ✅ FIX: routes through /api/chat proxy — API key stays server-side
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1000,
          system: CHAT_CONTEXT,
          messages: [...history, { role: "user", content: userMsg }],
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }, [input, loading, messages]);

  return (
    <div style={{
      position: "fixed", right: 20, bottom: 20, width: 380, height: 560,
      background: "#0D1628", border: `1px solid ${C.border}`, borderRadius: 20,
      display: "flex", flexDirection: "column", zIndex: 1000,
      boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔬</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Patent Intelligence AI</div>
          <div style={{ fontSize: 10, color: "#10B981" }}>● Live · Powered by Claude</div>
        </div>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", padding: "10px 14px",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: msg.role === "user" ? `linear-gradient(135deg, ${C.accent}CC, ${C.accent2}CC)` : "rgba(255,255,255,0.06)",
              border: msg.role === "user" ? "none" : `1px solid ${C.border}`,
              fontSize: 12.5, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: `pulse 1.2s ${i * 0.2}s infinite ease-in-out` }} />
              ))}
            </div>
            <span style={{ fontSize: 11, color: C.muted }}>Analyzing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ padding: "0 16px 12px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Which country files most?", "Top sensing modality?", "AI/ML patent count?", "Filing trend 2022→2024?"].map((q, i) => (
            <button key={i} onClick={() => setInput(q)}
              style={{ background: "rgba(0,212,255,0.08)", border: `1px solid rgba(0,212,255,0.2)`, borderRadius: 20, padding: "5px 12px", fontSize: 11, color: C.accent, cursor: "pointer" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask about patents..."
          style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 12, outline: "none" }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? "rgba(0,212,255,0.2)" : `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
            border: "none", borderRadius: 12, padding: "10px 16px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            color: "#fff", fontSize: 14,
          }}>
          ➤
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const CHARTS = [
  { id: 0, label: "Categories",     icon: "📊", component: <Chart1_Category /> },
  { id: 1, label: "Sub-Categories", icon: "🔍", component: <Chart2_Subcategory /> },
  { id: 2, label: "Filing Trend",   icon: "📈", component: <Chart3_FilingTrend /> },
  { id: 3, label: "Geography",      icon: "🌍", component: <Chart4_Geography /> },
  { id: 4, label: "Taxonomy Map",   icon: "🗺️", component: <Chart5_Taxonomy /> },
  { id: 5, label: "Assignees",      icon: "🏢", component: <Chart6_Assignee /> },
];

const Dashboard = ({ user }) => {
  const [activeChart, setActiveChart] = useState(0);
  const [showChat, setShowChat] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 50, borderBottom: `1px solid ${C.border}`,
        background: "rgba(7,12,26,0.95)", backdropFilter: "blur(20px)",
        padding: "0 28px", display: "flex", alignItems: "center", height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>B</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>Bayslope Technologies</div>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: "1.5px", textTransform: "uppercase" }}>Patent Intelligence Platform</div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ v: "480", l: "Patents" }, { v: "4", l: "Categories" }, { v: "9", l: "Geographies" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "4px 14px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{s.v}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: C.surface, borderRadius: 20, border: `1px solid ${C.border}` }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{user[0].toUpperCase()}</div>
            <span style={{ fontSize: 12, color: C.text }}>{user}</span>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        <aside style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${C.border}`, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, background: "rgba(255,255,255,0.01)" }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Visualizations</div>
          {CHARTS.map(c => (
            <button key={c.id} onClick={() => setActiveChart(c.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "11px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                background: activeChart === c.id ? `linear-gradient(135deg, ${C.accent}22, ${C.accent2}11)` : "transparent",
                color: activeChart === c.id ? C.accent : C.muted,
                borderLeft: activeChart === c.id ? `3px solid ${C.accent}` : "3px solid transparent",
                transition: "all 0.15s", fontSize: 13, fontWeight: activeChart === c.id ? 600 : 400,
              }}>
              <span>{c.icon}</span><span>{c.label}</span>
            </button>
          ))}
          <div style={{ marginTop: "auto", padding: "12px 8px" }}>
            <button onClick={() => setShowChat(s => !s)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1px solid ${C.accent}44`, background: showChat ? `${C.accent}22` : "transparent", color: C.accent, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span>💬</span> AI Chat
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{CHARTS[activeChart].label}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Medical Device Patent Intelligence · Ablation & Sensing Technologies</div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, padding: "6px 14px", background: C.surface, borderRadius: 20, border: `1px solid ${C.border}` }}>
                📁 Patent_tagging_RNR_WIP-23.xlsx
              </div>
            </div>
            {CHARTS[activeChart].component}
          </div>
        </main>
      </div>

      {showChat && <Chatbot onClose={() => setShowChat(false)} />}
    </div>
  );
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const CREDS = { admin: "bayslope2026" };

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!username || !password) { setError("Please enter your credentials."); return; }
    setLoading(true);
    setTimeout(() => {
      if (CREDS[username] === password) {
        onLogin(username);
      } else {
        // ✅ FIX: corrected credential hint (was bayslope2024)
        setError("Invalid credentials. Use: admin / bayslope2026");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}08 0%, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent2}08 0%, transparent 70%)` }} />
      </div>

      <div style={{ width: 420, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 auto 16px" }}>B</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text }}>Bayslope Technologies</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6, letterSpacing: "1.5px", textTransform: "uppercase" }}>Patent Intelligence Platform</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 24, padding: 36 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>Sign in to access patent analytics</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: C.muted, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Username</label>
            <input value={username} onChange={e => { setUsername(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="admin"
              style={{ width: "100%", padding: "13px 16px", borderRadius: 12, boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "#EF4444" : C.border}`, color: C.text, fontSize: 14, outline: "none" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: C.muted, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="••••••••••"
                style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "#EF4444" : C.border}`, color: C.text, fontSize: 14, outline: "none" }} />
              <button onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>{showPw ? "🙈" : "👁"}</button>
            </div>
          </div>

          {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 12, color: "#FCA5A5" }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: loading ? "rgba(0,212,255,0.3)" : `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Authenticating..." : "Sign In →"}
          </button>

          <div style={{ marginTop: 20, padding: 14, background: "rgba(0,212,255,0.05)", borderRadius: 12, border: `1px solid rgba(0,212,255,0.15)` }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>🔑 Demo credentials</div>
            {Object.entries(CREDS).map(([u, p]) => (
              <div key={u} style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
                <span style={{ color: C.accent }}>{u}</span> / {p}
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: C.muted }}>
          © 2026 Bayslope Technologies · Patent Intelligence AI
        </div>
      </div>
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  return user ? <Dashboard user={user} /> : <Login onLogin={setUser} />;
}
