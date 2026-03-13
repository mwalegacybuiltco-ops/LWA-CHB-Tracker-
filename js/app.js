
let leads = JSON.parse(localStorage.getItem("leads") || "[]")
let chb = JSON.parse(localStorage.getItem("chb") || "[]")

function save(){
localStorage.setItem("leads",JSON.stringify(leads))
localStorage.setItem("chb",JSON.stringify(chb))
render()
}

function addLead(){
const name=document.getElementById("leadName").value
const platform=document.getElementById("leadPlatform").value
const date=document.getElementById("followupDate").value
const notes=document.getElementById("leadNotes").value

leads.push({name,platform,date,notes})
save()
}

function addCHB(){
const name=document.getElementById("chbName").value
const platform=document.getElementById("chbPlatform").value
const notes=document.getElementById("chbNotes").value

chb.push({name,platform,notes})
save()
}

function render(){

const leadList=document.getElementById("leadList")
leadList.innerHTML=""

leads.forEach(l=>{
const li=document.createElement("li")
li.innerHTML=`${l.name} | ${l.platform} | Follow-up: ${l.date}<br>${l.notes}`
leadList.appendChild(li)
})

const chbList=document.getElementById("chbList")
chbList.innerHTML=""

chb.forEach(c=>{
const li=document.createElement("li")
li.innerHTML=`${c.name} | ${c.platform}<br>${c.notes}`
chbList.appendChild(li)
})

}

render()
