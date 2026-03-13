
let content = JSON.parse(localStorage.getItem("content")||"[]")

const list = document.getElementById("contentList")

function save(){
localStorage.setItem("content",JSON.stringify(content))
render()
}

function addContent(){

const item = {
title:contentTitle.value,
business:contentBusiness.value,
platform:contentPlatform.value,
status:contentStatus.value,
date:contentDate.value
}

content.push(item)
save()

contentTitle.value=""
}

function render(){

list.innerHTML=""

content.forEach(c=>{

const card=document.createElement("div")
card.className="card"

card.innerHTML=`
<b>${c.title}</b><br>
Business: ${c.business}<br>
Platform: ${c.platform}<br>
Status: ${c.status}<br>
Date: ${c.date}
`

list.appendChild(card)

})

}

render()
