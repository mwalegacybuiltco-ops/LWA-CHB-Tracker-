
let lwa = JSON.parse(localStorage.getItem("lwa")||"[]")
let chb = JSON.parse(localStorage.getItem("chb")||"[]")

const lwaList = document.getElementById("lwaList")
const chbList = document.getElementById("chbList")
const calendar = document.getElementById("calendar")

function save(){
localStorage.setItem("lwa",JSON.stringify(lwa))
localStorage.setItem("chb",JSON.stringify(chb))
render()
}

function render(){

lwaList.innerHTML = ""
chbList.innerHTML = ""
calendar.innerHTML = ""

lwa.forEach(l=>{
lwaList.innerHTML += `<div class="card"><b>${l.name}</b> - ${l.platform}<br>${l.date}<br>${l.notes}</div>`
calendar.innerHTML += `<div class="card">${l.date} - ${l.name} (LWA)</div>`
})

chb.forEach(c=>{
chbList.innerHTML += `<div class="card"><b>${c.name}</b> - ${c.platform}<br>${c.date}<br>${c.notes}</div>`
calendar.innerHTML += `<div class="card">${c.date} - ${c.name} (CHB)</div>`
})

}

document.getElementById("addLWA").onclick=()=>{

let lead={
name:lwaName.value,
platform:lwaPlatform.value,
follow:lwaFollow.value,
date:lwaDate.value,
vip:lwaVIP.checked,
affiliate:lwaAffiliate.checked,
ambassador:lwaAmbassador.checked,
ghosted:lwaGhosted.checked,
notes:lwaNotes.value
}

lwa.push(lead)
save()
}

document.getElementById("addCHB").onclick=()=>{

let lead={
name:chbName.value,
platform:chbPlatform.value,
follow:chbFollow.value,
date:chbDate.value,
vip:chbVIP.checked,
affiliate:chbAffiliate.checked,
ambassador:chbAmbassador.checked,
ghosted:chbGhosted.checked,
notes:chbNotes.value
}

chb.push(lead)
save()
}

tabLWA.onclick=()=>{
lwaSection.style.display="block"
chbSection.style.display="none"
calendarSection.style.display="none"
}

tabCHB.onclick=()=>{
lwaSection.style.display="none"
chbSection.style.display="block"
calendarSection.style.display="none"
}

tabCalendar.onclick=()=>{
lwaSection.style.display="none"
chbSection.style.display="none"
calendarSection.style.display="block"
}

render()
