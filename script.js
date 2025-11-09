// ====== Data ======
let peopleList = JSON.parse(localStorage.getItem("peopleList")) || [];
let kitchenTasks = JSON.parse(localStorage.getItem("kitchenTasks")) || [];
let workTasks = JSON.parse(localStorage.getItem("workTasks")) || [];
let availability = JSON.parse(localStorage.getItem("availability")) || {};

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const kitchenSubTasks = ["Breakfast","Lunch","Lunch Dishes","Dinner","Dinner Dishes"];

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
            kitchenSubTasks.forEach(task=>availability[name][day][task]=true);
            availability[name][day]["Work Duty"]=true;
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
        const tasks = kitchenSubTasks.concat(["Work Duty"]);
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

addKitchenTaskBtn.addEventListener("click",()=>{
    const name=kitchenTaskInput.value.trim(); const count=parseInt(kitchenTaskCount.value)||1;
    if(!name) return alert("Task name required");
    const taskObj={name,count,days:{}};
    days.forEach(d=>taskObj.days[d]=false);
    kitchenTasks.push(taskObj); renderTasks(kitchenTasks,kitchenTaskTable); kitchenTaskInput.value=""; kitchenTaskCount.value=1; saveData();
});

addWorkTaskBtn.addEventListener("click",()=>{
    const name=workTaskInput.value.trim(); const count=parseInt(workTaskCount.value)||1;
    const genderReq = workTaskGender.value;
    if(!name) return alert("Task name required");
    const taskObj={name,count,days:{}, genderRequired: genderReq};
    days.forEach(d=>taskObj.days[d]=false);
    workTasks.push(taskObj); renderTasks(workTasks,workTaskTable);
    workTaskInput.value=""; workTaskCount.value=1; workTaskGender.value="Any"; saveData();
});

// ====== Schedule Generation ======
generateBtn.addEventListener("click",()=>generateSchedule());
clearBtn.addEventListener("click",()=>{ kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML=""; });

// ====== Fair Randomized Scheduler ======
function generateSchedule(){
    kitchenScheduleTable.innerHTML="";
    workScheduleTable.innerHTML="";

    // Remove any orphaned availability
    Object.keys(availability).forEach(name=>{
        if(!peopleList.find(p=>p.name===name)) delete availability[name];
    });
    saveData();

    if(peopleList.length===0) return alert("Add people first!");

    // Headers
    const kHead=kitchenScheduleTable.createTHead();
    const kRow=kHead.insertRow();
    kRow.insertCell().textContent="Day/Task";
    peopleList.forEach(p=>kRow.insertCell().textContent=p.name);
    const kBody=kitchenScheduleTable.createTBody();

    const wHead=workScheduleTable.createTHead();
    const wRow=wHead.insertRow();
    wRow.insertCell().textContent="Day";
    peopleList.forEach(p=>wRow.insertCell().textContent=p.name);
    const wBody=workScheduleTable.createTBody();

    // Tracking
    const totalAssignments = {};
    const taskHistory = {};
    peopleList.forEach(p=>{
        totalAssignments[p.name]=0;
        taskHistory[p.name]=new Set();
    });

    const allTasks = [...kitchenTasks.map(t=>({...t,type:"kitchen"})), ...workTasks.map(t=>({...t,type:"work"}))];

    days.forEach(day=>{
        // Build kitchen rows
        kitchenSubTasks.forEach((sub, idx)=>{
            const row=kBody.insertRow();
            if(idx===0){ const dcell=row.insertCell(); dcell.textContent=day; dcell.rowSpan=kitchenSubTasks.length; }
            else row.insertCell();
            row.insertCell().textContent=sub;
            peopleList.forEach(()=>row.insertCell());
        });

        const wDayRow=wBody.insertRow();
        wDayRow.insertCell().textContent=day;
        peopleList.forEach(()=>wDayRow.insertCell());

        shuffle(allTasks).forEach(task=>{
            if(!task.days[day]) return;

            const available = peopleList.filter(p=>{
                if(task.type==="kitchen") return availability[p.name][day][task.name] || availability[p.name][day][task.name]?.["Work Duty"];
                return availability[p.name][day]["Work Duty"];
            }).filter(p=>!task.genderRequired || task.genderRequired==="Any" || p.gender===task.genderRequired);

            if(available.length===0) return;
            shuffle(available);

            for(let i=0;i<task.count;i++){
                available.sort((a,b)=>totalAssignments[a.name]-totalAssignments[b.name]);
                let chosen = available.find(p=>!taskHistory[p.name].has(task.name)) || available[0];
                totalAssignments[chosen.name]++;
                taskHistory[chosen.name].add(task.name);

                const personIdx = peopleList.findIndex(pl=>pl.name===chosen.name)+1;
                if(task.type==="kitchen"){
                    const row = [...kBody.rows].find(r=>r.cells[1]?.textContent===task.name || r.cells[1]?.textContent===sub);
                    if(row){
                        const cell = row.cells[personIdx+1];
                        if(cell){
                            cell.textContent += (cell.textContent?", ":"")+task.name;
                            cell.className="kitchen-task";
                        }
                    }
                } else {
                    const cell = wDayRow.cells[personIdx];
                    if(cell){
                        cell.textContent += (cell.textContent?", ":"")+task.name;
                        cell.className="work-task";
                    }
                }
            }
        });
    });
}

// ====== Reset All Data Button ======
const resetBtn = document.createElement("button");
resetBtn.textContent="Reset All Data";
resetBtn.style.backgroundColor="orange";
resetBtn.style.marginTop="10px";
resetBtn.onclick=()=>{
    if(confirm("Are you sure you want to reset all data?")){
        localStorage.clear();
        location.reload();
    }
};
document.body.appendChild(resetBtn);
