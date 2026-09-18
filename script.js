const KEY_LOGS="esp32_logs",KEY_USERS="esp32_users";
let logs=JSON.parse(localStorage.getItem(KEY_LOGS)||"[]"),users=JSON.parse(localStorage.getItem(KEY_USERS)||"[]");
const $=id=>document.getElementById(id);

document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");$(b.dataset.page).classList.add("active");renderAll();
});

function save(){localStorage.setItem(KEY_LOGS,JSON.stringify(logs));localStorage.setItem(KEY_USERS,JSON.stringify(users));}
function renderAll(){
  renderLogs();renderUsers();renderRecent();
  $("today").textContent=logs.filter(x=>new Date(x.time).toDateString()===new Date().toDateString()).length;
  $("userCount").textContent=users.length;
}
function renderLogs(){
  let q=($("search")?.value||"").toLowerCase();
  let a=logs.filter(x=>(x.uid+(x.name||"")).toLowerCase().includes(q));
  $("logBody").innerHTML=a.length?a.map(x=>"<tr><td>"+new Date(x.time).toLocaleString("th-TH")+"</td><td>"+x.uid+"</td><td>"+(x.name||"ไม่ระบุ")+"</td><td><span class='badge "+(x.granted?"grant":"deny")+"'>"+(x.granted?"อนุญาต":"ปฏิเสธ")+"</span></td><td>"+(x.action||"RFID Scan")+"</td></tr>").join(""):"<tr><td colspan='5'>ยังไม่มีข้อมูล</td></tr>";
}
function renderRecent(){
  let a=logs.slice(0,5);
  $("recent").innerHTML=a.length?a.map(x=>"<div class='recentitem'><b>"+(x.name||"ไม่ระบุ")+"</b> • "+x.uid+"<br><small>"+new Date(x.time).toLocaleString("th-TH")+"</small></div>").join(""):"ยังไม่มีการสแกน";
}
function renderUsers(){
  $("userBody").innerHTML=users.length?users.map((u,i)=>"<tr><td>"+u.name+"</td><td>"+u.uid+"</td><td>"+u.role+"</td><td><button class='danger' onclick='removeUser("+i+")'>ลบ</button></td></tr>").join(""):"<tr><td colspan='4'>ยังไม่มีผู้ใช้</td></tr>";
}
function addUser(){
  let name=prompt("ชื่อผู้ใช้:");if(!name)return;
  let uid=prompt("UID บัตร เช่น A3:B4:C5:D6:");if(!uid)return;
  users.push({name,uid:uid.toUpperCase(),role:"User"});save();renderAll();
}
function removeUser(i){if(confirm("ลบผู้ใช้นี้?")){users.splice(i,1);save();renderAll();}}
function clearLogs(){if(confirm("ล้างประวัติทั้งหมด?")){logs=[];save();renderAll();}}

function saveSettings(){
  localStorage.setItem("esp_ip",$("espIp").value.trim());
  alert("บันทึก IP แล้ว");
}

function espUrl(path){
  let ip=$("espIp").value.trim();
  if(!ip)return null;
  if(ip.startsWith("http://")||ip.startsWith("https://"))return ip+path;
  return "http://"+ip+path;
}

async function testConnection(){
  let url=espUrl("/api/status");
  if(!url){alert("ใส่ IP ของ ESP32 ก่อน");return;}
  try{
    let r=await fetch(url,{cache:"no-store"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    let data=await r.json();
    updateStatus(data);
    setOnline(true);
    alert("เชื่อมต่อสำเร็จ • "+(data.ip||"ESP32"));
  }catch(e){
    setOnline(false);
    alert("เชื่อมต่อไม่ได้\n\nถ้า ESP32 ต่อ Wi-Fi แล้ว ให้เปิด "+url+" ในแท็บใหม่เพื่อทดสอบก่อน");
  }
}
function setOnline(v){
  $("conn").textContent=v?"● Online":"● Offline";
  $("conn").className="pill "+(v?"online":"offline");
  $("esp").textContent=v?"Online":"Offline";
  $("wifiStatus").textContent=v?"Connected":"Offline";
}

function updateStatus(data){
  let unlocked=data.door==="unlocked";
  $("door").textContent=unlocked?"Unlocked":"Locked";
  $("relayStatus").textContent=unlocked?"Unlocked":"Locked";
  $("wifiStatus").textContent=data.wifi?"Connected":"Offline";
  $("uptime").textContent="Uptime: "+Math.floor((Number(data.uptime)||0)/1000)+"s";
}

async function syncESP32(){
  let url=espUrl("/api/status");
  if(!url)return;
  try{
    let r=await fetch(url,{cache:"no-store"});
    if(!r.ok)throw new Error();
    updateStatus(await r.json());setOnline(true);
    await syncLogs();
  }catch(e){setOnline(false);}
}

async function syncLogs(){
  let url=espUrl("/api/logs");
  if(!url)return;
  try{
    let r=await fetch(url,{cache:"no-store"});
    if(!r.ok)throw new Error();
    let remote=await r.json();
    logs=remote.map(x=>({
      uid:x.uid,time:new Date().toISOString(),name:(users.find(u=>u.uid===x.uid)||{}).name||"ไม่ระบุ",
      granted:!!x.granted,action:"RFID Scan"
    })).reverse();
    save();renderAll();
  }catch(e){}
}

$("espIp").value=localStorage.getItem("esp_ip")||"";
renderAll();
setInterval(syncESP32,5000);
