import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzG6owpWIPSHTzhe-ri61hlse-MYh4s",
  authDomain: "forest-type-2026.firebaseapp.com",
  databaseURL: "https://forest-type-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "forest-type-2026",
  storageBucket: "forest-type-2026.firebasestorage.app",
  messagingSenderId: "519232433987",
  appId: "1:519232433987:web:da4d308998aacf97ff09f6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadData(){
 const tableDiv = document.getElementById('leaderboardTable');
 try{
  const q = query(collection(db, "leaderboard"), orderBy("score","desc"));
  const snap = await getDocs(q);
  if(snap.empty){
    tableDiv.innerHTML = "<p class='loading'>No players yet.</p>";
    document.getElementById('totalPlayers').textContent = "0"; return;
  }
  let html = "<table><tr><th>#</th><th>Name</th><th>Score</th><th>Date</th><th>Action</th></tr>";
  let total=0, count=0, top=0; let rank=1;
  snap.forEach(d=>{
    const data=d.data();
    const date = data.date?.toDate ? data.date.toDate().toLocaleString() : "N/A";
    html+=`<tr><td>${rank}</td><td><b>${data.name}</b></td><td>${data.score}/10</td><td style='font-size:11px'>${date}</td><td><button onclick="deleteOne('${d.id}')" style='background:#ef5350;color:#fff;border:none;padding:4px 8px;border-radius:6px;cursor:pointer'>Delete</button></td></tr>`;
    total+=data.score; count++; if(data.score>top) top=data.score; rank++;
  });
  html+="</table>"; tableDiv.innerHTML=html;
  document.getElementById('totalPlayers').textContent=count;
  document.getElementById('avgScore').textContent= count? (total/count).toFixed(1):0;
  document.getElementById('topScore').textContent=top;
 }catch(e){ tableDiv.innerHTML=`<p class='loading' style='color:red'>Error: ${e.message}</p>`; }
}
window.refreshData = loadData;
window.deleteOne = async (id)=>{
 if(!confirm("Delete this score?")) return;
 await deleteDoc(doc(db,"leaderboard",id)); loadData();
}
window.clearLeaderboard = async ()=>{
 if(!confirm("Clear ALL leaderboard?")) return;
 const snap = await getDocs(collection(db,"leaderboard"));
 for(const d of snap.docs){ await deleteDoc(doc(db,"leaderboard",d.id)); }
 alert("Cleared!"); loadData();
}
loadData();
