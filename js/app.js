
const STORAGE = {
  lwaLeads: "lb_restore_lwa_leads",
  lwaContent: "lb_restore_lwa_content",
  chbLeads: "lb_restore_chb_leads",
  chbContent: "lb_restore_chb_content",
  todos: "lb_restore_todos",
};

const STAGES = ["New Lead","Conversation Started","24 Hours","48 Hours","72 Hours","30 Day","VIP Joined","Affiliate","Ambassador","Ghosted","Closed"];
const FLOW_STAGES = ["24 Hours","48 Hours","72 Hours","30 Day","Ghosted"];
const CONTENT_PLATFORMS = ["Facebook","TikTok","Instagram"];
const LWA_PILLARS = ["Authority","Story","Offer","Objection","Engagement"];
const CHB_PILLARS = ["Product Post","Dog Tips","Affiliate Post","Customer Story","Engagement Post"];

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installBtn").classList.remove("hidden");
});

document.getElementById("installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  await deferredPrompt.prompt();
  deferredPrompt = null;
  document.getElementById("installBtn").classList.add("hidden");
});

const today = () => new Date().toISOString().slice(0,10);
function load(key, fallback){ try{ return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch{ return fallback; } }
function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function id(){ return Date.now() + Math.floor(Math.random()*1000); }

function csvDownload(filename, rows){
  const csv = rows.map(r => r.map(v => `"${String(v ?? "").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

let state = {
  section: "lwa",
  query: "",
  lwaFilter: "All",
  chbFilter: "All",
  calendarDate: today(),
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),
  lwaLeads: load(STORAGE.lwaLeads, [
    {id:id(),name:"Sarah M.",platform:"Facebook",stage:"24 Hours",followDate:today(),score:7,joinedVIP:true,becameAffiliate:false,becameAmbassador:false,ghosted:false,notes:"Watched the overview.",history:[{id:id(),text:"Sent first follow-up.",createdAt:new Date().toISOString()}]},
    {id:id(),name:"Jen K.",platform:"TikTok",stage:"Ghosted",followDate:today(),score:3,joinedVIP:false,becameAffiliate:false,becameAmbassador:false,ghosted:true,notes:"Opened then disappeared.",history:[]},
  ]),
  lwaContent: load(STORAGE.lwaContent, [
    {id:id(),title:"What digital marketing actually is",platform:"TikTok",pillar:"Authority",status:"Drafted",date:today(),touches:1,notes:"Simple explanation."},
  ]),
  chbLeads: load(STORAGE.chbLeads, [
    {id:id(),name:"Megan P.",platform:"Facebook",stage:"48 Hours",followDate:today(),score:6,joinedVIP:false,becameAffiliate:false,becameAmbassador:false,ghosted:false,notes:"Asked about boutique products.",history:[{id:id(),text:"Sent intro message.",createdAt:new Date().toISOString()}]},
  ]),
  chbContent: load(STORAGE.chbContent, [
    {id:id(),title:"German Shepherd tumbler spotlight",platform:"Facebook",pillar:"Product Post",status:"Planned",date:today(),touches:0,notes:"Lifestyle angle."},
  ]),
  todos: load(STORAGE.todos, [
    {id:id(),title:"Follow up with Sarah",business:"LWA",date:today(),priority:"High",notes:"Check if she watched the overview.",done:false},
  ]),
};

function persist(){
  save(STORAGE.lwaLeads, state.lwaLeads);
  save(STORAGE.lwaContent, state.lwaContent);
  save(STORAGE.chbLeads, state.chbLeads);
  save(STORAGE.chbContent, state.chbContent);
  save(STORAGE.todos, state.todos);
}

function fillSelect(idName, options){
  const el = document.getElementById(idName);
  el.innerHTML = options.map(o => `<option value="${o}">${o}</option>`).join("");
}
["lwaLeadStage","chbLeadStage"].forEach(idName => fillSelect(idName, STAGES));
["lwaContentPlatform","chbContentPlatform"].forEach(idName => fillSelect(idName, CONTENT_PLATFORMS));
fillSelect("lwaContentPillar", LWA_PILLARS);
fillSelect("chbContentPillar", CHB_PILLARS);

document.getElementById("lwaLeadFollowDate").value = today();
document.getElementById("chbLeadFollowDate").value = today();
document.getElementById("lwaContentDate").value = today();
document.getElementById("chbContentDate").value = today();
document.getElementById("todoDate").value = today();

document.querySelectorAll(".seg").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.section = btn.dataset.section;
    document.getElementById("lwaSection").classList.toggle("hidden", state.section !== "lwa");
    document.getElementById("chbSection").classList.toggle("hidden", state.section !== "chb");
    document.getElementById("calendarSection").classList.toggle("hidden", state.section !== "calendar");
    document.getElementById("todoSection").classList.toggle("hidden", state.section !== "todo");
    render();
  });
});

document.getElementById("searchInput").addEventListener("input", (e) => { state.query = e.target.value.toLowerCase(); render(); });

document.getElementById("lwaFilter").addEventListener("change", (e) => { state.lwaFilter = e.target.value; render(); });
document.getElementById("chbFilter").addEventListener("change", (e) => { state.chbFilter = e.target.value; render(); });

function toggle(idName){ document.getElementById(idName).classList.toggle("hidden"); }
document.getElementById("toggleLwaLeadForm").onclick = () => toggle("lwaLeadForm");
document.getElementById("toggleLwaContentForm").onclick = () => toggle("lwaContentForm");
document.getElementById("toggleChbLeadForm").onclick = () => toggle("chbLeadForm");
document.getElementById("toggleChbContentForm").onclick = () => toggle("chbContentForm");

document.getElementById("saveLwaLead").onclick = () => {
  const item = {
    id:id(), name:document.getElementById("lwaLeadName").value.trim(), platform:document.getElementById("lwaLeadPlatform").value.trim(),
    stage:document.getElementById("lwaLeadStage").value, followDate:document.getElementById("lwaLeadFollowDate").value || today(),
    score:Number(document.getElementById("lwaLeadScore").value || 5), joinedVIP:document.getElementById("lwaLeadVIP").checked,
    becameAffiliate:document.getElementById("lwaLeadAffiliate").checked, becameAmbassador:document.getElementById("lwaLeadAmbassador").checked,
    ghosted:document.getElementById("lwaLeadGhosted").checked, notes:document.getElementById("lwaLeadNotes").value.trim(), history:[]
  };
  if(!item.name) return;
  if(item.ghosted) item.stage = "Ghosted";
  state.lwaLeads.unshift(item); persist(); render();
};

document.getElementById("saveChbLead").onclick = () => {
  const item = {
    id:id(), name:document.getElementById("chbLeadName").value.trim(), platform:document.getElementById("chbLeadPlatform").value.trim(),
    stage:document.getElementById("chbLeadStage").value, followDate:document.getElementById("chbLeadFollowDate").value || today(),
    score:Number(document.getElementById("chbLeadScore").value || 5), joinedVIP:document.getElementById("chbLeadVIP").checked,
    becameAffiliate:document.getElementById("chbLeadAffiliate").checked, becameAmbassador:document.getElementById("chbLeadAmbassador").checked,
    ghosted:document.getElementById("chbLeadGhosted").checked, notes:document.getElementById("chbLeadNotes").value.trim(), history:[]
  };
  if(!item.name) return;
  if(item.ghosted) item.stage = "Ghosted";
  state.chbLeads.unshift(item); persist(); render();
};

document.getElementById("saveLwaContent").onclick = () => {
  const item = {
    id:id(), title:document.getElementById("lwaContentTitle").value.trim(), platform:document.getElementById("lwaContentPlatform").value,
    pillar:document.getElementById("lwaContentPillar").value, status:document.getElementById("lwaContentStatus").value,
    date:document.getElementById("lwaContentDate").value || today(), touches:Number(document.getElementById("lwaContentTouches").value || 0),
    notes:document.getElementById("lwaContentNotes").value.trim()
  };
  if(!item.title) return;
  state.lwaContent.unshift(item); persist(); render();
};

document.getElementById("saveChbContent").onclick = () => {
  const item = {
    id:id(), title:document.getElementById("chbContentTitle").value.trim(), platform:document.getElementById("chbContentPlatform").value,
    pillar:document.getElementById("chbContentPillar").value, status:document.getElementById("chbContentStatus").value,
    date:document.getElementById("chbContentDate").value || today(), touches:Number(document.getElementById("chbContentTouches").value || 0),
    notes:document.getElementById("chbContentNotes").value.trim()
  };
  if(!item.title) return;
  state.chbContent.unshift(item); persist(); render();
};

document.getElementById("saveTodo").onclick = () => {
  const item = {
    id:id(), title:document.getElementById("todoTitle").value.trim(), business:document.getElementById("todoBusiness").value,
    date:document.getElementById("todoDate").value || today(), priority:document.getElementById("todoPriority").value,
    notes:document.getElementById("todoNotes").value.trim(), done:false
  };
  if(!item.title) return;
  state.todos.unshift(item); persist(); render();
};

document.getElementById("exportBtn").onclick = () => {
  if(state.section === "lwa"){
    csvDownload("lwa-leads.csv", [["Name","Platform","Stage","Follow Date","Score","VIP","Affiliate","Ambassador","Ghosted","Notes"], ...filteredLeads(state.lwaLeads, state.lwaFilter).map(x => [x.name,x.platform,x.stage,x.followDate,x.score,x.joinedVIP,x.becameAffiliate,x.becameAmbassador,x.ghosted,x.notes])]);
  }else if(state.section === "chb"){
    csvDownload("canine-haven-leads.csv", [["Name","Platform","Stage","Follow Date","Score","VIP","Affiliate","Ambassador","Ghosted","Notes"], ...filteredLeads(state.chbLeads, state.chbFilter).map(x => [x.name,x.platform,x.stage,x.followDate,x.score,x.joinedVIP,x.becameAffiliate,x.becameAmbassador,x.ghosted,x.notes])]);
  }else if(state.section === "todo"){
    csvDownload("todo-list.csv", [["Title","Business","Date","Priority","Done","Notes"], ...state.todos.map(x => [x.title,x.business,x.date,x.priority,x.done,x.notes])]);
  }
};

document.getElementById("prevMonthBtn").onclick = () => { state.calendarMonth -= 1; if(state.calendarMonth < 0){ state.calendarMonth = 11; state.calendarYear -= 1; } render(); };
document.getElementById("nextMonthBtn").onclick = () => { state.calendarMonth += 1; if(state.calendarMonth > 11){ state.calendarMonth = 0; state.calendarYear += 1; } render(); };

function filteredLeads(arr, filter){
  return arr.filter(item => {
    const q = state.query;
    const matchesSearch = !q || [item.name,item.platform,item.stage,item.notes].join(" ").toLowerCase().includes(q);
    let matchesFilter = true;
    if(filter === "Due Today") matchesFilter = item.followDate === today();
    else if(filter === "Overdue") matchesFilter = item.followDate < today();
    else if(filter === "Affiliate") matchesFilter = item.becameAffiliate;
    else if(filter === "Ambassador") matchesFilter = item.becameAmbassador;
    else if(filter === "VIP Joined") matchesFilter = item.joinedVIP;
    else if(filter === "Ghosted") matchesFilter = item.ghosted || item.stage === "Ghosted";
    else if(filter !== "All") matchesFilter = item.stage === filter;
    return matchesSearch && matchesFilter;
  });
}

function filteredContent(arr){
  return arr.filter(item => {
    const q = state.query;
    return !q || [item.title,item.platform,item.pillar,item.status,item.notes].join(" ").toLowerCase().includes(q);
  });
}

function statBox(label, value){ return `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`; }

function renderStats(){
  const lwa = state.lwaLeads, lwaContent = state.lwaContent;
  document.getElementById("lwaStats").innerHTML = [statBox("Total Leads", lwa.length), statBox("24 Hr", lwa.filter(x => x.stage === "24 Hours").length), statBox("48 Hr", lwa.filter(x => x.stage === "48 Hours").length), statBox("72 Hr", lwa.filter(x => x.stage === "72 Hours").length), statBox("30 Day", lwa.filter(x => x.stage === "30 Day").length), statBox("Ghosted", lwa.filter(x => x.ghosted || x.stage === "Ghosted").length), statBox("VIP Joined", lwa.filter(x => x.joinedVIP).length), statBox("Content Items", lwaContent.length)].join("");
  const chb = state.chbLeads, chbContent = state.chbContent;
  document.getElementById("chbStats").innerHTML = [statBox("Total Contacts", chb.length), statBox("24 Hr", chb.filter(x => x.stage === "24 Hours").length), statBox("48 Hr", chb.filter(x => x.stage === "48 Hours").length), statBox("72 Hr", chb.filter(x => x.stage === "72 Hours").length), statBox("30 Day", chb.filter(x => x.stage === "30 Day").length), statBox("Ghosted", chb.filter(x => x.ghosted || x.stage === "Ghosted").length), statBox("VIP Joined", chb.filter(x => x.joinedVIP).length), statBox("Content Items", chbContent.length)].join("");
  const todos = state.todos;
  document.getElementById("todoStats").innerHTML = [statBox("All Tasks", todos.length), statBox("Due Today", todos.filter(x => x.date === today()).length), statBox("Done", todos.filter(x => x.done).length), statBox("Open", todos.filter(x => !x.done).length)].join("");
}

function renderFlow(elId, arr, prefix){
  const container = document.getElementById(elId);
  container.innerHTML = FLOW_STAGES.map(stage => {
    const items = arr.filter(x => x.stage === stage || (stage === "Ghosted" && (x.ghosted || x.stage === "Ghosted")));
    return `<div class="flow-col"><h3>${stage}</h3><div class="flow-stack">${items.length ? items.map(item => `<div class="flow-card"><div class="inline"><strong>${escapeHtml(item.name)}</strong><span class="badge">${escapeHtml(item.platform)}</span></div><div class="small muted">${item.followDate}</div><div class="inline" style="margin-top:8px"><select onchange="moveStage('${prefix}', ${item.id}, this.value)">${STAGES.map(s => `<option value="${s}" ${s===item.stage?"selected":""}>${s}</option>`).join("")}</select></div></div>`).join("") : `<div class="small muted">Nothing here.</div>`}</div></div>`;
  }).join("");
}

function renderQuickCalendar(elId, arr){
  const container = document.getElementById(elId);
  const sorted = [...arr].sort((a,b) => a.followDate.localeCompare(b.followDate));
  const groups = {};
  sorted.forEach(item => { if(!groups[item.followDate]) groups[item.followDate] = []; groups[item.followDate].push(item); });
  container.innerHTML = Object.keys(groups).length ? Object.entries(groups).map(([date, items]) => `<div class="calendar-stack"><div class="calendar-date">${date}</div>${items.map(item => `<div class="calendar-item"><div class="calendar-head"><strong>${item.name}</strong><span class="badge">${item.stage}</span>${item.becameAffiliate ? '<span class="badge on">Affiliate</span>' : ''}${item.becameAmbassador ? '<span class="badge on">Ambassador</span>' : ''}</div><div class="small muted">${item.platform}</div></div>`).join("")}</div>`).join("") : `<div class="item">No follow-ups scheduled.</div>`;
}

function contentCard(item, prefix, pillars){
  return `<div class="item"><div class="inline"><strong>${item.title}</strong><span class="badge platform">${item.platform}</span><span class="badge">${item.pillar}</span><span class="badge ${item.status === "Posted" ? "success" : ""}">${item.status}</span></div><div class="grid two" style="margin-top:10px"><input data-content-title="${prefix}-${item.id}" value="${escapeHtml(item.title)}" /><select data-content-platform="${prefix}-${item.id}">${CONTENT_PLATFORMS.map(p => `<option value="${p}" ${p===item.platform?"selected":""}>${p}</option>`).join("")}</select><select data-content-pillar="${prefix}-${item.id}">${pillars.map(p => `<option value="${p}" ${p===item.pillar?"selected":""}>${p}</option>`).join("")}</select><select data-content-status="${prefix}-${item.id}">${["Planned","Drafted","Posted"].map(s => `<option value="${s}" ${s===item.status?"selected":""}>${s}</option>`).join("")}</select><input type="date" data-content-date="${prefix}-${item.id}" value="${item.date}" /><input type="number" min="0" data-content-touches="${prefix}-${item.id}" value="${item.touches}" /></div><textarea data-content-notes="${prefix}-${item.id}" placeholder="Notes">${escapeHtml(item.notes || "")}</textarea><div class="inline"><button onclick="saveContentItem('${prefix}', ${item.id})">Save</button><button class="secondary" onclick="updateContentTouches('${prefix}', ${item.id}, 1)">+1 Touch</button></div></div>`;
}

function renderContent(elId, arr, prefix, pillars){
  const container = document.getElementById(elId);
  container.innerHTML = filteredContent(arr).map(item => contentCard(item, prefix, pillars)).join("") || `<div class="item">No content yet.</div>`;
}

function leadCard(item, type){
  const prefix = type;
  return `<div class="item"><div class="inline"><strong>${item.name}</strong><span class="badge">${item.platform}</span><span class="badge">${item.stage}</span><span class="badge">Score ${item.score}</span></div><div class="badges">${item.joinedVIP ? '<span class="badge on">VIP</span>' : '<span class="badge">VIP</span>'}${item.becameAffiliate ? '<span class="badge on">Affiliate</span>' : '<span class="badge">Affiliate</span>'}${item.becameAmbassador ? '<span class="badge on">Ambassador</span>' : '<span class="badge">Ambassador</span>'}${item.ghosted || item.stage === "Ghosted" ? '<span class="badge danger">Ghosted</span>' : '<span class="badge">Ghosted</span>'}</div><div class="grid two"><input data-field="${prefix}-name-${item.id}" value="${escapeHtml(item.name)}" /><input data-field="${prefix}-platform-${item.id}" value="${escapeHtml(item.platform)}" /><select data-field="${prefix}-stage-${item.id}">${STAGES.map(s => `<option value="${s}" ${s===item.stage?"selected":""}>${s}</option>`).join("")}</select><input type="date" data-field="${prefix}-followDate-${item.id}" value="${item.followDate}" /><input type="number" min="1" max="10" data-field="${prefix}-score-${item.id}" value="${item.score}" /></div><div class="checks"><label><input type="checkbox" data-field="${prefix}-vip-${item.id}" ${item.joinedVIP?"checked":""}/> Joined FB VIP</label><label><input type="checkbox" data-field="${prefix}-aff-${item.id}" ${item.becameAffiliate?"checked":""}/> Affiliate</label><label><input type="checkbox" data-field="${prefix}-amb-${item.id}" ${item.becameAmbassador?"checked":""}/> Ambassador</label><label><input type="checkbox" data-field="${prefix}-ghost-${item.id}" ${(item.ghosted || item.stage === "Ghosted")?"checked":""}/> Ghosted</label></div><textarea data-field="${prefix}-notes-${item.id}" placeholder="Notes">${escapeHtml(item.notes || "")}</textarea><div class="inline"><button onclick="saveLeadCard('${prefix}', ${item.id})">Save</button><button class="secondary" onclick="deleteLeadCard('${prefix}', ${item.id})">Delete</button></div><div class="notes-box"><div class="small muted">Running notes</div><div class="notes-list">${(item.history || []).map(note => `<div class="note"><div>${escapeHtml(note.text)}</div><div class="small muted">${new Date(note.createdAt).toLocaleString()}</div></div>`).join("") || '<div class="note">No notes yet.</div>'}</div><textarea data-note="${prefix}-${item.id}" placeholder="Add follow-up note..."></textarea><button class="secondary" onclick="addRunningNote('${prefix}', ${item.id})">Add Note</button></div></div>`;
}

function escapeHtml(str){ return String(str ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }

window.moveStage = function(prefix, idVal, stage){
  const arr = prefix === "lwa" ? state.lwaLeads : state.chbLeads;
  const item = arr.find(x => x.id === idVal);
  if(!item) return;
  item.stage = stage;
  item.ghosted = stage === "Ghosted" ? true : item.ghosted;
  persist(); render();
}

window.saveLeadCard = function(prefix, idVal){
  const arr = prefix === "lwa" ? state.lwaLeads : state.chbLeads;
  const item = arr.find(x => x.id === idVal);
  if(!item) return;
  item.name = document.querySelector(`[data-field="${prefix}-name-${idVal}"]`).value;
  item.platform = document.querySelector(`[data-field="${prefix}-platform-${idVal}"]`).value;
  item.stage = document.querySelector(`[data-field="${prefix}-stage-${idVal}"]`).value;
  item.followDate = document.querySelector(`[data-field="${prefix}-followDate-${idVal}"]`).value;
  item.score = Number(document.querySelector(`[data-field="${prefix}-score-${idVal}"]`).value || 5);
  item.joinedVIP = document.querySelector(`[data-field="${prefix}-vip-${idVal}"]`).checked;
  item.becameAffiliate = document.querySelector(`[data-field="${prefix}-aff-${idVal}"]`).checked;
  item.becameAmbassador = document.querySelector(`[data-field="${prefix}-amb-${idVal}"]`).checked;
  item.ghosted = document.querySelector(`[data-field="${prefix}-ghost-${idVal}"]`).checked;
  if(item.ghosted) item.stage = "Ghosted";
  item.notes = document.querySelector(`[data-field="${prefix}-notes-${idVal}"]`).value;
  persist(); render();
}

window.deleteLeadCard = function(prefix, idVal){
  if(prefix === "lwa") state.lwaLeads = state.lwaLeads.filter(x => x.id !== idVal);
  else state.chbLeads = state.chbLeads.filter(x => x.id !== idVal);
  persist(); render();
}

window.addRunningNote = function(prefix, idVal){
  const textarea = document.querySelector(`[data-note="${prefix}-${idVal}"]`);
  const text = textarea.value.trim();
  if(!text) return;
  const arr = prefix === "lwa" ? state.lwaLeads : state.chbLeads;
  const item = arr.find(x => x.id === idVal);
  item.history = item.history || [];
  item.history.unshift({id:id(),text,createdAt:new Date().toISOString()});
  textarea.value = "";
  persist(); render();
}

window.saveContentItem = function(prefix, idVal){
  const arr = prefix === "lwa" ? state.lwaContent : state.chbContent;
  const item = arr.find(x => x.id === idVal);
  if(!item) return;
  item.title = document.querySelector(`[data-content-title="${prefix}-${idVal}"]`).value;
  item.platform = document.querySelector(`[data-content-platform="${prefix}-${idVal}"]`).value;
  item.pillar = document.querySelector(`[data-content-pillar="${prefix}-${idVal}"]`).value;
  item.status = document.querySelector(`[data-content-status="${prefix}-${idVal}"]`).value;
  item.date = document.querySelector(`[data-content-date="${prefix}-${idVal}"]`).value;
  item.touches = Number(document.querySelector(`[data-content-touches="${prefix}-${idVal}"]`).value || 0);
  item.notes = document.querySelector(`[data-content-notes="${prefix}-${idVal}"]`).value;
  persist(); render();
}

window.updateContentTouches = function(prefix, idVal, amount){
  const arr = prefix === "lwa" ? state.lwaContent : state.chbContent;
  const item = arr.find(x => x.id === idVal);
  item.touches = Number(item.touches || 0) + amount;
  persist(); render();
}

window.toggleTodoDone = function(idVal){
  const item = state.todos.find(x => x.id === idVal);
  if(!item) return;
  item.done = !item.done;
  persist(); render();
}

window.deleteTodo = function(idVal){
  state.todos = state.todos.filter(x => x.id !== idVal);
  persist(); render();
}

function renderLeads(elId, arr, filter, prefix){ document.getElementById(elId).innerHTML = filteredLeads(arr, filter).map(item => leadCard(item, prefix)).join("") || `<div class="item">No matching leads.</div>`; }

function getAllCalendarItems(){ return [...state.lwaLeads.map(x => ({...x, business:"LWA"})), ...state.chbLeads.map(x => ({...x, business:"Canine Haven"}))]; }

function renderMonthCalendar(){
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  document.getElementById("monthLabel").textContent = `${monthNames[state.calendarMonth]} ${state.calendarYear}`;
  const grid = document.getElementById("monthGrid"); grid.innerHTML = "";
  const firstDay = new Date(state.calendarYear, state.calendarMonth, 1), lastDay = new Date(state.calendarYear, state.calendarMonth + 1, 0), startWeekday = firstDay.getDay(), daysInMonth = lastDay.getDate(), prevLastDay = new Date(state.calendarYear, state.calendarMonth, 0).getDate();
  const items = getAllCalendarItems(), totalCells = 42;
  for(let i = 0; i < totalCells; i++){
    let dayNumber = "", cellDate = "", muted = false;
    if(i < startWeekday){ dayNumber = prevLastDay - startWeekday + i + 1; const d = new Date(state.calendarYear, state.calendarMonth - 1, dayNumber); cellDate = d.toISOString().slice(0,10); muted = true; }
    else if(i >= startWeekday + daysInMonth){ dayNumber = i - (startWeekday + daysInMonth) + 1; const d = new Date(state.calendarYear, state.calendarMonth + 1, dayNumber); cellDate = d.toISOString().slice(0,10); muted = true; }
    else { dayNumber = i - startWeekday + 1; const d = new Date(state.calendarYear, state.calendarMonth, dayNumber); cellDate = d.toISOString().slice(0,10); }
    const dayItems = items.filter(x => x.followDate === cellDate), selectedClass = state.calendarDate === cellDate ? "selected" : "", mutedClass = muted ? "muted-day" : "";
    const cell = document.createElement("div");
    cell.className = `day-cell ${selectedClass} ${mutedClass}`;
    cell.innerHTML = `<div class="day-number">${dayNumber}</div><div class="day-items">${dayItems.slice(0,3).map(item => `<div class="day-pill">${item.business}: ${escapeHtml(item.name)}</div>`).join("")}${dayItems.length > 3 ? `<div class="small muted">+${dayItems.length - 3} more</div>` : ""}</div>`;
    cell.onclick = () => { state.calendarDate = cellDate; render(); };
    grid.appendChild(cell);
  }
}

function renderSelectedDay(){
  const container = document.getElementById("selectedDayItems"), items = getAllCalendarItems().filter(x => x.followDate === state.calendarDate);
  container.innerHTML = items.length ? items.map(item => `<div class="item"><div class="inline"><strong>${item.name}</strong><span class="badge">${item.business}</span><span class="badge">${item.stage}</span></div><div class="small muted">${item.platform} • ${item.followDate}</div><div class="small">${escapeHtml(item.notes || "")}</div></div>`).join("") : `<div class="item">No follow-ups on ${state.calendarDate}.</div>`;
}

function renderTodos(){
  const list = document.getElementById("todoList");
  const filtered = state.todos.filter(item => { const q = state.query; return !q || [item.title,item.business,item.priority,item.notes].join(" ").toLowerCase().includes(q); }).sort((a,b) => { if(a.done !== b.done) return a.done - b.done; return a.date.localeCompare(b.date); });
  list.innerHTML = filtered.length ? filtered.map(item => `<div class="item"><div class="todo-row"><div class="todo-left"><input class="check-round" type="checkbox" ${item.done ? "checked" : ""} onchange="toggleTodoDone(${item.id})" /><div><div class="inline"><strong>${escapeHtml(item.title)}</strong><span class="badge">${item.business}</span><span class="badge ${item.priority === "High" ? "danger" : item.priority === "Medium" ? "warn" : ""}">${item.priority}</span>${item.done ? '<span class="badge success">Done</span>' : ''}</div><div class="small muted">${item.date}</div><div class="small">${escapeHtml(item.notes || "")}</div></div></div><button class="secondary" onclick="deleteTodo(${item.id})">Delete</button></div></div>`).join("") : `<div class="item">No tasks yet.</div>`;
}

function render(){
  renderStats();
  renderFlow("lwaFlow", state.lwaLeads, "lwa");
  renderFlow("chbFlow", state.chbLeads, "chb");
  renderQuickCalendar("lwaCalendar", filteredLeads(state.lwaLeads, state.lwaFilter));
  renderQuickCalendar("chbCalendar", filteredLeads(state.chbLeads, state.chbFilter));
  renderContent("lwaContentList", state.lwaContent, "lwa", LWA_PILLARS);
  renderContent("chbContentList", state.chbContent, "chb", CHB_PILLARS);
  renderLeads("lwaLeadList", state.lwaLeads, state.lwaFilter, "lwa");
  renderLeads("chbLeadList", state.chbLeads, state.chbFilter, "chb");
  renderMonthCalendar();
  renderSelectedDay();
  renderTodos();
}

render();
