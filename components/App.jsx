import { useState, useRef, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────
const PATENT_DATA = {
  total: 480,
  categoryData: [
    { name: "Sensing Modality", count: 642, fill: "#00D4FF" },
    { name: "Tissue / Anatomical Target", count: 406, fill: "#7C3AED" },
    { name: "Data / Computational Framework", count: 325, fill: "#10B981" },
    { name: "Ablation Energy Modality", count: 350, fill: "#F59E0B" },
  ],
  subcatData: {
    "Sensing Modality": [
      { name: "Electrical / Impedance", count: 203 },
      { name: "Thermal / Infrared", count: 164 },
      { name: "Optical / Photonic", count: 76 },
      { name: "Ultrasound / Acoustic", count: 74 },
      { name: "Imaging Based", count: 80 },
      { name: "Mechanical / Contact Force", count: 27 },
      { name: "Photoacoustic", count: 11 },
      { name: "Chemical / Biochemical", count: 2 },
    ],
    "Ablation Energy Modality": [
  { name: "Pulsed Electric Field (PEF)", count: 98 },
  { name: "Radiofrequency (RF) Ablation", count: 80 },
  { name: "Laser Ablation", count: 58 },
  { name: "Microwave Ablation", count: 43 },
  { name: "Cryoablation", count: 35 },
  { name: "Ultrasound Ablation (HIFU)", count: 34 },
  { name: "Phototherapy / Photothermal", count: 2 },
],
    "Data / Computational Framework": [
  { name: "Statistical / Empirical Models", count: 112 },
  { name: "Image Processing Algorithms", count: 84 },
  { name: "AI / ML", count: 60 },
  { name: "Signal Processing Algorithms", count: 38 },
  { name: "Multimodal Data Fusion", count: 31 },
],
    "Tissue / Anatomical Target": [
  { name: "Other / Non-Specific", count: 161 },
  { name: "Cardiac", count: 91 },
  { name: "Oncology / Tumor", count: 82 },
  { name: "Neurological / Nerve", count: 24 },
  { name: "Renal / Perirenal", count: 23 },
  { name: "Pulmonary / Airway", count: 14 },
  { name: "Gastrointestinal", count: 11 },
],
  },
  filingTrend: [
    { year: "2020", count: 9 },
    { year: "2021", count: 71 },
    { year: "2022", count: 88 },
    { year: "2023", count: 74 },
    { year: "2024", count: 91 },
    { year: "2025", count: 90 },
  ],
  geoData: [
    { country: "China", code: "CN", count: 1854, flag: "🇨🇳", fill: "#EF4444" },
    { country: "United States", code: "US", count: 942, flag: "🇺🇸", fill: "#3B82F6" },
    { country: "Europe", code: "EP", count: 456, flag: "🇪🇺", fill: "#10B981" },
    { country: "Japan", code: "JP", count: 382, flag: "🇯🇵", fill: "#F59E0B" },
    { country: "PCT / International", code: "WO", count: 215, flag: "🌐", fill: "#6366F1" },
    { country: "South Korea", code: "KR", count: 148, flag: "🇰🇷", fill: "#06B6D4" },
    { country: "India", code: "IN", count: 42, flag: "🇮🇳", fill: "#FF6B35" },
    { country: "Germany", code: "DE", count: 28, flag: "🇩🇪", fill: "#8B5CF6" },
    { country: "France", code: "FR", count: 12, flag: "🇫🇷", fill: "#EC4899" },
  ],
  assigneeData: [
    { name: "Medical and Healthcare", count: 224, fill: "#EF4444" },
    { name: "Research & Development", count: 118, fill: "#00D4FF" },
    { name: "University", count: 68, fill: "#7C3AED" },
    { name: "Hospital / Medical Center", count: 36, fill: "#10B981" },
    { name: "Others", count: 22, fill: "#6B7280" },
    { name: "AI-driven healthcare company", count: 12, fill: "#F59E0B" },
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

const CHAT_CONTEXT = `You are a patent intelligence analyst for Bayslope Technologies.
Your ONLY source of truth is the DYNAMIC DATASET SUMMARY and FULL PATENT LIST provided below. 
Do not use any hardcoded numbers from previous versions. 
If the user asks for counts, calculate them based on the FULL PATENT LIST provided in the context.`;

// ─── THEME ────────────────────────────────────────────────────────────
const C = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  border: "#E5E7EB", // Reverted to light border
  accent: "#000000",
  accent2: "#4B5563",
  text: "#111827",
  muted: "#6B7280",
  grid: "#F3F4F6",
};
const CHART_COLORS = ["#00D4FF", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];
const TABLE_BORDER = "#374151"; // Dark border only for table

const CATEGORY_COLORS = {
  "Sensing Modality": "#10B981", // Green
  "Ablation Energy Modality": "#EC4899", // Pink
  "Data Computational Framework/Data Processing (Sensor Data Processing)": "#3B82F6", // Blue
  "Tissue / Anatomical Target": "#F59E0B", // Yellow/Orange
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)", ...style }}>
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
    <div style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: "#111827", fontSize: 13, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ─── CHARTS ──────────────────────────────────────────────────────────────────
const Chart1_Category = ({ data }) => {
  const chartData = data?.categoryData || PATENT_DATA.categoryData;
  const total = data?.total || PATENT_DATA.total;
  return (
    <Card>
      <ChartTitle title="Patent Count by Category" subtitle={`${total} patents tagged across 4 primary taxonomy categories`} />
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
          <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" width={200} tick={{ fill: C.text, fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
          <Bar dataKey="count" name="Patents" radius={[0, 8, 8, 0]} barSize={36}>
            {chartData.map((entry, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        {chartData.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.fill }} />
            <span style={{ fontSize: 11, color: C.muted }}>{d.name}: <span style={{ color: C.text, fontWeight: 600 }}>{d.count}</span></span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const Chart2_Subcategory = ({ data }) => {
  const subcatData = data?.subcatData || PATENT_DATA.subcatData;
  const cats = Object.keys(subcatData);
  const [selected, setSelected] = useState(cats[0] || "");
  
  useEffect(() => {
    if (cats.length > 0 && !selected) setSelected(cats[0]);
  }, [cats]);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <ChartTitle title="Patent Count by Sub-Category" subtitle="Select a category to explore its sub-dimensions" />
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "8px 14px", fontSize: 12, cursor: "pointer", outline: "none" }}
        >
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={subcatData[selected] || []} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
          <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" width={210} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
          <Bar dataKey="count" name="Patents" radius={[0, 8, 8, 0]} barSize={28}>
            {(subcatData[selected] || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

const Chart3_FilingTrend = ({ data }) => {
  const filingTrend = data?.filingTrend || PATENT_DATA.filingTrend;
  const total = data?.total || PATENT_DATA.total;
  return (
    <Card>
      <ChartTitle title="Filing Trend Over Time" subtitle={`Number of patents filed per year (${filingTrend[0]?.year || '2020'}–${filingTrend[filingTrend.length-1]?.year || '2025'})`} />
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filingTrend} margin={{ left: 0, right: 20 }}>
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
        {[{ label: "Total", val: `${total} Patents` }].map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{s.val}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};


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
            background: "#F9FAFB", border: `1px solid ${C.border}`, borderRight: "none",
            padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 5,
          }}>
            <div style={{ fontSize: 20 }}>{cat.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{cat.category}</div>
            <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{cat.desc}</div>
          </div>
          <div style={{ width: 24, flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "100%", height: 2, background: C.border }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#111827", zIndex: 1 }} />
          </div>
          <div style={{
            flex: 1, borderRadius: "0 14px 14px 0",
            border: `1px solid ${C.border}`, borderLeft: `2px solid #E5E7EB`,
            background: "#FFFFFF", padding: "14px 16px",
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
          }}>
            {cat.subs.map((s, si) => (
              <div key={si} style={{
                padding: "6px 14px", borderRadius: 20,
                background: "#F3F4F6", border: `1px solid ${C.border}`,
                fontSize: 12, fontWeight: 500, color: "#374151", cursor: "default",
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
const Chatbot = ({ dynamicStats, cleanRows, allColumns, mapping, onClose, T }) => {
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
      
      // Create a condensed list of all patents for the AI to reference
      const patentList = cleanRows.map(r => 
        `- ${r["Publication Number"]}: ${r["Title"]} [Categories: ${allColumns.filter(c => r[c] === 1 || r[c] === "1" || r[c] === "R").join(", ")}]`
      ).join("\n");

      // Calculate a complete breakdown of every sub-category count for the AI
      let taxonomyBreakdown = "";
      if (dynamicStats && mapping) {
        dynamicStats.categoryData.forEach(cat => {
          taxonomyBreakdown += `\nCATEGORY: ${cat.name} (Total Tags: ${cat.count})\n`;
          const subs = Object.keys(mapping).filter(sub => mapping[sub] === cat.name);
          subs.forEach(sub => {
            const count = cleanRows.filter(r => r[sub] === 1 || r[sub] === "1" || r[sub] === "R").length;
            taxonomyBreakdown += `- ${sub}: ${count} patents\n`;
          });
        });
      }

      // Add Geographical Data for AI
      let geoBreakdown = "";
      if (dynamicStats?.geoData) {
        dynamicStats.geoData.forEach(g => {
          geoBreakdown += `- ${g.country}: ${g.count} patents (including family members)\n`;
        });
      }

      // Add Assignee Data for AI
      let assigneeBreakdown = "";
      if (dynamicStats?.assigneeData) {
        dynamicStats.assigneeData.forEach(a => {
          assigneeBreakdown += `- ${a.name}: ${a.count} patents\n`;
        });
      }

      const summary = `
        OFFICIAL DATASET STATISTICS (USE THESE EXACT NUMBERS):
        - Total Unique Patents: ${dynamicStats?.total || 0}
        
        GEOGRAPHICAL DISTRIBUTION:
        ${geoBreakdown}

        ASSIGNEE TYPE DISTRIBUTION:
        ${assigneeBreakdown}
        
        CATEGORY TAG COUNTS (Sum of all sub-categories):
        ${taxonomyBreakdown}
        
        FULL PATENT LIST (Reference these for specific numbers/titles):
        ${patentList}

        INSTRUCTIONS:
        1. When a user asks for "How many patents in Sensing Modality?", ALWAYS give the "Total Tags" number (e.g., 642).
        2. If they ask for "Total patents in the dataset", give the "Total Unique Patents" (e.g., 418).
        3. If they ask for a LIST or "Show me these patents", use the FULL PATENT LIST provided above to list the Publication Numbers and Titles.
        4. Do NOT say you cannot provide lists. You HAVE the data.
      `;

      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1000,
          system: summary + "\n" + CHAT_CONTEXT,
          messages: [...history, { role: "user", content: userMsg }],
        }),
      });

      if (!chatResponse.ok) {
        const errData = await chatResponse.json().catch(() => ({ error: "Server error" }));
        throw new Error(errData.error || "Connection error");
      }

      const chatData = await chatResponse.json();
      const reply = chatData.content?.[0]?.text || "I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: err.message || "Connection error. Please try again." }]);
    }
    setLoading(false);
  }, [input, loading, messages]);

  return (
    <div style={{
      position: "fixed", right: 20, bottom: 20, width: 400, height: 600,
      background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 16,
      display: "flex", flexDirection: "column", zIndex: 1000,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔬</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Patent Intelligence AI</div>
          <div style={{ fontSize: 10, color: "#10B981" }}>● Live · Powered by Bayslope Technologies</div>
          <div style={{ fontSize: 10,  fontWeight: 700, color: C.text  }}> Ask in English or Hebrew</div>
        </div>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px",
              borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: msg.role === "user" ? "#000000" : "#F3F4F6",
              border: msg.role === "user" ? "none" : `1px solid ${C.border}`,
              fontSize: 13, color: msg.role === "user" ? "#FFFFFF" : "#111827", lineHeight: 1.6, whiteSpace: "pre-wrap",
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
              style={{ background: "#F3F4F6", border: `1px solid ${C.border}`, borderRadius: 20, padding: "5px 12px", fontSize: 11, color: C.muted, cursor: "pointer" }}>
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
          placeholder={T.chatPlaceholder}
          style={{ flex: 1, background: "#F9FAFB", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 12, outline: "none" }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? "#E5E7EB" : "#000000",
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
const Dashboard = ({ user }) => {
  const [activeChart, setActiveChart] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [search, setSearch] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);
  const [dynamicStats, setDynamicStats] = useState(null);
  const [columnFilters, setColumnFilters] = useState({}); // Stores selected values for each column
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);
  const [filterPos, setFilterPos] = useState({ top: 0, left: 0 });
  const [lang, setLang] = useState("EN"); // "EN" or "HE"

  const TRANSLATIONS = {
    EN: {
      title: "Bayslope Technologies",
      subtitle: "Patent Intelligence Platform",
      visualizations: "Visualizations",
      categories: "Categories",
      subcategories: "Sub-Categories",
      filingTrend: "Filing Trend",
      geography: "Geography",
      taxonomyMap: "Taxonomy Map",
      assignees: "Assignees",
      patentData: "Patent Data",
      aiChat: "AI Chat",
      chatPlaceholder: "Ask in English or Hebrew?...",
      searchPlaceholder: "Search patents...",
      downloadExcel: "Download Excel",
      downloadPpt: "Download PPT",
      patents: "Patents",
      geographies: "Geographies",
      admin: "admin",
      viewFullData: "📋 View Full Data",
      chartCatTitle: "Patent Count by Category",
      chartSubTitle: "Patent Count by Sub-Category",
      chartTrendTitle: "Filing Trend Over Time",
      chartGeoTitle: "Patent Filing by Geography",
      chartTaxTitle: "Patent Taxonomy — Categories & Sub-Categories",
      chartAsnTitle: "Patents by Assignee Category",
      mainSub: "Medical Device Patent Intelligence · Ablation & Sensing Technologies"
    },
    HE: {
      title: "בייסלופ טכנולוגיות",
      subtitle: "פלטפורמת מודיעין פטנטים",
      visualizations: "ויזואליזציות",
      categories: "קטגוריות",
      subcategories: "תת-קטגוריות",
      filingTrend: "מגמת הגשה",
      geography: "גאוגרפיה",
      taxonomyMap: "מפת טקסונומיה",
      assignees: "נעברים",
      patentData: "נתוני פטנטים",
      aiChat: "צ'אט AI",
      chatPlaceholder: "שאל באנגלית או בעברית?...",
      searchPlaceholder: "חפש פטנטים...",
      downloadExcel: "הורד אקסל",
      downloadPpt: "הורד PPT",
      patents: "פטנטים",
      geographies: "גאוגרפיות",
      admin: "מנהל",
      viewFullData: "📋 צפה בנתונים מלאים",
      chartCatTitle: "ספירת פטנטים לפי קטגוריה",
      chartSubTitle: "ספירת פטנטים לפי תת-קטגוריה",
      chartTrendTitle: "מגמת הגשה לאורך זמן",
      chartGeoTitle: "הגשת פטנטים לפי גאוגרפיה",
      chartTaxTitle: "טקסונומיה של פטנטים - קטגוריות ותת-קטגוריות",
      chartAsnTitle: "פטנטים לפי קטגוריית נעברים",
      mainSub: "מודיעין פטנטים למכשור רפואי · טכנולוגיות אבלציה וחישה"
    }
  };

  const T = TRANSLATIONS[lang]; // Tracks coordinates for fixed positioning // Tracks which column dropdown is open

  useEffect(() => {
    fetch("/data.json")
      .then(res => res.json())
      .then(resData => {
        const rawData = resData.data || [];
        const map = resData.mapping || {};
        setRows(rawData);
        setMapping(map);

        // Calculate dynamic stats for charts
        const categories = [...new Set(Object.values(map))];
        
        // Calculate sub-category counts
        const subcatData = {};
        categories.forEach(cat => {
          const subs = Object.keys(map).filter(sub => map[sub] === cat);
          subcatData[cat] = subs.map(sub => ({
            name: sub,
            count: rawData.filter(r => r[sub] === 1 || r[sub] === "1" || r[sub] === "R").length
          })).sort((a, b) => b.count - a.count);
        });

        // Category count = Sum of sub-category tags (ensures 642 for Sensing Modality)
        const categoryData = categories.map((cat, i) => ({
          name: cat,
          count: subcatData[cat].reduce((sum, s) => sum + s.count, 0),
          fill: CHART_COLORS[i % CHART_COLORS.length]
        })).sort((a, b) => b.count - a.count);

        const years = [...new Set(rawData.map(r => r["Filing Year"]))].filter(Boolean).sort();
        const filingTrend = years.map(y => ({
          year: String(y),
          count: rawData.filter(r => r["Filing Year"] == y).length
        }));

        setDynamicStats({
          total: rawData.length,
          categoryData,
          subcatData,
          filingTrend,
          geoData: PATENT_DATA.geoData, 
          assigneeData: PATENT_DATA.assigneeData 
        });
      })
      .catch(err => console.error("Error loading data:", err));
  }, []);

  const cleanRows = rows.filter(r => 
    r["Unnamed: 1"] !== "Discuss" && 
    r["Unnamed: 1"] !== "Sr. No." &&
    Object.values(r).some(v => v !== null && v !== "-")
  );

  const allColumns = cleanRows.length > 0 
    ? Object.keys(cleanRows[0]).filter(c => 
        !c.toLowerCase().includes("unnamed") && 
        !c.endsWith("_link") && 
        c !== "null"
      )
    : [];

  const DASHBOARD_CHARTS = [
    {
      id: 0,
      label: T.categories,
      icon: "📊",
      component: <Chart1_Category data={dynamicStats} title={T.chartCatTitle} />,
    },
    {
      id: 1,
      label: T.subcategories,
      icon: "🔍",
      component: <Chart2_Subcategory data={dynamicStats} title={T.chartSubTitle} />,
    },
    {
      id: 2,
      label: T.filingTrend,
      icon: "📈",
      component: <Chart3_FilingTrend data={dynamicStats} title={T.chartTrendTitle} />,
    },
    { id: 3, label: T.geography, icon: "🌍", component: <Chart4_Geography title={T.chartGeoTitle} /> },
    {
      id: 4,
      label: T.taxonomyMap,
      icon: "🗺️",
      component: <Chart5_Taxonomy title={T.chartTaxTitle} />,
    },
    { id: 5, label: T.assignees, icon: "🏢", component: <Chart6_Assignee title={T.chartAsnTitle} /> },
    { id: 6, label: T.patentData, icon: "📊", component: null },
  ];

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
  if (currentGroup.cols.length > 0) groupedCols.push(currentGroup);

  const filteredRows = cleanRows.filter(r => {
    // Global search
    const matchesSearch = Object.values(r).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    );
    if (!matchesSearch) return false;

    // Column specific filters
    return Object.entries(columnFilters).every(([col, selectedValues]) => {
      if (!selectedValues || selectedValues.length === 0) return true;
      const cellVal = String(r[col] === 1 || r[col] === "1" || r[col] === "R" ? "✔" : (r[col] || "-"));
      return selectedValues.includes(cellVal);
    });
  });

  const toggleColumnFilter = (col, val) => {
    setColumnFilters(prev => {
      const current = prev[col] || [];
      const next = current.includes(val) 
        ? current.filter(v => v !== val) 
        : [...current, val];
      return { ...prev, [col]: next.length > 0 ? next : undefined };
    });
  };

  const getUniqueColumnValues = (col) => {
    const vals = cleanRows.map(r => String(r[col] === 1 || r[col] === "1" || r[col] === "R" ? "✔" : (r[col] || "-")));
    return [...new Set(vals)].sort();
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "system-ui, -apple-system, sans-serif",
        direction: lang === "HE" ? "rtl" : "ltr",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            B
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>
              Bayslope Technologies
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.muted,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Patent Intelligence Platform
            </div>
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {/* Language Toggle - High Visibility */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase" }}>
                {lang === "EN" ? "Language" : "שפה"}
              </span>
              <div 
                style={{ 
                  display: "flex", 
                  background: "#FFFFFF", 
                  padding: 3, 
                  borderRadius: 24, 
                  border: `2px solid #111827`,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
                onClick={() => setLang(lang === "EN" ? "HE" : "EN")}
              >
                <div style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  background: lang === "EN" ? "#111827" : "transparent",
                  color: lang === "EN" ? "#FFFFFF" : "#6B7280",
                  transition: "all 0.2s"
                }}>
                  EN
                </div>
                <div style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  background: lang === "HE" ? "#111827" : "transparent",
                  color: lang === "HE" ? "#FFFFFF" : "#6B7280",
                  transition: "all 0.2s"
                }}>
                  HE
                </div>
              </div>
            </div>

            {/* Stats Boxes */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { v: "480", l: T.patents },
                { v: "4", l: T.categories },
                { v: "9", l: T.geographies },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: "4px 14px",
                    background: "#F9FAFB",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                    {s.v}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: C.muted,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "#F9FAFB",
              borderRadius: 20,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {user[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 12, color: C.text }}>{user}</span>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        <aside
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: `1px solid ${C.border}`,
            padding: "20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            background: "#F9FAFB",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: C.muted,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              padding: "0 8px",
              marginBottom: 8,
            }}
          >
            {T.visualizations}
          </div>
          {DASHBOARD_CHARTS.map((c) => {
            const isPatentData = c.id === 6;
            const isActive = activeChart === c.id;
            
            return (
              <button
                key={c.id}
                onClick={() => setActiveChart(c.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 12px",
                  borderRadius: 10,
                  border: isPatentData && !isActive ? "1px solid #3B82F6" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  background: isActive
                    ? "#111827"
                    : isPatentData 
                      ? "#EFF6FF" // Light blue for data item
                      : "transparent",
                  color: isActive 
                    ? "#FFFFFF" 
                    : isPatentData 
                      ? "#1E40AF" // Darker blue for data text
                      : C.muted,
                  transition: "all 0.15s",
                  fontSize: 13,
                  fontWeight: (isActive || isPatentData) ? 600 : 400,
                  marginTop: isPatentData ? 12 : 0, // Extra space before data item
                }}
              >
                <span style={{ fontSize: isPatentData ? 16 : 14 }}>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            );
          })}
          <div style={{ marginTop: "auto", padding: "12px 8px" }}>
            <button
              onClick={() => setShowChat((s) => !s)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 12,
                border: `1px solid #111827`,
                background: showChat ? "#111827" : "transparent",
                color: showChat ? "#FFFFFF" : "#111827",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>💬</span> {T.aiChat}
            </button>
          </div>
        </aside>

        <main style={{ 
          flex: 1, 
          overflowY: "auto", 
          padding: "28px 32px",
          marginRight: showChat ? "420px" : "0",
          transition: "margin-right 0.3s ease-in-out"
        }}>
          <div style={{ maxWidth: activeChart === 6 ? "100%" : 900, margin: "0 auto" }}>
            <div
              style={{
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>
                  {DASHBOARD_CHARTS[activeChart].label}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                  {T.mainSub}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {activeChart === 6 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <a 
                      href="/Bay1_IP BI Project_Patent Dataset_Apr 29.xlsx" 
                      download 
                      style={{ 
                        textDecoration: "none",
                        background: "#FFFFFF", 
                        border: `1px solid ${C.border}`, 
                        color: "#166534", 
                        padding: "8px 16px", 
                        borderRadius: 8, 
                        fontSize: 12, 
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F0FDF4"}
                      onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
                    >
                      <span style={{ fontSize: 14 }}>📊</span> {T.downloadExcel}
                    </a>
                    <a 
                      href="/Bay_IP BUSINESS INTELLIGENCE REPORT_April 29.pptx" 
                      download 
                      style={{ 
                        textDecoration: "none",
                        background: "#FFFFFF", 
                        border: `1px solid ${C.border}`, 
                        color: "#991B1B", 
                        padding: "8px 16px", 
                        borderRadius: 8, 
                        fontSize: 12, 
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                      onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
                    >
                      <span style={{ fontSize: 14 }}>📉</span> {T.downloadPpt}
                    </a>
                  </div>
                )}
                {activeChart === 6 && (
                  <input 
                    type="text" 
                    placeholder={T.searchPlaceholder} 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "8px 16px", outline: "none", width: 300 }}
                  />
                )}
              </div>
              
              {/* <button 
                onClick={() => window.open("/data", "_blank")}
                style={{ 
                  background: "rgba(255,255,255,0.05)", 
                  border: `1px solid ${C.border}`, 
                  color: C.text, 
                  padding: "8px 16px", 
                  borderRadius: 20, 
                  fontSize: 11, 
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.borderColor = C.accent;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                📋 View Full Data
              </button> */}
            </div>
            {activeChart === 6 ? (
              <div style={{ overflow: "auto", border: `1px solid ${TABLE_BORDER}`, borderRadius: 12, maxHeight: "calc(100vh - 200px)", background: "#FFFFFF" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "11px" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#F9FAFB", zIndex: 10 }}>
                    <tr>
                      {groupedCols.map((group, i) => (
                        <th key={i} colSpan={group.cols.length} style={{ 
                          padding: "8px 12px", 
                          background: group.name ? (CATEGORY_COLORS[group.name] || "#E5E7EB") : "#E5E7EB", // Grey for baki headers
                          color: group.name ? "#FFFFFF" : "#4B5563",
                          fontSize: "10px", fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${TABLE_BORDER}`, borderRight: `1px solid ${TABLE_BORDER}`
                        }}>
                          {group.name}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {allColumns.map((col) => {
                        const cat = mapping[col];
                        const bgColor = cat ? (CATEGORY_COLORS[cat] || "#F3F4F6") : "#F3F4F6";
                        const textColor = cat ? "#FFFFFF" : "#4B5563";
                        const uniqueVals = getUniqueColumnValues(col);
                        const isActive = columnFilters[col] && columnFilters[col].length > 0;

                        return (
                          <th key={col} style={{ 
                            padding: "10px 12px", 
                            textAlign: "left", 
                            background: bgColor, 
                            color: textColor, 
                            borderBottom: `1px solid ${TABLE_BORDER}`, 
                            borderRight: `1px solid ${TABLE_BORDER}`, 
                            whiteSpace: "nowrap", 
                            fontWeight: 600,
                            position: "relative"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                              {col}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setFilterPos({ top: rect.bottom + 5, left: rect.left });
                                  setActiveFilterDropdown(activeFilterDropdown === col ? null : col);
                                }}
                                style={{ 
                                  background: isActive ? "#000" : "rgba(0,0,0,0.1)", 
                                  border: "none", 
                                  borderRadius: 4, 
                                  color: isActive ? "#fff" : textColor, 
                                  cursor: "pointer", 
                                  padding: "2px 4px",
                                  fontSize: "10px"
                                }}
                              >
                                ▽
                              </button>
                            </div>

                            {activeFilterDropdown === col && (
                              <div style={{ 
                                position: "fixed", 
                                top: filterPos.top, 
                                left: filterPos.left, 
                                background: "#fff", 
                                border: "1px solid #d1d5db", 
                                borderRadius: "8px", 
                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", 
                                zIndex: 9999, 
                                minWidth: "220px", 
                                width: "max-content",
                                maxWidth: "300px",
                                display: "flex", 
                                flexDirection: "column",
                                overflow: "hidden",
                                fontFamily: "inherit"
                              }}>
                                {/* Header */}
                                <div style={{ padding: "10px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#111827", marginBottom: "2px" }}>Filter {col}</div>
                                  <div style={{ fontSize: "9px", color: "#6b7280" }}>Select values to filter</div>
                                </div>
                                
                                {/* Scrollable List */}
                                <div style={{ overflowY: "auto", flex: 1, padding: "6px", maxHeight: "200px" }}>
                                  {uniqueVals.map(v => (
                                    <label key={v} style={{ 
                                      display: "flex", alignItems: "center", gap: "8px", 
                                      padding: "6px 8px", cursor: "pointer", color: "#374151",
                                      fontSize: "12px", borderRadius: "4px", transition: "background 0.2s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                      <input 
                                        type="checkbox" 
                                        style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                        checked={columnFilters[col]?.includes(v) || false}
                                        onChange={() => toggleColumnFilter(col, v)}
                                      />
                                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</span>
                                    </label>
                                  ))}
                                </div>

                                {/* Actions Footer */}
                                <div style={{ padding: "8px 10px", borderTop: "1px solid #e5e7eb", display: "flex", gap: "8px", background: "#fff" }}>
                                  <button 
                                    onClick={() => {
                                      setColumnFilters(prev => ({ ...prev, [col]: undefined }));
                                      setActiveFilterDropdown(null);
                                    }}
                                    style={{ 
                                      flex: 1, padding: "6px 0", fontSize: "11px", fontWeight: 500,
                                      background: "transparent", color: "#4b5563", border: "1px solid #d1d5db", 
                                      borderRadius: "6px", cursor: "pointer" 
                                    }}
                                  >
                                    Clear
                                  </button>
                                  <button 
                                    onClick={() => setActiveFilterDropdown(null)}
                                    style={{ 
                                      flex: 1, padding: "6px 0", fontSize: "11px", fontWeight: 600,
                                      background: "#111827", color: "#fff", border: "none", 
                                      borderRadius: "6px", cursor: "pointer" 
                                    }}
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${TABLE_BORDER}`, background: i % 2 === 0 ? "#FFFFFF" : "#F9FAFB" }}>
                        {allColumns.map((col) => {
                          const isPubNum = col.toLowerCase().includes("publication");
                          const link = isPubNum ? row[`${col}_link`] : null;

                          return (
                            <td 
                              key={col} 
                              onClick={() => !link && row[col] && setSelectedCell({ col, val: row[col] })} 
                              style={{ 
                                padding: "8px 12px", 
                                color: link ? "#000000" : "#374151", 
                                borderRight: `1px solid ${TABLE_BORDER}`, 
                                maxWidth: 200, 
                                overflow: "hidden", 
                                textOverflow: "ellipsis", 
                                whiteSpace: "nowrap", 
                                cursor: "pointer",
                                textDecoration: link ? "underline" : "none"
                              }}
                            >
                              {link ? (
                                <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "inherit" }}>
                                  {row[col]}
                                </a>
                              ) : (
                                row[col] === 1 || row[col] === "1" || row[col] === "R" ? "✔" : (row[col] || "-")
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              DASHBOARD_CHARTS[activeChart].component
            )}
          </div>
        </main>

        {/* Cell Detail Modal */}
        {selectedCell && (
          <div onClick={() => setSelectedCell(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 40 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, maxWidth: 800, width: "100%", maxHeight: "80vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
              <button onClick={() => setSelectedCell(null)} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: C.muted, fontSize: 24, cursor: "pointer" }}>×</button>
              <div style={{ fontSize: 10, color: "#111827", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>{selectedCell.col}</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{selectedCell.val}</div>
            </div>
          </div>
        )}
      </div>

      {showChat && (
        <Chatbot 
          dynamicStats={dynamicStats} 
          cleanRows={cleanRows} 
          allColumns={allColumns} 
          mapping={mapping} 
          onClose={() => setShowChat(false)} 
          T={T}
        />
      )}
    </div>
  );
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const CREDS = { Reinhold: "bayslope2026" };

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
        setError("Invalid credentials. Use: Reinhold / bayslope2026");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ width: 400, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              margin: "0 auto 16px",
            }}
          >
            B
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>
            Bayslope Technologies
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginTop: 6,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            Patent Intelligence Platform
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: 36,
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 6,
            }}
          >
            Welcome back
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 28 }}>
            Sign in to access patent analytics
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 11,
                color: "#6B7280",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              Username
            </label>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Reinhold"
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 12,
                boxSizing: "border-box",
                background: "#F9FAFB",
                border: `1px solid ${error ? "#EF4444" : C.border}`,
                color: "#111827",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                fontSize: 11,
                color: "#6B7280",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••••"
                style={{
                  width: "100%",
                  padding: "13px 44px 13px 16px",
                  borderRadius: 12,
                  boxSizing: "border-box",
                  background: "#F9FAFB",
                  border: `1px solid ${error ? "#EF4444" : C.border}`,
                  color: "#111827",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={() => setShowPw((s) => !s)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#6B7280",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: 10,
                fontSize: 12,
                color: "#B91C1C",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 14,
              border: "none",
              background: loading ? "#9CA3AF" : "#000000",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Authenticating..." : "Sign In →"}
          </button>

          {/* <div style={{ marginTop: 20, padding: 14, background: "#F9FAFB", borderRadius: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>🔑 Demo credentials</div>
            {Object.entries(CREDS).map(([u, p]) => (
              <div key={u} style={{ fontSize: 11, color: "#6B7280", fontFamily: "monospace" }}>
                <span style={{ color: "#000000" }}>{u}</span> / {p}
              </div>
            ))}
          </div> */}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 11,
            color: "#6B7280",
          }}
        >
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
