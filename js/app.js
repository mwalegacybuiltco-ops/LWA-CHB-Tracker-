
const STORAGE = {
  lwaContent: "lb_metrics_lwa_content",
  chbContent: "lb_metrics_chb_content",
};

const CONTENT_PLATFORMS = ["Facebook","TikTok","Instagram"];
const LWA_PILLARS = ["Authority","Story","Offer","Objection","Engagement"];
const CHB_PILLARS = ["Product Post","Dog Tips","Affiliate Post","Customer Story","Engagement Post"];

function today(){ return new Date().toISOString().slice(0,10); }
function id(){ return Date.now() + Math.floor(Math.random()*1000); }
function load(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
  catch { return fallback; }
}
function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

let state = {
  section: "lwa",
  query: "",
  lwaContent: load(STORAGE.lwaContent, [
    {id:id(), title:"What digital marketing actually is", platform:"TikTok", pillar:"Authority", status:"Drafted", date:today(), touches:1, comments:4, leads:1, didWell:true, notes:"Simple explanation."}
  ]),
  chbContent: load(STORAGE.chbContent, [
    {id:id(), title:"German Shepherd tumbler spotlight", platform:"Facebook", pillar:"Product Post", status:"Planned", date:today(), touches:0, comments:0, leads:0, didWell:false, notes:"Lifestyle angle."}
  ])
};

function fillSelect(idName, options){
  const el = document.getElementById(idName);
  el.innerHTML = options.map(o => `<option value="${o}">${o}</option>`).join("");
}

fillSelect("lwaContentPlatform", CONTENT_PLATFORMS);
fillSelect("chbContentPlatform", CONTENT_PLATFORMS);
fillSelect("lwaContentPillar", LWA_PILLARS);
fillSelect("chbContentPillar", CHB_PILLARS);
document.getElementById("lwaContentDate").value = today();
document.getElementById("chbContentDate").value = today();

document.querySelectorAll(".seg").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.section = btn.dataset.section;
    document.getElementById("lwaSection").classList.toggle("hidden", state.section !== "lwa");
    document.getElementById("chbSection").classList.toggle("hidden", state.section !== "chb");
    render();
  });
});

document.getElementById("searchInput").addEventListener("input", (e) => {
  state.query = e.target.value.toLowerCase();
  render();
});

document.getElementById("toggleLwaContentForm").onclick = () => {
  document.getElementById("lwaContentForm").classList.toggle("hidden");
};
document.getElementById("toggleChbContentForm").onclick = () => {
  document.getElementById("chbContentForm").classList.toggle("hidden");
};

document.getElementById("saveLwaContent").onclick = () => {
  const item = {
    id:id(),
    title:document.getElementById("lwaContentTitle").value.trim(),
    platform:document.getElementById("lwaContentPlatform").value,
    pillar:document.getElementById("lwaContentPillar").value,
    status:document.getElementById("lwaContentStatus").value,
    date:document.getElementById("lwaContentDate").value || today(),
    touches:Number(document.getElementById("lwaContentTouches").value || 0),
    comments:Number(document.getElementById("lwaContentComments").value || 0),
    leads:Number(document.getElementById("lwaContentLeads").value || 0),
    didWell:document.getElementById("lwaContentDidWell").checked,
    notes:document.getElementById("lwaContentNotes").value.trim()
  };
  if(!item.title) return;
  state.lwaContent.unshift(item);
  save(STORAGE.lwaContent, state.lwaContent);
  render();
};

document.getElementById("saveChbContent").onclick = () => {
  const item = {
    id:id(),
    title:document.getElementById("chbContentTitle").value.trim(),
    platform:document.getElementById("chbContentPlatform").value,
    pillar:document.getElementById("chbContentPillar").value,
    status:document.getElementById("chbContentStatus").value,
    date:document.getElementById("chbContentDate").value || today(),
    touches:Number(document.getElementById("chbContentTouches").value || 0),
    comments:Number(document.getElementById("chbContentComments").value || 0),
    leads:Number(document.getElementById("chbContentLeads").value || 0),
    didWell:document.getElementById("chbContentDidWell").checked,
    notes:document.getElementById("chbContentNotes").value.trim()
  };
  if(!item.title) return;
  state.chbContent.unshift(item);
  save(STORAGE.chbContent, state.chbContent);
  render();
};

window.saveContentItem = function(prefix, idVal){
  const arr = prefix === "lwa" ? state.lwaContent : state.chbContent;
  const key = prefix === "lwa" ? STORAGE.lwaContent : STORAGE.chbContent;
  const item = arr.find(x => x.id === idVal);
  if(!item) return;

  item.title = document.querySelector(`[data-title="${prefix}-${idVal}"]`).value;
  item.platform = document.querySelector(`[data-platform="${prefix}-${idVal}"]`).value;
  item.pillar = document.querySelector(`[data-pillar="${prefix}-${idVal}"]`).value;
  item.status = document.querySelector(`[data-status="${prefix}-${idVal}"]`).value;
  item.date = document.querySelector(`[data-date="${prefix}-${idVal}"]`).value;
  item.touches = Number(document.querySelector(`[data-touches="${prefix}-${idVal}"]`).value || 0);
  item.comments = Number(document.querySelector(`[data-comments="${prefix}-${idVal}"]`).value || 0);
  item.leads = Number(document.querySelector(`[data-leads="${prefix}-${idVal}"]`).value || 0);
  item.didWell = document.querySelector(`[data-didwell="${prefix}-${idVal}"]`).checked;
  item.notes = document.querySelector(`[data-notes="${prefix}-${idVal}"]`).value;

  save(key, arr);
  render();
};

function filtered(arr){
  return arr.filter(item => {
    const q = state.query;
    return !q || [item.title,item.platform,item.pillar,item.status,item.notes].join(" ").toLowerCase().includes(q);
  });
}

function platformOptions(selected){
  return CONTENT_PLATFORMS.map(p => `<option value="${p}" ${p===selected?'selected':''}>${p}</option>`).join("");
}
function pillarOptions(selected, pillars){
  return pillars.map(p => `<option value="${p}" ${p===selected?'selected':''}>${p}</option>`).join("");
}
function statusOptions(selected){
  return ["Planned","Drafted","Posted"].map(s => `<option value="${s}" ${s===selected?'selected':''}>${s}</option>`).join("");
}

function renderList(elId, arr, prefix, pillars){
  const container = document.getElementById(elId);
  container.innerHTML = filtered(arr).map(item => `
    <div class="item">
      <div class="inline">
        <strong>${item.title}</strong>
        <span class="badge platform">${item.platform}</span>
        <span class="badge">${item.pillar}</span>
        <span class="badge ${item.status === "Posted" ? "success" : ""}">${item.status}</span>
        ${item.didWell ? '<span class="badge success">Did Well</span>' : '<span class="badge warn">Needs Work</span>'}
      </div>

      <div class="metrics">
        <div class="metric"><div class="label">Platform</div><div class="value">${item.platform}</div></div>
        <div class="metric"><div class="label">Touches</div><div class="value">${item.touches}</div></div>
        <div class="metric"><div class="label">Comments</div><div class="value">${item.comments || 0}</div></div>
        <div class="metric"><div class="label">Leads</div><div class="value">${item.leads || 0}</div></div>
      </div>

      <div class="grid two" style="margin-top:10px">
        <input data-title="${prefix}-${item.id}" value="${item.title}" />
        <select data-platform="${prefix}-${item.id}">${platformOptions(item.platform)}</select>
        <select data-pillar="${prefix}-${item.id}">${pillarOptions(item.pillar, pillars)}</select>
        <select data-status="${prefix}-${item.id}">${statusOptions(item.status)}</select>
        <input type="date" data-date="${prefix}-${item.id}" value="${item.date}" />
        <input type="number" min="0" data-touches="${prefix}-${item.id}" value="${item.touches}" />
        <input type="number" min="0" data-comments="${prefix}-${item.id}" value="${item.comments || 0}" />
        <input type="number" min="0" data-leads="${prefix}-${item.id}" value="${item.leads || 0}" />
      </div>

      <label class="inline-check"><input type="checkbox" data-didwell="${prefix}-${item.id}" ${item.didWell ? 'checked' : ''} /> Did it do well?</label>
      <textarea data-notes="${prefix}-${item.id}" placeholder="Notes">${item.notes || ""}</textarea>
      <div class="inline">
        <button onclick="saveContentItem('${prefix}', ${item.id})">Save</button>
      </div>
    </div>
  `).join("") || `<div class="item">No content yet.</div>`;
}

function render(){
  renderList("lwaContentList", state.lwaContent, "lwa", LWA_PILLARS);
  renderList("chbContentList", state.chbContent, "chb", CHB_PILLARS);
}

render();
