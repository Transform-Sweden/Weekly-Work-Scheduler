// ====== Data ======
let peopleList = JSON.parse(localStorage.getItem("peopleList")) || [];
let kitchenTasks = JSON.parse(localStorage.getItem("kitchenTasks")) || [];
let workTasks = JSON.parse(localStorage.getItem("workTasks")) || [];
let availability = JSON.parse(localStorage.getItem("availability")) || {};

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const kitchenSubTasks = ["Breakfast","Lunch","Lunch Dishes","Dinner","Dinner Dishes","Work Duty"];

// ====== Elements ======
const personInput = document.getElementById("person-name");
const personGender = document.getElementById("person-gender");
const addPersonBtn = document.getElementById("add-person-btn");
const peopleUl = document.getElementById("people-list");

const kitchenTaskInput = document.getElementById("kitchen-task-name");
const kitchenTaskCount = document.getElementById("kitchen-task-count");
const addKitchenTaskBtn = document.getElementById("add-kitchen-task-btn");
const kitchenTaskTable = document.getElementById("kitchen-task-table").querySelector("tbody");

const workTaskInput = document.getElementById("work-task-name");
const workTaskCount = document.getElementById("work-task-count");
const workTaskGender = document.getElementById("work-task-gender");
const addWorkTaskBtn = document.getElementById("add-work-task-btn");
const workTaskTable = document.getElementById("work-task-table").querySelector("tbody");

const availabilityTable = document.getElementById("availability-table").querySelector("tbody");

const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const darkmodeBtn = document.getElementById("darkmode-btn");

const kitchenScheduleTable = document.getElementById("kitchen-schedule-table");
const workScheduleTable = document.getElementById("work-schedule-table");

// ====== Utility ======
function saveData(){
    localStorage.setItem("peopleList", JSON.stringify(peopleList));
    localStorage.setItem("kitchenTasks", JSON.stringify(kitchenTasks));
    localStorage.setItem("workTasks", JSON.stringify(workTasks));
    localStorage.setItem("availability", JSON.stringify(availability));
}
function shuffle(array){ return array.sort(()=>Math.random()-0.5); }

// ====== People ======
addPersonBtn.addEventListener("click",()=>{
    const name = personInput.value.trim();
    const gender = personGender.value;
    if(!name) return alert("Name required");
    if(!peopleList.find(p=>p.name===name)){
        peopleList.push({name, gender});
        availability[name]={};
        days.forEach(day=>{
            availability[name][day]={};
            ["Breakfast","Lunch","Lunch Dishes","Dinner","Dinner Dishes","Work Duty"].forEach(task=>{
                availability[name][day][task]=true;
            });
        });
        renderPeople();
        renderAvailability();
        saveData();
        personInput.value="";
    }
});
function removePerson(name){
    const idx = peopleList.findIndex(p=>p.name===name);
    if(idx>-1){
        peopleList.splice(idx,1);
        delete availability[name];
        renderPeople();
        renderAvailability();
        saveData();
    }
}
function renderPeople(){
    peopleUl.innerHTML="";
    peopleList.forEach(p=>{
        const li=document.createElement("li");
        li.textContent=`${p.name} (${p.gender}) `;
        const btn=document.createElement("button");
        btn.textContent="Remove";
        btn.className="remove-btn";
        btn.onclick=()=>removePerson(p.name);
        li.appendChild(btn);
        peopleUl.appendChild(li);
    });
}

// ====== Availability ======
function renderAvailability(){
    availabilityTable.innerHTML="";
    peopleList.forEach(p=>{
        const tasks = ["Breakfast","Lunch","Lunch Dishes","Dinner","Dinner Dishes","Work Duty"];
        tasks.forEach((task, idx)=>{
            const tr=document.createElement("tr");
            if(idx===0){
                const nameTd=document.createElement("td");
                nameTd.textContent=p.name;
                nameTd.rowSpan=tasks.length;
                tr.appendChild(nameTd);
            }
            const taskTd=document.createElement("td");
            taskTd.textContent=task;
            tr.appendChild(taskTd);

            days.forEach(day=>{
                const td=document.createElement("td");
                const cb=document.createElement("input");
                cb.type="checkbox";
                cb.checked=availability[p.name][day][task];
                cb.onchange=()=>{
                    availability[p.name][day][task]=cb.checked;
                    // link Lunch Dishes and Work Duty
                    if(task==="Lunch Dishes"){
                        availability[p.name][day]["Work Duty"]=cb.checked;
                    }
                    if(task==="Work Duty"){
                        availability[p.name][day]["Lunch Dishes"]=cb.checked;
                    }
                    saveData();
                };
                td.appendChild(cb);
                tr.appendChild(td);
            });
            availabilityTable.appendChild(tr);
        });
    });
}

// ====== Tasks ======
function renderTasks(taskArray, tableBody){
    tableBody.innerHTML="";
    taskArray.forEach((task, idx)=>{
        const tr=document.createElement("tr");

        const nameTd=document.createElement("td"); nameTd.textContent=task.name; tr.appendChild(nameTd);

        const countTd=document.createElement("td");
        const countInput=document.createElement("input");
        countInput.type="number"; countInput.value=task.count; countInput.min=1;
        countInput.onchange=()=>{task.count=parseInt(countInput.value)||1; saveData();}
        countTd.appendChild(countInput); tr.appendChild(countTd);

        const daysTd=document.createElement("td");
        Object.keys(task.days).forEach(day=>{
            const label=document.createElement("label"); label.className="task-label";
            const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=task.days[day];
            cb.onchange=()=>{task.days[day]=cb.checked; saveData();}
            label.appendChild(cb); label.appendChild(document.createTextNode(day[0]));
            daysTd.appendChild(label);
        });
        tr.appendChild(daysTd);

        const removeTd=document.createElement("td");
        const btn=document.createElement("button"); btn.textContent="Remove"; btn.className="remove-btn";
        btn.onclick=()=>{taskArray.splice(idx,1); renderTasks(taskArray,tableBody); saveData();}
        removeTd.appendChild(btn); tr.appendChild(removeTd);

        tableBody.appendChild(tr);
    });
}

// Add Task Events
addKitchenTaskBtn.addEventListener("click",()=>{
    const name=kitchenTaskInput.value.trim(); const count=parseInt(kitchenTaskCount.value)||1;
    if(!name) return alert("Task name required");
    const taskObj={name,count,days:{}};
    days.forEach(d=>taskObj.days[d]=true); // kitchen tasks start checked
    kitchenTasks.push(taskObj);
    renderTasks(kitchenTasks,kitchenTaskTable);
    kitchenTaskInput.value=""; kitchenTaskCount.value=1; saveData();
});
addWorkTaskBtn.addEventListener("click",()=>{
    const name=workTaskInput.value.trim(); const count=parseInt(workTaskCount.value)||1;
    const genderReq = workTaskGender.value;
    if(!name) return alert("Task name required");
    const taskObj={name,count,days:{}, genderRequired: genderReq};
    days.forEach(d=>taskObj.days[d]=false); // work tasks start unchecked
    workTasks.push(taskObj);
    renderTasks(workTasks,workTaskTable);
    workTaskInput.value=""; workTaskCount.value=1; workTaskGender.value="Any"; saveData();
});

// ====== Schedule Generation ======
generateBtn.addEventListener("click",()=>generateSchedule());
clearBtn.addEventListener("click",()=>{ kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML=""; });

// ====== Fair & Balanced Schedule ======
function generateSchedule(){
    kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML="";

    if(peopleList.length===0) return alert("Add people first.");

    // Build kitchen schedule header
    const kHead=kitchenScheduleTable.createTHead();
    const kHeadRow=kHead.insertRow();
    kHeadRow.insertCell().textContent="Day / Task";
    peopleList.forEach(p=>kHeadRow.insertCell().textContent=p.name);
    const kBody=kitchenScheduleTable.createTBody();

    const kDayRows={};
    days.forEach(day=>{
        ["Breakfast","Lunch","Lunch Dishes","Dinner","Dinner Dishes"].forEach((sub, idx)=>{
            const row=kBody.insertRow();
            if(idx===0){
                const dayTd=row.insertCell();
                dayTd.textContent=day;
                dayTd.rowSpan=5;
            }
            const taskTd=row.insertCell();
            taskTd.textContent=sub;
            peopleList.forEach(()=>row.insertCell());
            kDayRows[`${day}-${sub}`]=row;
        });
    });

    // Build work schedule header
    const wHead=workScheduleTable.createTHead();
    const wHeadRow=wHead.insertRow();
    wHeadRow.insertCell().textContent="Day";
    peopleList.forEach(p=>wHeadRow.insertCell().textContent=p.name);
    const wBody=workScheduleTable.createTBody();
    const wDayRows={};
    days.forEach(d=>{
        const row=wBody.insertRow();
        row.insertCell().textContent=d;
        peopleList.forEach(()=>row.insertCell());
        wDayRows[d]=row;
    });

    // ====== Assignment Tracking ======
    const kitchenLoad = Object.fromEntries(peopleList.map(p=>[p.name,0]));
    const workLoad = Object.fromEntries(peopleList.map(p=>[p.name,0]));

    days.forEach(day=>{
        const assignedToday = new Set();
        // --- Kitchen ---
        const availableKitchenTasks = ["Breakfast","Lunch","Lunch Dishes","Dinner","Dinner Dishes"];
        availableKitchenTasks.forEach(task=>{
            let available = peopleList.filter(p=>availability[p.name][day][task]);
            available = shuffle(available).sort((a,b)=>kitchenLoad[a.name]-kitchenLoad[b.name]);
            const needed = Math.min(available.length, 1); // one person per subtask
            const selected = available.slice(0,needed);
            selected.forEach(sel=>{
                if(!assignedToday.has(sel.name)){
                    const cellIdx = peopleList.findIndex(pl=>pl.name===sel.name)+2;
                    const cell = kDayRows[`${day}-${task}`].cells[cellIdx];
                    cell.textContent="✓";
                    kitchenLoad[sel.name]++;
                    assignedToday.add(sel.name);
                }
            });
        });

        // --- Work Duties ---
        workTasks.forEach(task=>{
            if(!task.days[day]) return;
            let available = peopleList.filter(p=>
                availability[p.name][day]["Lunch Dishes"] &&
                (task.genderRequired==="Any" || p.gender===task.genderRequired)
            );
            available = shuffle(available).sort((a,b)=>workLoad[a.name]-workLoad[b.name]);
            const count = Math.min(task.count, available.length);
            for(let i=0;i<count;i++){
                const sel = available[i];
                if(!sel) continue;
                const cellIdx = peopleList.findIndex(pl=>pl.name===sel.name)+1;
                const cell = wDayRows[day].cells[cellIdx];
                if(cell.textContent) cell.textContent += ", "+task.name;
                else cell.textContent = task.name;
                workLoad[sel.name]++;
            }
        });
    });
}

// ====== Reset All Data Section ======
const resetSection = document.createElement("section");
resetSection.style.background = "#fff8e1";
resetSection.style.border = "2px solid #ffeb3b";
resetSection.style.borderRadius = "8px";
resetSection.style.padding = "10px";
resetSection.style.marginTop = "20px";
resetSection.innerHTML = `
  <h3 style="color:#ff6f00;">⚠️ Reset All Data</h3>
  <p>This will permanently clear all names, tasks, and schedules.</p>
  <button id="reset-all-btn" style="background:#ff9800;">Reset All</button>
`;
document.body.appendChild(resetSection);

document.getElementById("reset-all-btn").addEventListener("click", ()=>{
  if(confirm("Are you sure you want to clear everything?")){
    localStorage.clear();
    location.reload();
  }
});
