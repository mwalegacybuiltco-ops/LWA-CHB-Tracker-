import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  Ghost,
  CalendarClock,
  ClipboardList,
  Flag,
  MessageSquare,
  BellRing,
  PawPrint,
  LayoutList,
  CheckCircle2,
  Star,
  Sparkles,
  Download,
  Smartphone,
} from "lucide-react";

const STORAGE_KEYS = {
  leads: "lbos_leads_v2",
  content: "lbos_content_v2",
  chbContacts: "lbos_chb_contacts_v2",
  chbContent: "lbos_chb_content_v2",
};

const leadStages = [
  "New Lead",
  "Conversation Started",
  "24 Hours",
  "48 Hours",
  "72 Hours",
  "30 Day",
  "VIP Joined",
  "Affiliate",
  "Ambassador",
  "Ghosted",
  "Closed",
];

const followUpStages = ["24 Hours", "48 Hours", "72 Hours", "30 Day"];
const chbCategories = ["Customer Prospect", "Affiliate Prospect", "Affiliate", "Customer", "VIP"];
const contentPillars = ["Authority", "Story", "Offer", "Objection", "Engagement"];
const chbPillars = ["Product Post", "Dog Tips", "Affiliate Post", "Customer Story", "Engagement Post"];

const todayString = () => new Date().toISOString().slice(0, 10);

const demoLeads = [
  {
    id: 1,
    name: "Sarah M.",
    platform: "Facebook",
    stage: "24 Hours",
    notes: "Watched the overview. Curious but overwhelmed.",
    history: [
      { id: 11, text: "Sent first follow-up after she watched the overview.", createdAt: new Date().toISOString() },
    ],
    joinedVIP: true,
    becameAffiliate: false,
    becameAmbassador: false,
    ghosted: false,
    followUpType: "24 Hours",
    followUpDate: todayString(),
    score: 7,
    postsTouched: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Jen K.",
    platform: "TikTok",
    stage: "Ghosted",
    notes: "Opened messages then disappeared after pricing came up.",
    history: [
      { id: 21, text: "Wait 30 days before re-opening.", createdAt: new Date().toISOString() },
    ],
    joinedVIP: false,
    becameAffiliate: false,
    becameAmbassador: false,
    ghosted: true,
    followUpType: "30 Day",
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    score: 3,
    postsTouched: 1,
    createdAt: new Date().toISOString(),
  },
];

const demoContent = [
  { id: 101, title: "Inflation reality check post", pillar: "Story", status: "Planned", date: todayString(), notes: "Talk about life costs and digital flexibility." },
  { id: 102, title: "What digital marketing actually is", pillar: "Authority", status: "Drafted", date: todayString(), notes: "Keep it simple and real." },
];

const demoCHBContacts = [
  {
    id: 201,
    name: "Megan P.",
    platform: "Facebook",
    status: "Info Sent",
    category: "Affiliate Prospect",
    notes: "Interested in boutique products and affiliate options.",
    infoSent: true,
    affiliate: false,
    ghosted: false,
    followUpDate: todayString(),
    history: [{ id: 211, text: "Sent Canine Haven details.", createdAt: new Date().toISOString() }],
  },
];

const demoCHBContent = [
  { id: 301, title: "German Shepherd tumbler spotlight", pillar: "Product Post", status: "Planned", date: todayString(), notes: "Lifestyle angle." },
  { id: 302, title: "Snow paw care tips", pillar: "Dog Tips", status: "Drafted", date: todayString(), notes: "Trust-first educational post." },
];

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveCSV(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const safe = String(value ?? "").replaceAll('"', '""');
          return `"${safe}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="card stat-card">
      <div>
        <div className="muted small">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
      <div className="icon-wrap">
        <Icon size={20} />
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, actions }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      <div className="hero-actions">{actions}</div>
    </div>
  );
}

function TimelineNotes({ items, onAdd, placeholder }) {
  const [text, setText] = useState("");

  return (
    <div className="notes-section">
      <div>
        <div className="section-title">Running notes</div>
        <div className="muted small">Keep your conversation trail in one place.</div>
      </div>

      <div className="note-list">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="note-item">
              <div>{item.text}</div>
              <div className="muted tiny">{new Date(item.createdAt).toLocaleString()}</div>
            </div>
          ))
        ) : (
          <div className="empty-box">No notes yet.</div>
        )}
      </div>

      <textarea
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          if (!text.trim()) return;
          onAdd(text);
          setText("");
        }}
      >
        Save Note
      </button>
    </div>
  );
}

function LeadCard({ lead, onUpdate, onAddNote }) {
  return (
    <div className="card lead-card">
      <div className="lead-top">
        <div>
          <h3>{lead.name}</h3>
          <div className="muted">
            {lead.platform} • Score {lead.score}/10
          </div>
        </div>
        <span className="pill">{lead.stage}</span>
      </div>

      <p>{lead.notes || "No notes yet."}</p>

      <div className="two-col">
        <div>
          <label>Stage</label>
          <select
            value={lead.stage}
            onChange={(e) => onUpdate(lead.id, { stage: e.target.value, followUpType: followUpStages.includes(e.target.value) ? e.target.value : lead.followUpType })}
          >
            {leadStages.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Follow-up date</label>
          <input
            type="date"
            value={lead.followUpDate || ""}
            onChange={(e) => onUpdate(lead.id, { followUpDate: e.target.value })}
          />
        </div>
      </div>

      <div className="two-col">
        <div>
          <label>Lead score</label>
          <input
            type="number"
            min="1"
            max="10"
            value={lead.score}
            onChange={(e) => onUpdate(lead.id, { score: Math.max(1, Math.min(10, Number(e.target.value || 1))) })}
          />
        </div>
        <div>
          <label>Post touches</label>
          <div className="inline-row">
            <input type="number" value={lead.postsTouched} onChange={(e) => onUpdate(lead.id, { postsTouched: Number(e.target.value || 0) })} />
            <button className="secondary" onClick={() => onUpdate(lead.id, { postsTouched: lead.postsTouched + 1 })}>+1</button>
          </div>
        </div>
      </div>

      <div className="badge-grid">
        <span className={lead.joinedVIP ? "badge on" : "badge"}>VIP</span>
        <span className={lead.becameAffiliate ? "badge on" : "badge"}>Affiliate</span>
        <span className={lead.becameAmbassador ? "badge on" : "badge"}>Ambassador</span>
        <span className={lead.ghosted ? "badge danger" : "badge"}>Ghosted</span>
      </div>

      <div className="check-grid">
        <label><input type="checkbox" checked={lead.joinedVIP} onChange={() => onUpdate(lead.id, { joinedVIP: !lead.joinedVIP })} /> Joined VIP</label>
        <label><input type="checkbox" checked={lead.becameAffiliate} onChange={() => onUpdate(lead.id, { becameAffiliate: !lead.becameAffiliate })} /> Became Affiliate</label>
        <label><input type="checkbox" checked={lead.becameAmbassador} onChange={() => onUpdate(lead.id, { becameAmbassador: !lead.becameAmbassador })} /> Became Ambassador</label>
        <label><input type="checkbox" checked={lead.ghosted} onChange={() => onUpdate(lead.id, { ghosted: !lead.ghosted })} /> Ghosted</label>
      </div>

      <label>Main notes</label>
      <textarea
        value={lead.notes}
        onChange={(e) => onUpdate(lead.id, { notes: e.target.value })}
        placeholder="Conversation context, objection, what she said, next move..."
      />

      <TimelineNotes
        items={lead.history || []}
        onAdd={(text) =>
          onAddNote(lead.id, text)
        }
        placeholder="Add a follow-up note..."
      />
    </div>
  );
}

function ContentCard({ item, pillars, onUpdate }) {
  return (
    <div className="card chb-post-card">
      <div className="lead-top">
        <div>
          <h3>{item.title}</h3>
          <div className="muted">{item.pillar}</div>
        </div>
        <span className="pill">{item.status}</span>
      </div>

      <div className="two-col">
        <div>
          <label>Pillar</label>
          <select value={item.pillar} onChange={(e) => onUpdate(item.id, { pillar: e.target.value })}>
            {pillars.map((pillar) => (
              <option key={pillar} value={pillar}>{pillar}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Status</label>
          <select value={item.status} onChange={(e) => onUpdate(item.id, { status: e.target.value })}>
            {["Planned", "Drafted", "Posted"].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label>Date</label>
        <input type="date" value={item.date} onChange={(e) => onUpdate(item.id, { date: e.target.value })} />
      </div>

      <div>
        <label>Notes</label>
        <textarea value={item.notes} onChange={(e) => onUpdate(item.id, { notes: e.target.value })} placeholder="Hook, angle, CTA, caption reminder..." />
      </div>
    </div>
  );
}

function CHBContactCard({ item, onUpdate, onAddNote }) {
  return (
    <div className="card lead-card">
      <div className="lead-top">
        <div>
          <h3>{item.name}</h3>
          <div className="muted">{item.platform} • {item.category}</div>
        </div>
        <span className="pill">{item.status}</span>
      </div>

      <p>{item.notes || "No notes yet."}</p>

      <div className="two-col">
        <div>
          <label>Status</label>
          <input value={item.status} onChange={(e) => onUpdate(item.id, { status: e.target.value })} />
        </div>
        <div>
          <label>Follow-up date</label>
          <input type="date" value={item.followUpDate} onChange={(e) => onUpdate(item.id, { followUpDate: e.target.value })} />
        </div>
      </div>

      <div className="two-col">
        <div>
          <label>Category</label>
          <select value={item.category} onChange={(e) => onUpdate(item.id, { category: e.target.value })}>
            {chbCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="badge-grid">
        <span className={item.affiliate ? "badge on" : "badge"}>Affiliate</span>
        <span className={item.infoSent ? "badge on" : "badge"}>Info Sent</span>
        <span className={item.ghosted ? "badge danger" : "badge"}>Ghosted</span>
        <span className="badge">{item.category}</span>
      </div>

      <div className="check-grid">
        <label><input type="checkbox" checked={item.affiliate} onChange={() => onUpdate(item.id, { affiliate: !item.affiliate })} /> Affiliate</label>
        <label><input type="checkbox" checked={item.infoSent} onChange={() => onUpdate(item.id, { infoSent: !item.infoSent })} /> Info Sent</label>
        <label><input type="checkbox" checked={item.ghosted} onChange={() => onUpdate(item.id, { ghosted: !item.ghosted })} /> Ghosted</label>
      </div>

      <label>Main notes</label>
      <textarea
        value={item.notes}
        onChange={(e) => onUpdate(item.id, { notes: e.target.value })}
        placeholder="What you sent, what she asked, product interest, next move..."
      />

      <TimelineNotes
        items={item.history || []}
        onAdd={(text) => onAddNote(item.id, text)}
        placeholder="Add a CHB contact note..."
      />
    </div>
  );
}

export default function App() {
  const [section, setSection] = useState("lead-os");
  const [query, setQuery] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("All");
  const [installPrompt, setInstallPrompt] = useState(null);

  const [leads, setLeads] = useState(() => loadData(STORAGE_KEYS.leads, demoLeads));
  const [content, setContent] = useState(() => loadData(STORAGE_KEYS.content, demoContent));
  const [chbContacts, setChbContacts] = useState(() => loadData(STORAGE_KEYS.chbContacts, demoCHBContacts));
  const [chbContent, setChbContent] = useState(() => loadData(STORAGE_KEYS.chbContent, demoCHBContent));

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [showCHBContactForm, setShowCHBContactForm] = useState(false);
  const [showCHBContentForm, setShowCHBContentForm] = useState(false);

  const [leadForm, setLeadForm] = useState({
    name: "",
    platform: "Facebook",
    stage: "New Lead",
    notes: "",
    followUpDate: todayString(),
    score: 5,
  });

  const [contentForm, setContentForm] = useState({
    title: "",
    pillar: "Authority",
    status: "Planned",
    date: todayString(),
    notes: "",
  });

  const [chbContactForm, setChbContactForm] = useState({
    name: "",
    platform: "Facebook",
    status: "New Contact",
    category: "Customer Prospect",
    notes: "",
    followUpDate: todayString(),
  });

  const [chbContentForm, setChbContentForm] = useState({
    title: "",
    pillar: "Product Post",
    status: "Planned",
    date: todayString(),
    notes: "",
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.content, JSON.stringify(content)); }, [content]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.chbContacts, JSON.stringify(chbContacts)); }, [chbContacts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.chbContent, JSON.stringify(chbContent)); }, [chbContent]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const today = todayString();

  const filteredLeads = useMemo(() => {
    const q = query.toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        lead.name.toLowerCase().includes(q) ||
        lead.platform.toLowerCase().includes(q) ||
        lead.stage.toLowerCase().includes(q) ||
        (lead.notes || "").toLowerCase().includes(q);

      const matchesPipeline =
        pipelineFilter === "All" ||
        lead.stage === pipelineFilter ||
        (pipelineFilter === "Due Today" && lead.followUpDate === today) ||
        (pipelineFilter === "Overdue" && lead.followUpDate < today);

      return matchesQuery && matchesPipeline;
    });
  }, [leads, query, pipelineFilter, today]);

  const filteredContent = useMemo(() => {
    const q = query.toLowerCase();
    return content.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.pillar.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      (item.notes || "").toLowerCase().includes(q)
    );
  }, [content, query]);

  const filteredCHBContacts = useMemo(() => {
    const q = query.toLowerCase();
    return chbContacts.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.platform.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.notes || "").toLowerCase().includes(q)
    );
  }, [chbContacts, query]);

  const filteredCHBContent = useMemo(() => {
    const q = query.toLowerCase();
    return chbContent.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.pillar.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      (item.notes || "").toLowerCase().includes(q)
    );
  }, [chbContent, query]);

  const leadStats = useMemo(() => ({
    total: leads.length,
    dueToday: leads.filter((l) => l.followUpDate === today).length,
    overdue: leads.filter((l) => l.followUpDate < today).length,
    affiliates: leads.filter((l) => l.becameAffiliate).length,
    ambassadors: leads.filter((l) => l.becameAmbassador).length,
    avgScore: leads.length ? (leads.reduce((sum, l) => sum + Number(l.score || 0), 0) / leads.length).toFixed(1) : "0.0",
  }), [leads, today]);

  const chbStats = useMemo(() => ({
    contacts: chbContacts.length,
    affiliates: chbContacts.filter((c) => c.affiliate).length,
    infoSent: chbContacts.filter((c) => c.infoSent).length,
    dogTips: chbContent.filter((c) => c.pillar === "Dog Tips").length,
    products: chbContent.filter((c) => c.pillar === "Product Post").length,
    posted: chbContent.filter((c) => c.status === "Posted").length,
  }), [chbContacts, chbContent]);

  const groupedLeadCalendar = useMemo(() => {
    return [...filteredLeads]
      .filter((lead) => lead.followUpDate)
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
      .reduce((acc, lead) => {
        acc[lead.followUpDate] = acc[lead.followUpDate] || [];
        acc[lead.followUpDate].push(lead);
        return acc;
      }, {});
  }, [filteredLeads]);

  const groupedCHBCalendar = useMemo(() => {
    return [...filteredCHBContacts]
      .filter((item) => item.followUpDate)
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
      .reduce((acc, item) => {
        acc[item.followUpDate] = acc[item.followUpDate] || [];
        acc[item.followUpDate].push(item);
        return acc;
      }, {});
  }, [filteredCHBContacts]);

  function updateLead(id, updates) {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead)));
  }

  function addLeadNote(id, text) {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              history: [{ id: Date.now() + Math.random(), text, createdAt: new Date().toISOString() }, ...(lead.history || [])],
            }
          : lead
      )
    );
  }

  function updateContent(id, updates) {
    setContent((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  function updateCHBContact(id, updates) {
    setChbContacts((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  function addCHBNote(id, text) {
    setChbContacts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              history: [{ id: Date.now() + Math.random(), text, createdAt: new Date().toISOString() }, ...(item.history || [])],
            }
          : item
      )
    );
  }

  function updateCHBContent(id, updates) {
    setChbContent((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  function addLead() {
    if (!leadForm.name.trim()) return;
    setLeads((prev) => [
      {
        id: Date.now(),
        ...leadForm,
        joinedVIP: false,
        becameAffiliate: false,
        becameAmbassador: false,
        ghosted: false,
        followUpType: followUpStages.includes(leadForm.stage) ? leadForm.stage : "24 Hours",
        history: [],
        postsTouched: 0,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setLeadForm({ name: "", platform: "Facebook", stage: "New Lead", notes: "", followUpDate: todayString(), score: 5 });
    setShowLeadForm(false);
  }

  function addContent() {
    if (!contentForm.title.trim()) return;
    setContent((prev) => [{ id: Date.now(), ...contentForm }, ...prev]);
    setContentForm({ title: "", pillar: "Authority", status: "Planned", date: todayString(), notes: "" });
    setShowContentForm(false);
  }

  function addCHBContact() {
    if (!chbContactForm.name.trim()) return;
    setChbContacts((prev) => [
      {
        id: Date.now(),
        ...chbContactForm,
        infoSent: false,
        affiliate: false,
        ghosted: false,
        history: [],
      },
      ...prev,
    ]);
    setChbContactForm({ name: "", platform: "Facebook", status: "New Contact", category: "Customer Prospect", notes: "", followUpDate: todayString() });
    setShowCHBContactForm(false);
  }

  function addCHBContent() {
    if (!chbContentForm.title.trim()) return;
    setChbContent((prev) => [{ id: Date.now(), ...chbContentForm }, ...prev]);
    setChbContentForm({ title: "", pillar: "Product Post", status: "Planned", date: todayString(), notes: "" });
    setShowCHBContentForm(false);
  }

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  function exportCurrentSection() {
    if (section === "lead-os") {
      saveCSV("lead-os-export.csv", [
        ["Name", "Platform", "Stage", "Follow-up Date", "Score", "VIP", "Affiliate", "Ambassador", "Ghosted", "Notes"],
        ...filteredLeads.map((lead) => [
          lead.name, lead.platform, lead.stage, lead.followUpDate, lead.score, lead.joinedVIP, lead.becameAffiliate, lead.becameAmbassador, lead.ghosted, lead.notes,
        ]),
      ]);
      return;
    }

    saveCSV("canine-haven-export.csv", [
      ["Name", "Platform", "Status", "Category", "Follow-up Date", "Affiliate", "Info Sent", "Ghosted", "Notes"],
      ...filteredCHBContacts.map((item) => [
        item.name, item.platform, item.status, item.category, item.followUpDate, item.affiliate, item.infoSent, item.ghosted, item.notes,
      ]),
    ]);
  }

  return (
    <div className="app-shell">
      <div className="container">
        <div className="hero">
          <div>
            <div className="eyebrow">LegacyBuilt Command OS</div>
            <h1>Lead tracking, follow-up control, and Canine Haven planning in one PWA.</h1>
            <p className="hero-copy">
              This version is built to run properly on GitHub Pages, install on mobile, and give you a cleaner CRM-style workflow for Lead OS and Canine Haven Boutique.
            </p>
          </div>

          <div className="hero-actions">
            <button className={section === "lead-os" ? "tab active" : "tab"} onClick={() => setSection("lead-os")}>
              <LayoutList size={16} /> Lead OS
            </button>
            <button className={section === "chb" ? "tab active" : "tab"} onClick={() => setSection("chb")}>
              <PawPrint size={16} /> Canine Haven
            </button>
            <button className="secondary" onClick={exportCurrentSection}>
              <Download size={16} /> Export CSV
            </button>
            {installPrompt ? (
              <button onClick={handleInstall}>
                <Smartphone size={16} /> Install App
              </button>
            ) : null}
          </div>
        </div>

        <div className="card search-card">
          <div className="search-wrap">
            <Search size={16} />
            <input
              placeholder={section === "lead-os" ? "Search leads by name, stage, note, or platform" : "Search Canine Haven contacts or content"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {section === "lead-os" ? (
          <>
            <div className="stats-grid">
              <StatCard title="Total Leads" value={leadStats.total} icon={Users} />
              <StatCard title="Due Today" value={leadStats.dueToday} icon={BellRing} />
              <StatCard title="Overdue" value={leadStats.overdue} icon={CalendarClock} />
              <StatCard title="Affiliates" value={leadStats.affiliates} icon={ClipboardList} />
              <StatCard title="Ambassadors" value={leadStats.ambassadors} icon={Flag} />
              <StatCard title="Avg Score" value={leadStats.avgScore} icon={Star} />
            </div>

            <SectionHeader
              title="Lead pipeline"
              subtitle="Filter your lead flow fast and keep moving people instead of losing them."
              actions={
                <>
                  <select value={pipelineFilter} onChange={(e) => setPipelineFilter(e.target.value)}>
                    {["All", "Due Today", "Overdue", ...leadStages].map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <button onClick={() => setShowLeadForm((v) => !v)}>
                    <Plus size={16} /> Add Lead
                  </button>
                  <button className="secondary" onClick={() => setShowContentForm((v) => !v)}>
                    <Sparkles size={16} /> Add Content Item
                  </button>
                </>
              }
            />

            {showLeadForm ? (
              <div className="card form-card">
                <div className="form-grid">
                  <input placeholder="Lead name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} />
                  <input placeholder="Platform" value={leadForm.platform} onChange={(e) => setLeadForm({ ...leadForm, platform: e.target.value })} />
                  <select value={leadForm.stage} onChange={(e) => setLeadForm({ ...leadForm, stage: e.target.value })}>
                    {leadStages.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <input type="date" value={leadForm.followUpDate} onChange={(e) => setLeadForm({ ...leadForm, followUpDate: e.target.value })} />
                  <input type="number" min="1" max="10" value={leadForm.score} onChange={(e) => setLeadForm({ ...leadForm, score: Number(e.target.value || 5) })} />
                </div>
                <textarea placeholder="Notes" value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} />
                <button onClick={addLead}>Save Lead</button>
              </div>
            ) : null}

            {showContentForm ? (
              <div className="card form-card">
                <div className="form-grid">
                  <input placeholder="Post title" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} />
                  <select value={contentForm.pillar} onChange={(e) => setContentForm({ ...contentForm, pillar: e.target.value })}>
                    {contentPillars.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <select value={contentForm.status} onChange={(e) => setContentForm({ ...contentForm, status: e.target.value })}>
                    {["Planned", "Drafted", "Posted"].map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <input type="date" value={contentForm.date} onChange={(e) => setContentForm({ ...contentForm, date: e.target.value })} />
                </div>
                <textarea placeholder="Notes" value={contentForm.notes} onChange={(e) => setContentForm({ ...contentForm, notes: e.target.value })} />
                <button onClick={addContent}>Save Content Item</button>
              </div>
            ) : null}

            <div className="two-panel">
              <div className="card calendar-card">
                <h2>Follow-up calendar</h2>
                <div className="calendar-list">
                  {Object.keys(groupedLeadCalendar).length ? Object.entries(groupedLeadCalendar).map(([date, items]) => (
                    <div key={date} className="calendar-group">
                      <div className={date < today ? "calendar-date danger" : date === today ? "calendar-date on" : "calendar-date"}>
                        {date}
                      </div>
                      <div className="calendar-sublist">
                        {items.map((lead) => (
                          <div key={lead.id} className="calendar-row">
                            <div>
                              <div className="calendar-name">{lead.name}</div>
                              <div className="muted">{lead.platform} • {lead.stage}</div>
                            </div>
                            <span className="badge">Score {lead.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : <div className="empty-box">No follow-ups scheduled.</div>}
                </div>
              </div>

              <div className="card calendar-card">
                <h2>Daily content tracker</h2>
                <div className="lead-grid compact-grid">
                  {filteredContent.map((item) => (
                    <ContentCard key={item.id} item={item} pillars={contentPillars} onUpdate={updateContent} />
                  ))}
                </div>
              </div>
            </div>

            <div className="lead-grid">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onUpdate={updateLead} onAddNote={addLeadNote} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="stats-grid">
              <StatCard title="CHB Contacts" value={chbStats.contacts} icon={Users} />
              <StatCard title="CHB Affiliates" value={chbStats.affiliates} icon={ClipboardList} />
              <StatCard title="Info Sent" value={chbStats.infoSent} icon={MessageSquare} />
              <StatCard title="Dog Tips" value={chbStats.dogTips} icon={PawPrint} />
              <StatCard title="Product Posts" value={chbStats.products} icon={Flag} />
              <StatCard title="Posted" value={chbStats.posted} icon={CheckCircle2} />
            </div>

            <SectionHeader
              title="Canine Haven Boutique"
              subtitle="Track affiliate outreach, customer conversations, and dog-business content in one place."
              actions={
                <>
                  <button onClick={() => setShowCHBContactForm((v) => !v)}>
                    <Plus size={16} /> Add Contact
                  </button>
                  <button className="secondary" onClick={() => setShowCHBContentForm((v) => !v)}>
                    <Sparkles size={16} /> Add CHB Content
                  </button>
                </>
              }
            />

            {showCHBContactForm ? (
              <div className="card form-card">
                <div className="form-grid">
                  <input placeholder="Name" value={chbContactForm.name} onChange={(e) => setChbContactForm({ ...chbContactForm, name: e.target.value })} />
                  <input placeholder="Platform" value={chbContactForm.platform} onChange={(e) => setChbContactForm({ ...chbContactForm, platform: e.target.value })} />
                  <input placeholder="Status" value={chbContactForm.status} onChange={(e) => setChbContactForm({ ...chbContactForm, status: e.target.value })} />
                  <select value={chbContactForm.category} onChange={(e) => setChbContactForm({ ...chbContactForm, category: e.target.value })}>
                    {chbCategories.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <input type="date" value={chbContactForm.followUpDate} onChange={(e) => setChbContactForm({ ...chbContactForm, followUpDate: e.target.value })} />
                </div>
                <textarea placeholder="Notes" value={chbContactForm.notes} onChange={(e) => setChbContactForm({ ...chbContactForm, notes: e.target.value })} />
                <button onClick={addCHBContact}>Save Contact</button>
              </div>
            ) : null}

            {showCHBContentForm ? (
              <div className="card form-card">
                <div className="form-grid">
                  <input placeholder="Content title" value={chbContentForm.title} onChange={(e) => setChbContentForm({ ...chbContentForm, title: e.target.value })} />
                  <select value={chbContentForm.pillar} onChange={(e) => setChbContentForm({ ...chbContentForm, pillar: e.target.value })}>
                    {chbPillars.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <select value={chbContentForm.status} onChange={(e) => setChbContentForm({ ...chbContentForm, status: e.target.value })}>
                    {["Planned", "Drafted", "Posted"].map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <input type="date" value={chbContentForm.date} onChange={(e) => setChbContentForm({ ...chbContentForm, date: e.target.value })} />
                </div>
                <textarea placeholder="Notes" value={chbContentForm.notes} onChange={(e) => setChbContentForm({ ...chbContentForm, notes: e.target.value })} />
                <button onClick={addCHBContent}>Save CHB Content</button>
              </div>
            ) : null}

            <div className="two-panel">
              <div className="card calendar-card">
                <h2>Canine Haven follow-up calendar</h2>
                <div className="calendar-list">
                  {Object.keys(groupedCHBCalendar).length ? Object.entries(groupedCHBCalendar).map(([date, items]) => (
                    <div key={date} className="calendar-group">
                      <div className={date < today ? "calendar-date danger" : date === today ? "calendar-date on" : "calendar-date"}>
                        {date}
                      </div>
                      <div className="calendar-sublist">
                        {items.map((item) => (
                          <div key={item.id} className="calendar-row">
                            <div>
                              <div className="calendar-name">{item.name}</div>
                              <div className="muted">{item.platform} • {item.category}</div>
                            </div>
                            <span className={item.affiliate ? "badge on" : "badge"}>{item.affiliate ? "Affiliate" : item.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : <div className="empty-box">No CHB follow-ups scheduled.</div>}
                </div>
              </div>

              <div className="card calendar-card">
                <h2>Canine Haven content tracker</h2>
                <div className="lead-grid compact-grid">
                  {filteredCHBContent.map((item) => (
                    <ContentCard key={item.id} item={item} pillars={chbPillars} onUpdate={updateCHBContent} />
                  ))}
                </div>
              </div>
            </div>

            <div className="lead-grid">
              {filteredCHBContacts.map((item) => (
                <CHBContactCard key={item.id} item={item} onUpdate={updateCHBContact} onAddNote={addCHBNote} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
