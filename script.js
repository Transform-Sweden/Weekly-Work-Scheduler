// ====== Data ======
let peopleList = JSON.parse(localStorage.getItem("peopleList")) || [];
let kitchenTasks = JSON.parse(localStorage.getItem("kitchenTasks")) || [];
let workTasks = JSON.parse(localStorage.getItem("workTasks")) || [];
let availability = JSON.parse(localStorage.getItem("availability")) || {};

// Days & kitchen sub-tasks
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const kitchenSubTasks = ["Breakfast","Lunch","Lunch Dishes","Dinner","Dinner Dishes"];

// ====== Elements ======
const personInput = document.getElementById("person-name");
const addPersonBtn = document.getElementById("add-person-btn");
const peopleUl = document.getElementById("people-list");

const kitchenTaskInput = document.getElementById("kitchen-task-name");
const kitchenTaskCount = document.getElementById("kitchen-task-count");
const addKitchenTaskBtn = document.getElementById("add-kitchen-task-btn");
const kitchenTaskTable = document.getElementById("kitchen-task-table").querySelector("tbody");

const workTaskInput = document.getElementById("work-task-name");
const workTaskCount = document.getElementById("work-task-count");
const addWorkTaskBtn = document.getElementById("add-work-task-btn");
const workTaskTable = document.getElementById("work-task-table").querySelector("tbody");

const availabilityTable = document.getElementById("availability-table").querySelector("tbody");

const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const kitchenScheduleTable = document.getElementById("kitchen-schedule-table");
const workScheduleTable = document.getElementById("work-schedule-table");

// ====== Utility ======
function saveData() {
    localStorage.setItem("peopleList", JSON.stringify(peopleList));
    localStorage.setItem("kitchenTasks", JSON.stringify(kitchenTasks));
    localStorage.setItem("workTasks", JSON.stringify(workTasks));
    localStorage.setItem("availability", JSON.stringify(availability));
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// ====== People ======
addPersonBtn.addEventListener("click", () => {
    const name = personInput.value.trim();
    if (!name) return alert("Name required");
    if (!peopleList.includes(name)) {
        peopleList.push(name);
        availability[name] = {};
        days.forEach(day => {
            availability[name][day] = {};
            kitchenSubTasks.forEach(task => availability[name][day][task]=true);
            availability[name][day]["Work Duty"] = true; // linked automatically
        });
        renderPeople();
        renderAvailability();
        saveData();
        personInput.value = "";
    }
});

function removePerson(name){
    const idx = peopleList.indexOf(name);
    if (idx>-1){
        peopleList.splice(idx,1);
        delete availability[name];
        renderPeople();
        renderAvailability();
        saveData();
    }
}

function renderPeople(){
    peopleUl.innerHTML = "";
    peopleList.forEach(name=>{
        const li = document.createElement("li");
        li.textContent = name + " ";
        const btn = document.createElement("button");
        btn.textContent="Remove";
        btn.className="remove-btn";
        btn.onclick = ()=> removePerson(name);
        li.appendChild(btn);
        peopleUl.appendChild(li);
    });
}

// ====== Availability ======
function renderAvailability(){
    availabilityTable.innerHTML="";
    peopleList.forEach(name=>{
        const tr = document.createElement("tr");
        const nameTd = document.createElement("td");
        nameTd.textContent=name;
        tr.appendChild(nameTd);

        days.forEach(day=>{
            const td = document.createElement("td");
            kitchenSubTasks.concat(["Work Duty"]).forEach(sub=>{
                const cb = document.createElement("input");
                cb.type="checkbox";
                cb.checked=availability[name][day][sub];
                cb.onchange=()=>{
                    availability[name][day][sub]=cb.checked;
                    // Linked availability: Lunch Dishes <-> Work Duty
                    if(sub==="Lunch Dishes") availability[name][day]["Work Duty"]=cb.checked;
                    if(sub==="Work Duty") availability[name][day]["Lunch Dishes"]=cb.checked;
                    renderAvailability();
                    saveData();
                };
                td.appendChild(cb);
                td.appendChild(document.createTextNode(sub[0]));
                td.appendChild(document.createElement("br"));
            });
            tr.appendChild(td);
        });
        availabilityTable.appendChild(tr);
    });
}

// ====== Tasks ======
function renderTasks(taskArray, tableBody){
    tableBody.innerHTML="";
    taskArray.forEach((task, idx)=>{
        const tr=document.createElement("tr");

        const nameTd=document.createElement("td");
        nameTd.textContent=task.name;
        tr.appendChild(nameTd);

        const countTd=document.createElement("td");
        const countInput=document.createElement("input");
        countInput.type="number";
        countInput.value=task.count;
        countInput.min=1;
        countInput.onchange=()=>{task.count=parseInt(countInput.value)||1; saveData();}
        countTd.appendChild(countInput);
        tr.appendChild(countTd);

        const daysTd=document.createElement("td");
        Object.keys(task.days).forEach(day=>{
            const label=document.createElement("label");
            label.className="task-label";
            const cb=document.createElement("input");
            cb.type="checkbox";
            cb.checked=task.days[day];
            cb.onchange=()=>{task.days[day]=cb.checked; saveData();}
            label.appendChild(cb);
            label.appendChild(document.createTextNode(day[0]));
            daysTd.appendChild(label);
        });
        tr.appendChild(daysTd);

        const removeTd=document.createElement("td");
        const btn=document.createElement("button");
        btn.textContent="Remove";
        btn.className="remove-btn";
        btn.onclick=()=>{taskArray.splice(idx,1); renderTasks(taskArray,tableBody); saveData();}
        removeTd.appendChild(btn);
        tr.appendChild(removeTd);

        tableBody.appendChild(tr);
    });
}

// Add Task Events
addKitchenTaskBtn.addEventListener("click",()=>{
    const name=kitchenTaskInput.value.trim();
    const count=parseInt(kitchenTaskCount.value)||1;
    if(!name) return alert("Task name required");
    const taskObj={name,count,days:{}};
    days.forEach(day=>taskObj.days[day]=true);
    kitchenTasks.push(taskObj);
    renderTasks(kitchenTasks,kitchenTaskTable);
    kitchenTaskInput.value="";
    kitchenTaskCount.value=1;
    saveData();
});

addWorkTaskBtn.addEventListener("click",()=>{
    const name=workTaskInput.value.trim();
    const count=parseInt(workTaskCount.value)||1;
    if(!name) return alert("Task name required");
    const taskObj={name,count,days:{}};
    days.forEach(day=>taskObj.days[day]=true);
    workTasks.push(taskObj);
    renderTasks(workTasks,workTaskTable);
    workTaskInput.value="";
    workTaskCount.value=1;
    saveData();
});

// ====== Schedule Generation ======
generateBtn.addEventListener("click",()=>generateSchedule());
clearBtn.addEventListener("click",()=>{
    kitchenScheduleTable.innerHTML="";
    workScheduleTable.innerHTML="";
});

function generateSchedule(){
    kitchenScheduleTable.innerHTML="";
    workScheduleTable.innerHTML="";

    // Kitchen Schedule
    const kHead=kitchenScheduleTable.createTHead();
    const kHeadRow=kHead.insertRow();
    kHeadRow.insertCell().textContent="Day";
    peopleList.forEach(name=>kHeadRow.insertCell().textContent=name);

    const kBody=kitchenScheduleTable.createTBody();
    const kDayRows={};
    days.forEach(day=>{
        kitchenSubTasks.forEach(sub=>{
            const row=kBody.insertRow();
            row.insertCell().textContent=`${day} - ${sub}`;
            peopleList.forEach(()=>row.insertCell());
            kDayRows[`${day}-${sub}`]=row;
        });
    });

    // Work Schedule
    const wHead=workScheduleTable.createTHead();
    const wHeadRow=wHead.insertRow();
    wHeadRow.insertCell().textContent="Day";
    peopleList.forEach(name=>wHeadRow.insertCell().textContent=name);

    const wBody=workScheduleTable.createTBody();
    const wDayRows={};
    days.forEach(day=>{
        const row=wBody.insertRow();
        row.insertCell().textContent=day;
        peopleList.forEach(()=>row.insertCell());
        wDayRows[day]=row;
    });

    // Assign Kitchen Tasks
    kitchenTasks.forEach(task=>{
        days.forEach(day=>{
            if(task.days[day]){
                const availablePeople=shuffle(peopleList.filter(p=>availability[p][day][task.name]??true));
                for(let i=0;i<task.count;i++){
                    const p=availablePeople[i%availablePeople.length];
                    const cellIdx=peopleList.indexOf(p)+1;
                    kDayRows[`${day}-${task.name}`].cells[cellIdx].textContent+=(kDayRows[`${day}-${task.name}`].cells[cellIdx].textContent?" , ":"")+task.name;
                    kDayRows[`${day}-${task.name}`].cells[cellIdx].className="kitchen-task";
                }
            }
        });
    });

    // Assign Work Tasks (linked to Lunch Dishes)
    workTasks.forEach(task=>{
        days.forEach(day=>{
            if(task.days[day]){
                const availablePeople=shuffle(peopleList.filter(p=>availability[p][day]["Lunch Dishes"]));
                for(let i=0;i<task.count;i++){
                    const p=availablePeople[i%availablePeople.length];
                    const cellIdx=peopleList.indexOf(p)+1;
                    wDayRows[day].cells[cellIdx].textContent+=(wDayRows[day].cells[cellIdx].textContent?" , ":"")+task.name;
                    wDayRows[day].cells[cellIdx].className="work-task";
                }
            }
        });
    });
}

// ====== Initial Render ======
renderPeople();
renderAvailability();
renderTasks(kitchenTasks,kitchenTaskTable);
renderTasks(workTasks,workTaskTable);
