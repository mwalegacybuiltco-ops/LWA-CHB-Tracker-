
const STAGES=["New Lead","Conversation Started","24 Hours","48 Hours","72 Hours","30 Day","VIP Joined","Affiliate","Ambassador","Ghosted","Closed"];
const FLOW_STAGES=["24 Hours","48 Hours","72 Hours","30 Day","Ghosted"];
const LWA_PILLARS=["Authority","Story","Offer","Objection","Engagement"];
const BIZ_PILLARS=["Authority","Story","Offer","Objection","Engagement","Product","Tips","Education"];
const PLATFORMS=["Facebook","TikTok","Instagram"];
const DAYS=["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"];
const WEEK_FLOW_DAYS=["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const AFF_METRICS=["Total Affiliates Enrolled","Active Affiliates This Week","Affiliates Need Reconnection","Affiliate Check-ins Completed","Affiliates with Sales this week"];
const AMB_METRICS=["Cold Ambassador Prospects","Warm Ambassador Prospect","Hot Ambassador Prospects"];

let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",(e)=>{
  e.preventDefault();
  deferredPrompt=e;
  document.getElementById("installBtn").classList.remove("hidden");
});
document.getElementById("installBtn").onclick=async()=>{
  if(!deferredPrompt) return;
  await deferredPrompt.prompt();
  deferredPrompt=null;
  document.getElementById("installBtn").classList.add("hidden");
};

const today=()=>new Date().toISOString().slice(0,10);
const id=()=>Date.now()+Math.floor(Math.random()*100000);
const escapeHtml=(s)=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const downloadCSV=(filename, rows)=>{
  const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
};

// IndexedDB for larger storage than localStorage
const DB_NAME = "legacybuilt_daytimer_plus_db";
const DB_VERSION = 1;
const STORE_NAME = "app_state";
const STATE_KEY = "main";

function openDb(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains(STORE_NAME)){
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}
async function loadStateFromDb(defaultState){
  try{
    const db = await openDb();
    return await new Promise((resolve, reject)=>{
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STATE_KEY);
      req.onsuccess = ()=>resolve(req.result?.value || defaultState);
      req.onerror = ()=>reject(req.error);
    });
  }catch{
    return defaultState;
  }
}
async function saveStateToDb(state){
  const db = await openDb();
  return await new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({ id: STATE_KEY, value: state });
    req.onsuccess = ()=>resolve(true);
    req.onerror = ()=>reject(req.error);
  });
}

function defaultState(){
  return {
    section:"dashboard",
    query:"",
    lwaFilter:"All",
    bizFilter:"All",
    calendarDate:today(),
    calendarMonth:new Date().getMonth(),
    calendarYear:new Date().getFullYear(),
    brand:{businessName:"Your Business",ownerName:"",tagline:""},
    dashboard:{
      weekLabel:"WEEK OF MARCH 31ST",
      daily:DAYS.map(day=>({day,contentPost:"",newAffLeads:0,newConvos:0,followUps:0,newAmbLeads:0,affEnrolled:0,ambEnrolled:0})),
      affiliateHealth:AFF_METRICS.map(label=>({label,value:0})),
      ambassadorPipeline:AMB_METRICS.map(label=>({label,value:0})),
      reflections:{win:"",leak:"",support:"",move:""},
      weeklyFlow: WEEK_FLOW_DAYS.map(day=>({day,text:""}))
    },
    lwaLeads:[
      {id:id(),name:"Sarah M.",platform:"Facebook",stage:"24 Hours",followDate:today(),score:7,joinedVIP:true,becameAffiliate:false,becameAmbassador:false,ghosted:false,notes:"Watched the overview.",history:[{id:id(),text:"Sent first follow-up.",createdAt:new Date().toISOString()}]},
      {id:id(),name:"Jen K.",platform:"TikTok",stage:"Ghosted",followDate:today(),score:3,joinedVIP:false,becameAffiliate:false,becameAmbassador:false,ghosted:true,notes:"Opened then disappeared.",history:[]}
    ],
    lwaContent:[
      {id:id(),title:"What digital marketing actually is",platforms:["TikTok"],pillar:"Authority",status:"Drafted",date:today(),touches:1,comments:4,leads:1,didWell:true,notes:"Simple explanation."}
    ],
    bizLeads:[
      {id:id(),name:"New prospect",platform:"Facebook",stage:"48 Hours",followDate:today(),score:6,joinedVIP:false,becameAffiliate:false,becameAmbassador:false,ghosted:false,notes:"Interested in the business.",history:[{id:id(),text:"Sent intro message.",createdAt:new Date().toISOString()}]}
    ],
    bizContent:[
      {id:id(),title:"Welcome post",platforms:["Facebook","Instagram"],pillar:"Story",status:"Planned",date:today(),touches:0,comments:0,leads:0,didWell:false,notes:"Intro to the brand."}
    ],
    todos:[
      {id:id(),title:"Follow up with Sarah",business:"LWA",date:today(),priority:"High",notes:"Check if she watched the overview.",done:false}
    ]
  };
}

let state = defaultState();

function debounce(fn, wait=300){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t=setTimeout(()=>fn(...args), wait);
  };
}
const persist = debounce(async()=>{
  await saveStateToDb(state);
}, 150);

function fillSelect(idName, options){
  const el = document.getElementById(idName);
  if(el) el.innerHTML = options.map(o=>`<option value="${o}">${o}</option>`).join("");
}

function applyBrand(){
  const bn = state.brand.businessName || "Your Business";
  document.getElementById("bizTabBtn").textContent = bn;
  document.getElementById("bizHeading").textContent = bn + " pipeline";
  document.getElementById("bizFlowHeading").textContent = bn + " follow-up flow";
  document.getElementById("bizCalendarHeading").textContent = bn + " quick calendar";
  document.getElementById("bizContentHeading").textContent = bn + " content tracker";
  document.getElementById("bizContactsHeading").textContent = bn + " contact cards";
  document.getElementById("brandBusinessName").value = state.brand.businessName || "";
  document.getElementById("brandOwnerName").value = state.brand.ownerName || "";
  document.getElementById("brandTagline").value = state.brand.tagline || "";
  document.getElementById("brandPreview").innerHTML = `<strong>${escapeHtml(bn)}</strong><div class="small muted">${escapeHtml(state.brand.ownerName||"")}</div><div>${escapeHtml(state.brand.tagline||"No tagline yet.")}</div>`;
  document.getElementById("todoBusiness").innerHTML = `<option value="LWA">LWA</option><option value="${bn}">${bn}</option><option value="Personal/Admin">Personal/Admin</option>`;
}

function filteredLeads(arr, filter){
  return arr.filter(item=>{
    const q=state.query;
    const matchesSearch=!q||[item.name,item.platform,item.stage,item.notes].join(" ").toLowerCase().includes(q);
    let matchesFilter=true;
    if(filter==="Due Today") matchesFilter=item.followDate===today();
    else if(filter==="Overdue") matchesFilter=item.followDate<today();
    else if(filter==="Affiliate") matchesFilter=item.becameAffiliate;
    else if(filter==="Ambassador") matchesFilter=item.becameAmbassador;
    else if(filter==="VIP Joined") matchesFilter=item.joinedVIP;
    else if(filter==="Ghosted") matchesFilter=item.ghosted||item.stage==="Ghosted";
    else if(filter!=="All") matchesFilter=item.stage===filter;
    return matchesSearch&&matchesFilter;
  });
}
function filteredContent(arr){
  return arr.filter(item=>{
    const q=state.query;
    return !q||[item.title,(item.platforms||[]).join(" "),item.pillar,item.status,item.notes].join(" ").toLowerCase().includes(q);
  });
}
const statBox=(label,value)=>`<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`;

function renderStats(){
  document.getElementById("lwaStats").innerHTML=[
    statBox("Total Leads",state.lwaLeads.length),
    statBox("24 Hr",state.lwaLeads.filter(x=>x.stage==="24 Hours").length),
    statBox("48 Hr",state.lwaLeads.filter(x=>x.stage==="48 Hours").length),
    statBox("72 Hr",state.lwaLeads.filter(x=>x.stage==="72 Hours").length),
    statBox("30 Day",state.lwaLeads.filter(x=>x.stage==="30 Day").length),
    statBox("Ghosted",state.lwaLeads.filter(x=>x.ghosted||x.stage==="Ghosted").length),
    statBox("VIP Joined",state.lwaLeads.filter(x=>x.joinedVIP).length),
    statBox("Content Items",state.lwaContent.length)
  ].join("");

  document.getElementById("bizStats").innerHTML=[
    statBox("Total Contacts",state.bizLeads.length),
    statBox("24 Hr",state.bizLeads.filter(x=>x.stage==="24 Hours").length),
    statBox("48 Hr",state.bizLeads.filter(x=>x.stage==="48 Hours").length),
    statBox("72 Hr",state.bizLeads.filter(x=>x.stage==="72 Hours").length),
    statBox("30 Day",state.bizLeads.filter(x=>x.stage==="30 Day").length),
    statBox("Ghosted",state.bizLeads.filter(x=>x.ghosted||x.stage==="Ghosted").length),
    statBox("VIP Joined",state.bizLeads.filter(x=>x.joinedVIP).length),
    statBox("Content Items",state.bizContent.length)
  ].join("");

  document.getElementById("todoStats").innerHTML=[
    statBox("All Tasks",state.todos.length),
    statBox("Due Today",state.todos.filter(x=>x.date===today()).length),
    statBox("Done",state.todos.filter(x=>x.done).length),
    statBox("Open",state.todos.filter(x=>!x.done).length)
  ].join("");

  const daily=state.dashboard.daily;
  document.getElementById("dashboardStats").innerHTML=[
    statBox("Content Posts",daily.reduce((a,b)=>a+(b.contentPost?1:0),0)),
    statBox("Aff Leads",daily.reduce((a,b)=>a+Number(b.newAffLeads||0),0)),
    statBox("New Convos",daily.reduce((a,b)=>a+Number(b.newConvos||0),0)),
    statBox("Follow Ups",daily.reduce((a,b)=>a+Number(b.followUps||0),0)),
    statBox("Amb Leads",daily.reduce((a,b)=>a+Number(b.newAmbLeads||0),0)),
    statBox("Aff Enrolled",daily.reduce((a,b)=>a+Number(b.affEnrolled||0),0)),
    statBox("Amb Enrolled",daily.reduce((a,b)=>a+Number(b.ambEnrolled||0),0))
  ].join("");
}

function renderDailyTracker(){
  document.getElementById("dashboardWeekLabel").value = state.dashboard.weekLabel || "";
  document.getElementById("dashboardWeekHeading").textContent = state.dashboard.weekLabel || "Weekly Dashboard";
  const body = document.getElementById("dailyTrackerBody");
  body.innerHTML = state.dashboard.daily.map((row, idx)=>`
    <tr>
      <td><strong>${row.day}</strong></td>
      <td><input data-daily="contentPost-${idx}" value="${escapeHtml(row.contentPost)}" /></td>
      <td><input type="number" min="0" data-daily="newAffLeads-${idx}" value="${row.newAffLeads}" /></td>
      <td><input type="number" min="0" data-daily="newConvos-${idx}" value="${row.newConvos}" /></td>
      <td><input type="number" min="0" data-daily="followUps-${idx}" value="${row.followUps}" /></td>
      <td><input type="number" min="0" data-daily="newAmbLeads-${idx}" value="${row.newAmbLeads}" /></td>
      <td><input type="number" min="0" data-daily="affEnrolled-${idx}" value="${row.affEnrolled}" /></td>
      <td><input type="number" min="0" data-daily="ambEnrolled-${idx}" value="${row.ambEnrolled}" /></td>
    </tr>
  `).join("");

  document.querySelectorAll("[data-daily]").forEach(el=>{
    el.addEventListener("change", ()=>{
      const [field, idx] = el.getAttribute("data-daily").split("-");
      const row = state.dashboard.daily[Number(idx)];
      row[field] = el.type === "number" ? Number(el.value || 0) : el.value;
      persist();
      renderStats();
      renderDailyTrackerTotals();
    });
  });
  renderDailyTrackerTotals();
}

function renderDailyTrackerTotals(){
  const totals = {
    contentPost: state.dashboard.daily.filter(x=>x.contentPost).length,
    newAffLeads: state.dashboard.daily.reduce((a,b)=>a+Number(b.newAffLeads||0),0),
    newConvos: state.dashboard.daily.reduce((a,b)=>a+Number(b.newConvos||0),0),
    followUps: state.dashboard.daily.reduce((a,b)=>a+Number(b.followUps||0),0),
    newAmbLeads: state.dashboard.daily.reduce((a,b)=>a+Number(b.newAmbLeads||0),0),
    affEnrolled: state.dashboard.daily.reduce((a,b)=>a+Number(b.affEnrolled||0),0),
    ambEnrolled: state.dashboard.daily.reduce((a,b)=>a+Number(b.ambEnrolled||0),0),
  };
  document.getElementById("dailyTrackerTotalRow").innerHTML = `
    <td><strong>WEEKLY TOTAL</strong></td>
    <td>${totals.contentPost}</td>
    <td>${totals.newAffLeads}</td>
    <td>${totals.newConvos}</td>
    <td>${totals.followUps}</td>
    <td>${totals.newAmbLeads}</td>
    <td>${totals.affEnrolled}</td>
    <td>${totals.ambEnrolled}</td>
  `;
}

function renderMetricList(elId, arr, key){
  document.getElementById(elId).innerHTML = arr.map((item, idx)=>`
    <div class="item compact-item">
      <div class="inline spread">
        <strong>${escapeHtml(item.label)}</strong>
        <input type="number" min="0" data-metric="${key}-${idx}" value="${item.value}" />
      </div>
    </div>
  `).join("");
  document.querySelectorAll(`[data-metric^="${key}-"]`).forEach(el=>{
    el.addEventListener("change", ()=>{
      const idx = Number(el.getAttribute("data-metric").split("-")[1]);
      state.dashboard[key][idx].value = Number(el.value || 0);
      persist();
    });
  });
}

function renderFlow(elId, arr, prefix){
  document.getElementById(elId).innerHTML = FLOW_STAGES.map(stage=>{
    const items=arr.filter(x=>x.stage===stage||(stage==="Ghosted"&&(x.ghosted||x.stage==="Ghosted")));
    return `<div class="flow-col"><h3>${stage}</h3><div class="flow-stack">${items.length?items.map(item=>`
      <div class="flow-card">
        <div class="inline"><strong>${escapeHtml(item.name)}</strong><span class="badge">${escapeHtml(item.platform)}</span></div>
        <div class="small muted">${item.followDate}</div>
        <div class="inline" style="margin-top:8px">
          <select onchange="moveStage('${prefix}', ${item.id}, this.value)">${STAGES.map(s=>`<option value="${s}" ${s===item.stage?"selected":""}>${s}</option>`).join("")}</select>
        </div>
      </div>`).join(""):`<div class="small muted">Nothing here.</div>`}</div></div>`;
  }).join("");
}

function renderQuickCalendar(elId, arr){
  const sorted=[...arr].sort((a,b)=>a.followDate.localeCompare(b.followDate));
  const groups={};
  sorted.forEach(item=>{if(!groups[item.followDate])groups[item.followDate]=[]; groups[item.followDate].push(item);});
  document.getElementById(elId).innerHTML=Object.keys(groups).length?Object.entries(groups).map(([date,items])=>`
    <div class="calendar-stack">
      <div class="calendar-date">${date}</div>
      ${items.map(item=>`
        <div class="calendar-item">
          <div class="calendar-head"><strong>${escapeHtml(item.name)}</strong><span class="badge">${item.stage}</span>${item.becameAffiliate?'<span class="badge on">Affiliate</span>':''}${item.becameAmbassador?'<span class="badge on">Ambassador</span>':''}</div>
          <div class="small muted">${escapeHtml(item.platform)}</div>
        </div>`).join("")}
    </div>`).join(""):`<div class="item">No follow-ups scheduled.</div>`;
}

function platformChecks(prefix, idVal, platforms){
  return PLATFORMS.map(p=>`<label><input type="checkbox" data-content-platformcheck="${prefix}-${idVal}-${p}" ${platforms.includes(p)?"checked":""}/> ${p}</label>`).join("");
}

function contentCard(item,prefix,pillars){
  const platforms=item.platforms||[];
  return `<div class="item">
    <div class="inline">
      <strong>${escapeHtml(item.title)}</strong>
      ${platforms.map(p=>`<span class="badge platform">${p}</span>`).join("")}
      <span class="badge">${item.pillar}</span>
      <span class="badge ${item.status==="Posted"?"success":""}">${item.status}</span>
      ${item.didWell?'<span class="badge success">Did Well</span>':'<span class="badge warn">Needs Work</span>'}
    </div>
    <div class="metrics">
      <div class="metric"><div class="label">Platforms</div><div class="value">${platforms.length?platforms.join(", "):"None"}</div></div>
      <div class="metric"><div class="label">Touches</div><div class="value">${item.touches}</div></div>
      <div class="metric"><div class="label">Comments</div><div class="value">${item.comments||0}</div></div>
      <div class="metric"><div class="label">Leads</div><div class="value">${item.leads||0}</div></div>
    </div>
    <div class="grid two" style="margin-top:10px">
      <input data-content-title="${prefix}-${item.id}" value="${escapeHtml(item.title)}"/>
      <select data-content-pillar="${prefix}-${item.id}">${pillars.map(p=>`<option value="${p}" ${p===item.pillar?"selected":""}>${p}</option>`).join("")}</select>
      <select data-content-status="${prefix}-${item.id}">${["Planned","Drafted","Posted"].map(s=>`<option value="${s}" ${s===item.status?"selected":""}>${s}</option>`).join("")}</select>
      <input type="date" data-content-date="${prefix}-${item.id}" value="${item.date}"/>
      <input type="number" min="0" data-content-touches="${prefix}-${item.id}" value="${item.touches}"/>
      <input type="number" min="0" data-content-comments="${prefix}-${item.id}" value="${item.comments||0}"/>
      <input type="number" min="0" data-content-leads="${prefix}-${item.id}" value="${item.leads||0}"/>
    </div>
    <div class="platform-checks"><span class="muted small">Platforms</span>${platformChecks(prefix,item.id,platforms)}</div>
    <label class="inline-check"><input type="checkbox" data-content-didwell="${prefix}-${item.id}" ${item.didWell?"checked":""}/> Did it do well?</label>
    <textarea data-content-notes="${prefix}-${item.id}" placeholder="Notes">${escapeHtml(item.notes||"")}</textarea>
    <div class="inline"><button onclick="saveContentItem('${prefix}', ${item.id})">Save</button><button class="secondary" onclick="updateContentTouches('${prefix}', ${item.id}, 1)">+1 Touch</button></div>
  </div>`;
}

function renderContent(elId, arr, prefix, pillars){
  document.getElementById(elId).innerHTML = filteredContent(arr).map(item=>contentCard(item,prefix,pillars)).join("") || `<div class="item">No content yet.</div>`;
}

function leadCard(item,prefix){
  return `<div class="item">
    <div class="inline"><strong>${escapeHtml(item.name)}</strong><span class="badge">${escapeHtml(item.platform)}</span><span class="badge">${item.stage}</span><span class="badge">Score ${item.score}</span></div>
    <div class="badges">${item.joinedVIP?'<span class="badge on">VIP</span>':'<span class="badge">VIP</span>'}${item.becameAffiliate?'<span class="badge on">Affiliate</span>':'<span class="badge">Affiliate</span>'}${item.becameAmbassador?'<span class="badge on">Ambassador</span>':'<span class="badge">Ambassador</span>'}${item.ghosted||item.stage==="Ghosted"?'<span class="badge danger">Ghosted</span>':'<span class="badge">Ghosted</span>'}</div>
    <div class="grid two">
      <input data-field="${prefix}-name-${item.id}" value="${escapeHtml(item.name)}"/>
      <input data-field="${prefix}-platform-${item.id}" value="${escapeHtml(item.platform)}"/>
      <select data-field="${prefix}-stage-${item.id}">${STAGES.map(s=>`<option value="${s}" ${s===item.stage?"selected":""}>${s}</option>`).join("")}</select>
      <input type="date" data-field="${prefix}-followDate-${item.id}" value="${item.followDate}"/>
      <input type="number" min="1" max="10" data-field="${prefix}-score-${item.id}" value="${item.score}"/>
    </div>
    <div class="checks">
      <label><input type="checkbox" data-field="${prefix}-vip-${item.id}" ${item.joinedVIP?"checked":""}/> Joined FB VIP</label>
      <label><input type="checkbox" data-field="${prefix}-aff-${item.id}" ${item.becameAffiliate?"checked":""}/> Affiliate</label>
      <label><input type="checkbox" data-field="${prefix}-amb-${item.id}" ${item.becameAmbassador?"checked":""}/> Ambassador</label>
      <label><input type="checkbox" data-field="${prefix}-ghost-${item.id}" ${(item.ghosted||item.stage==="Ghosted")?"checked":""}/> Ghosted</label>
    </div>
    <textarea data-field="${prefix}-notes-${item.id}" placeholder="Notes">${escapeHtml(item.notes||"")}</textarea>
    <div class="inline"><button onclick="saveLeadCard('${prefix}', ${item.id})">Save</button><button class="secondary" onclick="deleteLeadCard('${prefix}', ${item.id})">Delete</button></div>
    <div class="notes-box">
      <div class="small muted">Running notes</div>
      <div class="notes-list">${(item.history||[]).map(note=>`<div class="note"><div>${escapeHtml(note.text)}</div><div class="small muted">${new Date(note.createdAt).toLocaleString()}</div></div>`).join("")||'<div class="note">No notes yet.</div>'}</div>
      <textarea data-note="${prefix}-${item.id}" placeholder="Add follow-up note..."></textarea>
      <button class="secondary" onclick="addRunningNote('${prefix}', ${item.id})">Add Note</button>
    </div>
  </div>`;
}

function renderLeads(elId, arr, filter, prefix){
  document.getElementById(elId).innerHTML = filteredLeads(arr, filter).map(item=>leadCard(item,prefix)).join("") || `<div class="item">No matching leads.</div>`;
}

function getAllCalendarItems(){
  const bn=state.brand.businessName||"Your Business";
  const leadItems = [
    ...state.lwaLeads.map(x=>({type:"lead", business:"LWA", title:x.name, stage:x.stage, date:x.followDate, details:x.platform, notes:x.notes})),
    ...state.bizLeads.map(x=>({type:"lead", business:bn, title:x.name, stage:x.stage, date:x.followDate, details:x.platform, notes:x.notes}))
  ];
  const todoItems = state.todos.map(x=>({type:"todo", business:x.business, title:x.title, stage:x.priority, date:x.date, details:"Task", notes:x.notes}));
  const contentItems = [
    ...state.lwaContent.map(x=>({type:"content", business:"LWA", title:x.title, stage:x.status, date:x.date, details:(x.platforms||[]).join(", "), notes:x.notes})),
    ...state.bizContent.map(x=>({type:"content", business:bn, title:x.title, stage:x.status, date:x.date, details:(x.platforms||[]).join(", "), notes:x.notes}))
  ];
  return [...leadItems, ...todoItems, ...contentItems].filter(x=>x.date);
}

function renderMonthCalendar(){
  const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];
  monthLabel.textContent=`${monthNames[state.calendarMonth]} ${state.calendarYear}`;
  monthGrid.innerHTML="";
  const firstDay=new Date(state.calendarYear,state.calendarMonth,1), lastDay=new Date(state.calendarYear,state.calendarMonth+1,0), startWeekday=firstDay.getDay(), daysInMonth=lastDay.getDate(), prevLastDay=new Date(state.calendarYear,state.calendarMonth,0).getDate();
  const items=getAllCalendarItems();
  for(let i=0;i<42;i++){
    let dayNumber="",cellDate="",muted=false;
    if(i<startWeekday){dayNumber=prevLastDay-startWeekday+i+1; const d=new Date(state.calendarYear,state.calendarMonth-1,dayNumber); cellDate=d.toISOString().slice(0,10); muted=true;}
    else if(i>=startWeekday+daysInMonth){dayNumber=i-(startWeekday+daysInMonth)+1; const d=new Date(state.calendarYear,state.calendarMonth+1,dayNumber); cellDate=d.toISOString().slice(0,10); muted=true;}
    else {dayNumber=i-startWeekday+1; const d=new Date(state.calendarYear,state.calendarMonth,dayNumber); cellDate=d.toISOString().slice(0,10);}
    const dayItems=items.filter(x=>x.date===cellDate);
    const cell=document.createElement("div");
    cell.className=`day-cell ${state.calendarDate===cellDate?"selected":""} ${muted?"muted-day":""}`;
    cell.innerHTML=`<div class="day-number">${dayNumber}</div><div class="day-items">${dayItems.slice(0,3).map(item=>`<div class="day-pill">${escapeHtml(item.business)}: ${escapeHtml(item.title)}</div>`).join("")}${dayItems.length>3?`<div class="small muted">+${dayItems.length-3} more</div>`:""}</div>`;
    cell.onclick=()=>{state.calendarDate=cellDate; render();};
    monthGrid.appendChild(cell);
  }
}

function renderSelectedDay(){
  const items=getAllCalendarItems().filter(x=>x.date===state.calendarDate);
  selectedDayItems.innerHTML=items.length?items.map(item=>`<div class="item"><div class="inline"><strong>${escapeHtml(item.title)}</strong><span class="badge">${escapeHtml(item.business)}</span><span class="badge">${escapeHtml(item.stage)}</span><span class="badge">${escapeHtml(item.type)}</span></div><div class="small muted">${escapeHtml(item.details||"")} • ${item.date}</div><div class="small">${escapeHtml(item.notes||"")}</div></div>`).join(""):`<div class="item">No items on ${state.calendarDate}.</div>`;
}


function renderWeeklyFlow(){
  const grid = document.getElementById("weeklyFlowGrid");
  grid.innerHTML = state.dashboard.weeklyFlow.map((item, idx)=>`
    <div class="weekday-card">
      <h3>${item.day}</h3>
      <textarea data-weeklyflow="${idx}" placeholder="Example: 10 follow ups, 1 story post, check in with warm leads, go live, post proof...">${escapeHtml(item.text || "")}</textarea>
    </div>
  `).join("");
  document.querySelectorAll("[data-weeklyflow]").forEach(el=>{
    el.addEventListener("input", ()=>{
      const idx = Number(el.getAttribute("data-weeklyflow"));
      state.dashboard.weeklyFlow[idx].text = el.value;
      persist();
    });
  });
}

function renderTodos(){
  const filtered=state.todos.filter(item=>{const q=state.query; return !q||[item.title,item.business,item.priority,item.notes].join(" ").toLowerCase().includes(q)}).sort((a,b)=>a.done!==b.done?a.done-b.done:a.date.localeCompare(b.date));
  todoList.innerHTML=filtered.length?filtered.map(item=>`<div class="item"><div class="todo-row"><div class="todo-left"><input class="check-round" type="checkbox" ${item.done?"checked":""} onchange="toggleTodoDone(${item.id})"/><div><div class="inline"><strong>${escapeHtml(item.title)}</strong><span class="badge">${escapeHtml(item.business)}</span><span class="badge ${item.priority==="High"?"danger":item.priority==="Medium"?"warn":""}">${item.priority}</span>${item.done?'<span class="badge success">Done</span>':''}</div><div class="small muted">${item.date}</div><div class="small">${escapeHtml(item.notes||"")}</div></div></div><button class="secondary" onclick="deleteTodo(${item.id})">Delete</button></div></div>`).join(""):`<div class="item">No tasks yet.</div>`;
}

window.moveStage=(prefix,idVal,stage)=>{const arr=prefix==="lwa"?state.lwaLeads:state.bizLeads; const item=arr.find(x=>x.id===idVal); if(!item)return; item.stage=stage; item.ghosted=stage==="Ghosted"?true:item.ghosted; persist(); render();};
window.saveLeadCard=(prefix,idVal)=>{const arr=prefix==="lwa"?state.lwaLeads:state.bizLeads; const item=arr.find(x=>x.id===idVal); if(!item)return; item.name=document.querySelector(`[data-field="${prefix}-name-${idVal}"]`).value; item.platform=document.querySelector(`[data-field="${prefix}-platform-${idVal}"]`).value; item.stage=document.querySelector(`[data-field="${prefix}-stage-${idVal}"]`).value; item.followDate=document.querySelector(`[data-field="${prefix}-followDate-${idVal}"]`).value; item.score=Number(document.querySelector(`[data-field="${prefix}-score-${idVal}"]`).value||5); item.joinedVIP=document.querySelector(`[data-field="${prefix}-vip-${idVal}"]`).checked; item.becameAffiliate=document.querySelector(`[data-field="${prefix}-aff-${idVal}"]`).checked; item.becameAmbassador=document.querySelector(`[data-field="${prefix}-amb-${idVal}"]`).checked; item.ghosted=document.querySelector(`[data-field="${prefix}-ghost-${idVal}"]`).checked; if(item.ghosted)item.stage="Ghosted"; item.notes=document.querySelector(`[data-field="${prefix}-notes-${idVal}"]`).value; persist(); render();};
window.deleteLeadCard=(prefix,idVal)=>{if(prefix==="lwa")state.lwaLeads=state.lwaLeads.filter(x=>x.id!==idVal); else state.bizLeads=state.bizLeads.filter(x=>x.id!==idVal); persist(); render();};
window.addRunningNote=(prefix,idVal)=>{const textarea=document.querySelector(`[data-note="${prefix}-${idVal}"]`); const text=textarea.value.trim(); if(!text)return; const arr=prefix==="lwa"?state.lwaLeads:state.bizLeads; const item=arr.find(x=>x.id===idVal); item.history=item.history||[]; item.history.unshift({id:id(),text,createdAt:new Date().toISOString()}); textarea.value=""; persist(); render();};
window.saveContentItem=(prefix,idVal)=>{const arr=prefix==="lwa"?state.lwaContent:state.bizContent; const item=arr.find(x=>x.id===idVal); if(!item)return; item.title=document.querySelector(`[data-content-title="${prefix}-${idVal}"]`).value; item.pillar=document.querySelector(`[data-content-pillar="${prefix}-${idVal}"]`).value; item.status=document.querySelector(`[data-content-status="${prefix}-${idVal}"]`).value; item.date=document.querySelector(`[data-content-date="${prefix}-${idVal}"]`).value; item.touches=Number(document.querySelector(`[data-content-touches="${prefix}-${idVal}"]`).value||0); item.comments=Number(document.querySelector(`[data-content-comments="${prefix}-${idVal}"]`).value||0); item.leads=Number(document.querySelector(`[data-content-leads="${prefix}-${idVal}"]`).value||0); item.didWell=document.querySelector(`[data-content-didwell="${prefix}-${idVal}"]`).checked; item.notes=document.querySelector(`[data-content-notes="${prefix}-${idVal}"]`).value; item.platforms=PLATFORMS.filter(p=>document.querySelector(`[data-content-platformcheck="${prefix}-${idVal}-${p}"]`)?.checked); persist(); render();};
window.updateContentTouches=(prefix,idVal,amount)=>{const arr=prefix==="lwa"?state.lwaContent:state.bizContent; const item=arr.find(x=>x.id===idVal); item.touches=Number(item.touches||0)+amount; persist(); render();};
window.toggleTodoDone=(idVal)=>{const item=state.todos.find(x=>x.id===idVal); if(!item)return; item.done=!item.done; persist(); render();};
window.deleteTodo=(idVal)=>{state.todos=state.todos.filter(x=>x.id!==idVal); persist(); render();};

function wireStaticEvents(){
  document.getElementById("saveBrandSettings").onclick=()=>{state.brand.businessName=brandBusinessName.value.trim()||"Your Business"; state.brand.ownerName=brandOwnerName.value.trim(); state.brand.tagline=brandTagline.value.trim(); persist(); applyBrand(); render();};
  document.getElementById("saveDashboardWeek").onclick=()=>{state.dashboard.weekLabel=dashboardWeekLabel.value.trim()||"WEEK OF MARCH 31ST"; persist(); render();};
  document.getElementById("saveReflections").onclick=()=>{state.dashboard.reflections={win:reflectionWin.value,leak:reflectionLeak.value,support:reflectionSupport.value,move:reflectionMove.value}; persist();};

  document.querySelectorAll(".seg").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll(".seg").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    state.section=btn.dataset.section;
    ["dashboard","lwa","biz","calendar","todo","settings"].forEach(sec=>document.getElementById(sec+"Section").classList.toggle("hidden",sec!==state.section));
    render();
  }));

  document.getElementById("searchInput").addEventListener("input",e=>{state.query=e.target.value.toLowerCase(); render();});
  document.getElementById("lwaFilter").onchange=e=>{state.lwaFilter=e.target.value; render();};
  document.getElementById("bizFilter").onchange=e=>{state.bizFilter=e.target.value; render();};

  const toggle=idName=>document.getElementById(idName).classList.toggle("hidden");
  toggleLwaLeadForm.onclick=()=>toggle("lwaLeadForm");
  toggleLwaContentForm.onclick=()=>toggle("lwaContentForm");
  toggleBizLeadForm.onclick=()=>toggle("bizLeadForm");
  toggleBizContentForm.onclick=()=>toggle("bizContentForm");

  saveLwaLead.onclick=()=>{const item={id:id(),name:lwaLeadName.value.trim(),platform:lwaLeadPlatform.value.trim(),stage:lwaLeadStage.value,followDate:lwaLeadFollowDate.value||today(),score:Number(lwaLeadScore.value||5),joinedVIP:lwaLeadVIP.checked,becameAffiliate:lwaLeadAffiliate.checked,becameAmbassador:lwaLeadAmbassador.checked,ghosted:lwaLeadGhosted.checked,notes:lwaLeadNotes.value.trim(),history:[]}; if(!item.name)return; if(item.ghosted)item.stage="Ghosted"; state.lwaLeads.unshift(item); persist(); render();};
  saveBizLead.onclick=()=>{const item={id:id(),name:bizLeadName.value.trim(),platform:bizLeadPlatform.value.trim(),stage:bizLeadStage.value,followDate:bizLeadFollowDate.value||today(),score:Number(bizLeadScore.value||5),joinedVIP:bizLeadVIP.checked,becameAffiliate:bizLeadAffiliate.checked,becameAmbassador:bizLeadAmbassador.checked,ghosted:bizLeadGhosted.checked,notes:bizLeadNotes.value.trim(),history:[]}; if(!item.name)return; if(item.ghosted)item.stage="Ghosted"; state.bizLeads.unshift(item); persist(); render();};
  saveLwaContent.onclick=()=>{const item={id:id(),title:lwaContentTitle.value.trim(),platforms:[...(lwaPlatformFacebook.checked?["Facebook"]:[]),...(lwaPlatformTikTok.checked?["TikTok"]:[]),...(lwaPlatformInstagram.checked?["Instagram"]:[])],pillar:lwaContentPillar.value,status:lwaContentStatus.value,date:lwaContentDate.value||today(),touches:Number(lwaContentTouches.value||0),comments:Number(lwaContentComments.value||0),leads:Number(lwaContentLeads.value||0),didWell:lwaContentDidWell.checked,notes:lwaContentNotes.value.trim()}; if(!item.title)return; state.lwaContent.unshift(item); persist(); render();};
  saveBizContent.onclick=()=>{const item={id:id(),title:bizContentTitle.value.trim(),platforms:[...(bizPlatformFacebook.checked?["Facebook"]:[]),...(bizPlatformTikTok.checked?["TikTok"]:[]),...(bizPlatformInstagram.checked?["Instagram"]:[])],pillar:bizContentPillar.value,status:bizContentStatus.value,date:bizContentDate.value||today(),touches:Number(bizContentTouches.value||0),comments:Number(bizContentComments.value||0),leads:Number(bizContentLeads.value||0),didWell:bizContentDidWell.checked,notes:bizContentNotes.value.trim()}; if(!item.title)return; state.bizContent.unshift(item); persist(); render();};
  saveTodo.onclick=()=>{const item={id:id(),title:todoTitle.value.trim(),business:todoBusiness.value,date:todoDate.value||today(),priority:todoPriority.value,notes:todoNotes.value.trim(),done:false}; if(!item.title)return; state.todos.unshift(item); persist(); render();};

  exportBtn.onclick=()=>{
    const bn=state.brand.businessName||"your-business";
    if(state.section==="dashboard"){
      downloadCSV("weekly-dashboard.csv", [["Day","Content Post","New Aff Leads","New Convos","Follow Ups","New Amb Leads","Aff Enrolled","Amb Enrolled"], ...state.dashboard.daily.map(r=>[r.day,r.contentPost,r.newAffLeads,r.newConvos,r.followUps,r.newAmbLeads,r.affEnrolled,r.ambEnrolled])]);
    } else if(state.section==="lwa"){
      downloadCSV("lwa-leads.csv",[["Name","Platform","Stage","Follow Date","Score","VIP","Affiliate","Ambassador","Ghosted","Notes"],...filteredLeads(state.lwaLeads,state.lwaFilter).map(x=>[x.name,x.platform,x.stage,x.followDate,x.score,x.joinedVIP,x.becameAffiliate,x.becameAmbassador,x.ghosted,x.notes])]);
    } else if(state.section==="biz"){
      downloadCSV((bn.toLowerCase().replace(/\s+/g,'-'))+"-leads.csv",[["Name","Platform","Stage","Follow Date","Score","VIP","Affiliate","Ambassador","Ghosted","Notes"],...filteredLeads(state.bizLeads,state.bizFilter).map(x=>[x.name,x.platform,x.stage,x.followDate,x.score,x.joinedVIP,x.becameAffiliate,x.becameAmbassador,x.ghosted,x.notes])]);
    } else if(state.section==="todo"){
      downloadCSV("todo-list.csv",[["Title","Business","Date","Priority","Done","Notes"],...state.todos.map(x=>[x.title,x.business,x.date,x.priority,x.done,x.notes])]);
    }
  };

  prevMonthBtn.onclick=()=>{state.calendarMonth-=1;if(state.calendarMonth<0){state.calendarMonth=11;state.calendarYear-=1}render();};
  nextMonthBtn.onclick=()=>{state.calendarMonth+=1;if(state.calendarMonth>11){state.calendarMonth=0;state.calendarYear+=1}render();};
}

async function initApp(){
  state = await loadStateFromDb(defaultState());
  if(!state.dashboard.weeklyFlow){ state.dashboard.weeklyFlow = WEEK_FLOW_DAYS.map(day=>({day,text:""})); }
  applyBrand();
  fillSelect("lwaLeadStage",STAGES);
  fillSelect("bizLeadStage",STAGES);
  fillSelect("lwaContentPillar",LWA_PILLARS);
  fillSelect("bizContentPillar",BIZ_PILLARS);
  ["lwaLeadFollowDate","bizLeadFollowDate","lwaContentDate","bizContentDate","todoDate"].forEach(id=>{
    const el=document.getElementById(id);
    if(el && !el.value) el.value=today();
  });
  wireStaticEvents();
  render();
}
initApp();
