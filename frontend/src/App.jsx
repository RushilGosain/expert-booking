import { useState, useEffect } from "react";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Fix body/html to fill screen fully
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root {
    width: 100%;
    min-height: 100vh;
    background: #0D0D14;
    font-family: 'DM Sans', sans-serif;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0D0D14; }
  ::-webkit-scrollbar-thumb { background: #2D2D3A; border-radius: 3px; }
  input, textarea, button { font-family: 'DM Sans', sans-serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .card-hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 48px rgba(139,92,246,0.18) !important;
    border-color: #8B5CF6 !important;
  }
  .btn-primary {
    transition: opacity 0.15s, transform 0.15s;
  }
  .btn-primary:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
  }
  .slot-btn {
    transition: all 0.15s;
  }
  .slot-btn:hover:not(:disabled) {
    border-color: #8B5CF6 !important;
    color: #8B5CF6 !important;
  }
`;
document.head.appendChild(globalStyle);

// ─── Constants & Mock Data ───────────────────────────────────────────────────
const CATEGORIES = ["All", "Technology", "Business", "Design", "Marketing", "Finance", "Health"];

const STATUS_CONFIG = {
  Pending:   { bg: "rgba(251,191,36,0.12)",  text: "#FCD34D", dot: "#F59E0B" },
  Confirmed: { bg: "rgba(52,211,153,0.12)",  text: "#6EE7B7", dot: "#10B981" },
  Completed: { bg: "rgba(96,165,250,0.12)",  text: "#93C5FD", dot: "#3B82F6" },
  Cancelled: { bg: "rgba(248,113,113,0.12)", text: "#FCA5A5", dot: "#EF4444" },
};

const generateSlots = () => {
  const slots = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    [["09:00","10:00"],["10:00","11:00"],["11:00","12:00"],
     ["14:00","15:00"],["15:00","16:00"],["16:00","17:00"]].forEach(([s,e]) => {
      slots.push({ date: dateStr, startTime: s, endTime: e, isBooked: Math.random() < 0.3 });
    });
  }
  return slots;
};

const MOCK_EXPERTS = [
  { _id:"1", name:"Priya Arora",       category:"Technology", experience:12, rating:4.9, reviewCount:182, hourlyRate:150, bio:"Full stack architect specializing in distributed systems and AI integration. Former Google engineer with 12 years building scalable products.", skills:["System Design","AI/ML","Cloud Architecture"], timeSlots:generateSlots() },
  { _id:"2", name:"Rushil Gosain",     category:"Business",   experience:18, rating:4.8, reviewCount:234, hourlyRate:200, bio:"Serial entrepreneur and startup advisor. Helped 40+ companies raise Series A funding across SaaS and fintech verticals.", skills:["Fundraising","Strategy","Leadership"], timeSlots:generateSlots() },
  { _id:"3", name:"Khushi Gupta",      category:"Design",     experience:9,  rating:4.7, reviewCount:156, hourlyRate:120, bio:"Product designer focused on human centered design systems. Ex Apple Design team, now consulting for Series B startups.", skills:["UX Research","Product Design","Prototyping"], timeSlots:generateSlots() },
  { _id:"4", name:"Shashank Rawat",  category:"Finance",    experience:22, rating:4.9, reviewCount:310, hourlyRate:250, bio:"Investment strategist and former Goldman Sachs VP specializing in portfolio optimization and alternative assets.", skills:["Portfolio Mgmt","Risk Analysis","Equity Research"], timeSlots:generateSlots() },
  { _id:"5", name:"Mayank Joshi",     category:"Marketing",  experience:10, rating:4.6, reviewCount:128, hourlyRate:110, bio:"Growth marketer who scaled DTC brands from 0 to $10M ARR. Expert in paid acquisition and conversion optimization.", skills:["Growth Hacking","SEO","Paid Media"], timeSlots:generateSlots() },
  { _id:"6", name:"Vansh Rawat",      category:"Technology", experience:14, rating:4.8, reviewCount:199, hourlyRate:180, bio:"Cybersecurity expert and ethical hacker. Conducted security audits for Fortune 500 companies across finance and healthcare.", skills:["Penetration Testing","Security Audits","DevSecOps"], timeSlots:generateSlots() },
  { _id:"7", name:"Siddharth Shreshta",   category:"Health",     experience:16, rating:4.9, reviewCount:271, hourlyRate:130, bio:"Integrative medicine physician and wellness coach specializing in functional medicine and preventive care programs.", skills:["Preventive Care","Nutrition","Stress Management"], timeSlots:generateSlots() },
  { _id:"8", name:"Nidhi Rawat",     category:"Business",   experience:8,  rating:4.5, reviewCount:89,  hourlyRate:100, bio:"Lean startup coach and agile transformation expert. Helped 25+ engineering teams improve velocity and ship faster.", skills:["Agile","OKRs","Team Building"], timeSlots:generateSlots() },
  { _id:"9", name:"Beema",     category:"Design",     experience:11, rating:4.7, reviewCount:143, hourlyRate:135, bio:"Motion design and brand identity specialist. Award winning creative director with clients across Japan, EU, and US.", skills:["Brand Identity","Motion Design","Visual Strategy"], timeSlots:generateSlots() },
];

let bookingsStore = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#7C3AED","#DB2777","#0891B2","#059669","#D97706","#4F46E5","#BE185D","#0284C7"];
const avatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (name) => name.split(" ").map(n => n[0]).join("").slice(0,2);
const formatDate = (ds) => new Date(ds + "T00:00:00").toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });

const Stars = ({ rating }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:2 }}>
    {[1,2,3,4,5].map(s => (
      <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#F59E0B" : "#2D2D3A"}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
    <span style={{ fontSize:12, color:"#6B7280", marginLeft:3 }}>{rating}</span>
  </span>
);

const Avatar = ({ name, size=48, radius=14 }) => (
  <div style={{
    width:size, height:size, borderRadius:radius, flexShrink:0,
    background:`linear-gradient(135deg, ${avatarColor(name)}, ${avatarColor(name)}aa)`,
    display:"flex", alignItems:"center", justifyContent:"center",
    color:"#fff", fontWeight:800, fontSize:size*0.36,
    fontFamily:"'Outfit', sans-serif", letterSpacing:"-0.02em"
  }}>{initials(name)}</div>
);

const validate = ({ userName, userEmail, userPhone }) => {
  const e = {};
  if (!userName.trim()) e.userName = "Name is required";
  if (!userEmail.trim()) e.userEmail = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(userEmail)) e.userEmail = "Enter a valid email";
  if (!userPhone.trim()) e.userPhone = "Phone is required";
  else if (!/^[\d\s+\-()+]{7,15}$/.test(userPhone)) e.userPhone = "Invalid phone number";
  return e;
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
const BackBtn = ({ onClick, label = "Back" }) => (
  <button onClick={onClick} style={{
    background:"none", border:"none", cursor:"pointer",
    color:"#8B5CF6", fontWeight:600, fontSize:14,
    display:"flex", alignItems:"center", gap:6, padding:0,
    marginBottom:28, fontFamily:"'DM Sans', sans-serif"
  }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
    {label}
  </button>
);

const CategoryPill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding:"8px 16px", borderRadius:100, border:"1px solid",
    borderColor: active ? "#8B5CF6" : "#1E1E2E",
    background: active ? "#8B5CF6" : "transparent",
    color: active ? "#fff" : "#9CA3AF",
    fontSize:13, fontWeight:600, cursor:"pointer",
    transition:"all 0.15s", whiteSpace:"nowrap"
  }}>{label}</button>
);

// ─── Expert Card ──────────────────────────────────────────────────────────────
const ExpertCard = ({ expert, onClick, delay=0 }) => (
  <div
    className="card-hover"
    onClick={() => onClick(expert)}
    style={{
      background:"#13131F",
      borderRadius:20,
      border:"1px solid #1E1E2E",
      padding:24, cursor:"pointer",
      display:"flex", flexDirection:"column", gap:16,
      animation:`fadeUp 0.4s ease both`,
      animationDelay:`${delay}ms`,
    }}
  >
    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
      <Avatar name={expert.name} size={52} radius={14} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:16, color:"#F0F0FA", fontFamily:"'Outfit', sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{expert.name}</div>
        <span style={{
          display:"inline-block", marginTop:5,
          background:"rgba(139,92,246,0.15)", color:"#A78BFA",
          padding:"2px 10px", borderRadius:100, fontSize:11, fontWeight:700, letterSpacing:"0.04em"
        }}>{expert.category.toUpperCase()}</span>
      </div>
    </div>

    <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.6, margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
      {expert.bio}
    </p>

    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <Stars rating={expert.rating} />
      <span style={{ fontSize:12, color:"#4B5563" }}>({expert.reviewCount} reviews)</span>
    </div>

    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:"1px solid #1E1E2E" }}>
      <span style={{ fontSize:13, color:"#6B7280" }}>⏳ {expert.experience} yrs exp</span>
      <span style={{ fontWeight:800, color:"#F0F0FA", fontSize:17, fontFamily:"'Outfit', sans-serif" }}>
        ${expert.hourlyRate}<span style={{ fontSize:12, color:"#6B7280", fontWeight:400 }}>/hr</span>
      </span>
    </div>

    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
      {expert.skills.slice(0,3).map(s => (
        <span key={s} style={{ background:"#1A1A28", border:"1px solid #2D2D3A", borderRadius:8, padding:"3px 10px", fontSize:12, color:"#9CA3AF" }}>{s}</span>
      ))}
    </div>
  </div>
);

// ─── Screen 1: Expert List ────────────────────────────────────────────────────
const ExpertListScreen = ({ onSelect, onMyBookings }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const LIMIT = 6;

  const filtered = MOCK_EXPERTS.filter(e => {
    const matchCat = category === "All" || e.category === category;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const paginated = filtered.slice((page-1)*LIMIT, page*LIMIT);
  const totalPages = Math.ceil(filtered.length / LIMIT);

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#0D0D14" }}>
      {/* Hero */}
      <div style={{
        background:"linear-gradient(180deg, #13131F 0%, #0D0D14 100%)",
        borderBottom:"1px solid #1E1E2E",
        padding:"60px 0 40px"
      }}>
        <div style={{ maxWidth:1140, margin:"0 auto", padding:"0 32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:20 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#8B5CF6", letterSpacing:"0.1em", marginBottom:12 }}>EXPERT SESSIONS</div>
              <h1 style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:900, color:"#F0F0FA", fontFamily:"'Outfit', sans-serif", lineHeight:1.1, margin:0 }}>
                Book a Session With<br />
                <span style={{ background:"linear-gradient(90deg,#8B5CF6,#EC4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  World Class Experts
                </span>
              </h1>
              <p style={{ color:"#6B7280", marginTop:16, fontSize:16, lineHeight:1.6 }}>
                Connect with vetted professionals for 1 on 1 expert sessions.
              </p>
            </div>
            <button onClick={onMyBookings} className="btn-primary" style={{
              background:"#1A1A28", color:"#D1D5DB", border:"1px solid #2D2D3A",
              borderRadius:14, padding:"13px 22px", fontSize:14, fontWeight:600,
              cursor:"pointer", display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              My Bookings
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1140, margin:"0 auto", padding:"32px 32px 60px" }}>
        {/* Search */}
        <div style={{ position:"relative", marginBottom:20 }}>
          <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search experts by name..."
            style={{
              width:"100%", padding:"14px 16px 14px 44px",
              background:"#13131F", border:"1px solid #1E1E2E",
              borderRadius:14, color:"#F0F0FA", fontSize:15, outline:"none",
            }}
            onFocus={e => e.target.style.borderColor="#8B5CF6"}
            onBlur={e => e.target.style.borderColor="#1E1E2E"}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
          {CATEGORIES.map(c => (
            <CategoryPill key={c} label={c} active={category===c} onClick={() => { setCategory(c); setPage(1); }} />
          ))}
        </div>

        {/* Count */}
        <div style={{ fontSize:13, color:"#4B5563", marginBottom:20 }}>
          {filtered.length} expert{filtered.length!==1?"s":""} found
        </div>

        {/* Grid */}
        {paginated.length === 0 ? (
          <div style={{ textAlign:"center", padding:"100px 0", color:"#4B5563" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#6B7280", fontFamily:"'Outfit', sans-serif" }}>No experts found</div>
            <div style={{ fontSize:14, marginTop:8 }}>Try a different name or category</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:20, marginBottom:36 }}>
            {paginated.map((e, i) => <ExpertCard key={e._id} expert={e} onClick={onSelect} delay={i*60} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
            {Array.from({ length:totalPages }, (_,i) => (
              <button key={i} onClick={() => setPage(i+1)} style={{
                width:38, height:38, borderRadius:10, border:"1px solid",
                borderColor: page===i+1 ? "#8B5CF6" : "#1E1E2E",
                background: page===i+1 ? "#8B5CF6" : "transparent",
                color: page===i+1 ? "#fff" : "#6B7280",
                fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.15s"
              }}>{i+1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Screen 2: Expert Detail ──────────────────────────────────────────────────
const ExpertDetailScreen = ({ expert, onBook, onBack, socketSlotUpdates }) => {
  const [slots, setSlots] = useState(expert.timeSlots);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (!socketSlotUpdates || socketSlotUpdates.expertId !== expert._id) return;
    setSlots(prev => prev.map(s => {
      if (s.date === socketSlotUpdates.date && `${s.startTime}-${s.endTime}` === socketSlotUpdates.timeSlot)
        return { ...s, isBooked: socketSlotUpdates.isBooked };
      return s;
    }));
  }, [socketSlotUpdates, expert._id]);

  const byDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#0D0D14" }}>
      <div style={{ maxWidth:860, margin:"0 auto", padding:"40px 32px 80px" }}>
        <BackBtn onClick={onBack} label="Back to Experts" />

        {/* Expert Hero Card */}
        <div style={{ background:"#13131F", borderRadius:24, border:"1px solid #1E1E2E", padding:32, marginBottom:24, animation:"fadeUp 0.35s ease both" }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
            <Avatar name={expert.name} size={76} radius={20} />
            <div style={{ flex:1, minWidth:200 }}>
              <h2 style={{ margin:0, fontSize:28, fontWeight:900, color:"#F0F0FA", fontFamily:"'Outfit', sans-serif" }}>{expert.name}</h2>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8, flexWrap:"wrap" }}>
                <span style={{ background:"rgba(139,92,246,0.15)", color:"#A78BFA", padding:"3px 12px", borderRadius:100, fontSize:11, fontWeight:700, letterSpacing:"0.05em" }}>{expert.category.toUpperCase()}</span>
                <Stars rating={expert.rating} />
                <span style={{ fontSize:12, color:"#4B5563" }}>({expert.reviewCount} reviews)</span>
              </div>
              <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:13, color:"#6B7280" }}>⏳ {expert.experience} years experience</span>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:34, fontWeight:900, color:"#F0F0FA", fontFamily:"'Outfit', sans-serif", lineHeight:1 }}>${expert.hourlyRate}</div>
              <div style={{ fontSize:12, color:"#6B7280", marginTop:4 }}>per hour</div>
            </div>
          </div>

          <p style={{ color:"#9CA3AF", lineHeight:1.7, margin:"20px 0 16px", fontSize:15 }}>{expert.bio}</p>

          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {expert.skills.map(s => (
              <span key={s} style={{ background:"#1A1A28", border:"1px solid #2D2D3A", borderRadius:10, padding:"5px 14px", fontSize:13, color:"#9CA3AF" }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Slots */}
        <div style={{ background:"#13131F", borderRadius:24, border:"1px solid #1E1E2E", padding:28, animation:"fadeUp 0.35s ease 0.1s both" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
            <h3 style={{ margin:0, fontSize:20, fontWeight:800, color:"#F0F0FA", fontFamily:"'Outfit', sans-serif" }}>Available Time Slots</h3>
            <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#6B7280", background:"#1A1A28", border:"1px solid #2D2D3A", padding:"5px 12px", borderRadius:8 }}>
              <span style={{ width:7, height:7, background:"#10B981", borderRadius:"50%", display:"inline-block", animation:"pulse 2s infinite" }}></span>
              Live updates enabled
            </span>
          </div>

          {Object.entries(byDate).map(([date, dateSlots]) => (
            <div key={date} style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.1em" }}>{formatDate(date)}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {dateSlots.map(slot => {
                  const key = `${slot.date}-${slot.startTime}`;
                  const isSelected = selectedSlot?.key === key;
                  return (
                    <button
                      key={key}
                      className={!slot.isBooked ? "slot-btn" : ""}
                      disabled={slot.isBooked}
                      onClick={() => setSelectedSlot(slot.isBooked ? null : { ...slot, key })}
                      style={{
                        padding:"9px 16px", borderRadius:10, fontSize:13, fontWeight:600,
                        border:"1.5px solid",
                        borderColor: slot.isBooked ? "#1E1E2E" : isSelected ? "#8B5CF6" : "#2D2D3A",
                        background: slot.isBooked ? "transparent" : isSelected ? "#8B5CF6" : "transparent",
                        color: slot.isBooked ? "#2D2D3A" : isSelected ? "#fff" : "#9CA3AF",
                        cursor: slot.isBooked ? "not-allowed" : "pointer",
                        textDecoration: slot.isBooked ? "line-through" : "none"
                      }}
                    >
                      {slot.startTime}–{slot.endTime}
                      {slot.isBooked && <span style={{ marginLeft:4, fontSize:10, opacity:0.6 }}>●</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {selectedSlot && (
            <div style={{
              marginTop:16, padding:"20px 24px",
              background:"rgba(139,92,246,0.08)", borderRadius:16,
              border:"1.5px solid rgba(139,92,246,0.3)",
              display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16
            }}>
              <div>
                <div style={{ fontWeight:700, color:"#A78BFA", fontFamily:"'Outfit', sans-serif", fontSize:15 }}>Selected Slot</div>
                <div style={{ fontSize:14, color:"#8B5CF6", marginTop:4 }}>
                  {formatDate(selectedSlot.date)} · {selectedSlot.startTime}–{selectedSlot.endTime}
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => onBook({ expert, slot: selectedSlot })}
                style={{
                  background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",
                  color:"#fff", border:"none", borderRadius:14,
                  padding:"13px 28px", fontSize:15, fontWeight:700, cursor:"pointer",
                  fontFamily:"'Outfit', sans-serif", whiteSpace:"nowrap"
                }}
              >
                Book This Slot →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Screen 3: Booking Form ───────────────────────────────────────────────────
const BookingScreen = ({ bookingContext, onBack, onSuccess }) => {
  const { expert, slot } = bookingContext;
  const [form, setForm] = useState({ userName:"", userEmail:"", userPhone:"", notes:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]:"" }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const booking = {
      id: Date.now().toString(),
      expertId: expert._id, expertName: expert.name, expertCategory: expert.category,
      date: slot.date, timeSlot:`${slot.startTime}-${slot.endTime}`,
      status:"Pending", createdAt: new Date().toISOString(), ...form,
    };
    bookingsStore.push(booking);
    const exp = MOCK_EXPERTS.find(e => e._id === expert._id);
    if (exp) { const s = exp.timeSlots.find(s => s.date===slot.date && s.startTime===slot.startTime); if(s) s.isBooked=true; }
    setLoading(false);
    setDone(true);
    setTimeout(() => onSuccess(form.userEmail), 2000);
  };

  const inputStyle = (field) => ({
    width:"100%", padding:"13px 16px",
    background:"#1A1A28", border:`1.5px solid ${errors[field]?"#EF4444":"#2D2D3A"}`,
    borderRadius:12, color:"#F0F0FA", fontSize:15, outline:"none",
  });

  if (done) return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#0D0D14", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", padding:"0 24px", animation:"fadeUp 0.4s ease both" }}>
        <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
        <h2 style={{ fontFamily:"'Outfit', sans-serif", fontSize:32, fontWeight:900, color:"#F0F0FA", margin:"0 0 12px" }}>Booking Confirmed!</h2>
        <p style={{ color:"#6B7280", lineHeight:1.7, fontSize:15, maxWidth:400 }}>
          Your session with <strong style={{ color:"#A78BFA" }}>{expert.name}</strong> is booked for {formatDate(slot.date)} at {slot.startTime}–{slot.endTime}.
        </p>
        <div style={{ marginTop:24, padding:"12px 24px", background:"rgba(139,92,246,0.1)", borderRadius:12, display:"inline-flex", alignItems:"center", gap:8, color:"#8B5CF6", fontWeight:600, border:"1px solid rgba(139,92,246,0.2)" }}>
          <span style={{ width:8, height:8, background:"#8B5CF6", borderRadius:"50%", animation:"pulse 1s infinite" }}></span>
          Redirecting to your bookings...
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#0D0D14" }}>
      <div style={{ maxWidth:580, margin:"0 auto", padding:"40px 32px 80px" }}>
        <BackBtn onClick={onBack} label="Back to Expert" />

        <div style={{ background:"#13131F", borderRadius:24, border:"1px solid #1E1E2E", padding:36, animation:"fadeUp 0.35s ease both" }}>
          <h2 style={{ margin:"0 0 6px", fontSize:26, fontWeight:900, color:"#F0F0FA", fontFamily:"'Outfit', sans-serif" }}>Book a Session</h2>
          <p style={{ color:"#6B7280", fontSize:14, marginBottom:24 }}>Fill in your details below to confirm the booking.</p>

          {/* Slot preview */}
          <div style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", background:"rgba(139,92,246,0.08)", borderRadius:14, border:"1px solid rgba(139,92,246,0.2)", marginBottom:28 }}>
            <Avatar name={expert.name} size={44} radius={12} />
            <div>
              <div style={{ fontWeight:700, color:"#F0F0FA", fontSize:15, fontFamily:"'Outfit', sans-serif" }}>{expert.name}</div>
              <div style={{ fontSize:13, color:"#8B5CF6", marginTop:2 }}>{formatDate(slot.date)} · {slot.startTime}–{slot.endTime}</div>
            </div>
            <div style={{ marginLeft:"auto", fontWeight:800, color:"#F0F0FA", fontFamily:"'Outfit', sans-serif" }}>${expert.hourlyRate}</div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {[
              { label:"Full Name", field:"userName", type:"text", ph:"Jane Smith" },
              { label:"Email Address", field:"userEmail", type:"email", ph:"jane@email.com" },
              { label:"Phone Number", field:"userPhone", type:"tel", ph:"+1 555 000 0000" },
            ].map(({ label, field, type, ph }) => (
              <div key={field}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#9CA3AF", marginBottom:7 }}>{label} <span style={{ color:"#8B5CF6" }}>*</span></label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={handleChange(field)}
                  placeholder={ph}
                  style={inputStyle(field)}
                  onFocus={e => { if(!errors[field]) e.target.style.borderColor="#8B5CF6"; }}
                  onBlur={e => { if(!errors[field]) e.target.style.borderColor="#2D2D3A"; }}
                />
                {errors[field] && <span style={{ fontSize:12, color:"#EF4444", marginTop:4, display:"block" }}>{errors[field]}</span>}
              </div>
            ))}

            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#9CA3AF", marginBottom:7 }}>
                Notes <span style={{ color:"#4B5563", fontWeight:400 }}>(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={handleChange("notes")}
                placeholder="What would you like to discuss in this session?"
                rows={4}
                style={{ ...inputStyle("notes"), resize:"vertical", lineHeight:1.6 }}
                onFocus={e => e.target.style.borderColor="#8B5CF6"}
                onBlur={e => e.target.style.borderColor="#2D2D3A"}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginTop:8, padding:"15px", borderRadius:14, border:"none",
                background: loading ? "#4C1D95" : "linear-gradient(135deg,#8B5CF6,#6D28D9)",
                color:"#fff", fontSize:16, fontWeight:700, cursor: loading?"not-allowed":"pointer",
                fontFamily:"'Outfit', sans-serif",
              }}
            >
              {loading ? "⏳ Confirming your session..." : "Confirm Booking →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Screen 4: My Bookings ────────────────────────────────────────────────────
const MyBookingsScreen = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(false);
  const [bookings, setBookings] = useState([]);

  const search = () => {
    setBookings(bookingsStore.filter(b => b.userEmail.toLowerCase() === email.toLowerCase().trim()));
    setSearched(true);
  };

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#0D0D14" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"40px 32px 80px" }}>
        <BackBtn onClick={onBack} label="Back to Experts" />

        <h2 style={{ margin:"0 0 8px", fontSize:30, fontWeight:900, color:"#F0F0FA", fontFamily:"'Outfit', sans-serif" }}>My Bookings</h2>
        <p style={{ color:"#6B7280", fontSize:14, marginBottom:28 }}>Enter your email to view your scheduled sessions.</p>

        <div style={{ display:"flex", gap:10, marginBottom:36 }}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key==="Enter" && search()}
            placeholder="Enter your email address"
            type="email"
            style={{
              flex:1, padding:"13px 16px",
              background:"#13131F", border:"1px solid #1E1E2E",
              borderRadius:14, color:"#F0F0FA", fontSize:15, outline:"none",
            }}
            onFocus={e => e.target.style.borderColor="#8B5CF6"}
            onBlur={e => e.target.style.borderColor="#1E1E2E"}
          />
          <button onClick={search} className="btn-primary" style={{
            background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",
            color:"#fff", border:"none", borderRadius:14,
            padding:"13px 26px", fontSize:15, fontWeight:700, cursor:"pointer",
            fontFamily:"'Outfit', sans-serif", whiteSpace:"nowrap"
          }}>Search</button>
        </div>

        {searched && bookings.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 0", animation:"fadeUp 0.35s ease both" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#4B5563", fontFamily:"'Outfit', sans-serif" }}>No bookings found</div>
            <div style={{ fontSize:14, color:"#374151", marginTop:8 }}>No sessions booked with this email yet.</div>
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {bookings.map((b, i) => {
            const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.Pending;
            return (
              <div key={b.id} style={{
                background:"#13131F", border:"1px solid #1E1E2E", borderRadius:18,
                padding:"20px 24px",
                display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14,
                animation:`fadeUp 0.35s ease ${i*60}ms both`
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <Avatar name={b.expertName} size={48} radius={12} />
                  <div>
                    <div style={{ fontWeight:700, color:"#F0F0FA", fontFamily:"'Outfit', sans-serif", fontSize:16 }}>{b.expertName}</div>
                    <div style={{ fontSize:13, color:"#6B7280", marginTop:3 }}>{formatDate(b.date)} · {b.timeSlot.replace("-","–")}</div>
                    <div style={{ fontSize:11, color:"#374151", marginTop:2 }}>Booked {new Date(b.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <span style={{
                  background:sc.bg, color:sc.text,
                  padding:"5px 14px", borderRadius:100, fontSize:12, fontWeight:700,
                  display:"inline-flex", alignItems:"center", gap:6
                }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:sc.dot, display:"inline-block" }}></span>
                  {b.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("list");
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [bookingContext, setBookingContext] = useState(null);
  const [socketUpdate, setSocketUpdate] = useState(null);

  // Simulate real-time slot updates
  useEffect(() => {
    const interval = setInterval(() => {
      const expert = MOCK_EXPERTS[Math.floor(Math.random() * MOCK_EXPERTS.length)];
      const freeSlots = expert.timeSlots.filter(s => !s.isBooked);
      if (!freeSlots.length) return;
      const slot = freeSlots[Math.floor(Math.random() * freeSlots.length)];
      slot.isBooked = true;
      setSocketUpdate({ expertId:expert._id, date:slot.date, timeSlot:`${slot.startTime}-${slot.endTime}`, isBooked:true, _ts:Date.now() });
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#0D0D14" }}>
      {/* Top Nav */}
      <nav style={{
        background:"rgba(13,13,20,0.85)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid #1E1E2E",
        position:"sticky", top:0, zIndex:100, width:"100%"
      }}>
        <div style={{ maxWidth:1140, margin:"0 auto", padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div onClick={() => setScreen("list")} style={{ fontFamily:"'Outfit', sans-serif", fontSize:20, fontWeight:900, color:"#F0F0FA", cursor:"pointer", letterSpacing:"-0.03em", userSelect:"none" }}>
            expert<span style={{ color:"#8B5CF6" }}>.</span>book
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#4B5563" }}>
            <span style={{ width:7, height:7, background:"#10B981", borderRadius:"50%", display:"inline-block", animation:"pulse 2s infinite" }}></span>
            Real time
          </div>
        </div>
      </nav>

      {screen === "list" && (
        <ExpertListScreen
          onSelect={e => { setSelectedExpert(e); setScreen("detail"); }}
          onMyBookings={() => setScreen("bookings")}
        />
      )}
      {screen === "detail" && selectedExpert && (
        <ExpertDetailScreen
          expert={selectedExpert}
          onBack={() => setScreen("list")}
          onBook={ctx => { setBookingContext(ctx); setScreen("booking"); }}
          socketSlotUpdates={socketUpdate}
        />
      )}
      {screen === "booking" && bookingContext && (
        <BookingScreen
          bookingContext={bookingContext}
          onBack={() => setScreen("detail")}
          onSuccess={() => setScreen("bookings")}
        />
      )}
      {screen === "bookings" && (
        <MyBookingsScreen onBack={() => setScreen("list")} />
      )}
    </div>
  );
}