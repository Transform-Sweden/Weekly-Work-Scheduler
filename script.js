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
addPersonBtn.addEventListener("click", () => {
  const name = personInput.value.trim();
  const gender = personGender.value;
  if (!name) return alert("Name required");
  if (!peopleList.find(p => p.name === name)) {
    peopleList.push({ name, gender });
    availability[name] = {};
    days.forEach(day => {
      availability[name][day] = {};
      kitchenSubTasks.forEach(task => availability[name][day][task] = true);
      availability[name][day]["Work Duty"] = true;
    });
    renderPeople();
    renderAvailability();
    saveData();
    personInput.value = "";
  }
});

function removePerson(name){
  const idx = peopleList.findIndex(p=>p.name===name);
  if (idx > -1){
    peopleList.splice(idx,1);
    delete availability[name];
    renderPeople();
    renderAvailability();
    saveData();
  }
}

function renderPeople(){
  peopleUl.innerHTML = "";
  peopleList.forEach(p=>{
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.gender}) `;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.className = "remove-btn";
    btn.onclick = ()=>removePerson(p.name);
    li.appendChild(btn);
    peopleUl.appendChild(li);
  });
}

// ====== Availability ======
function renderAvailability(){
  availabilityTable.innerHTML = "";

  // Ensure availability structure exists for all people/days/tasks
  peopleList.forEach(p=>{
    if(!availability[p.name]) availability[p.name] = {};
    days.forEach(day=>{
      if(!availability[p.name][day]) availability[p.name][day] = {};
      kitchenSubTasks.forEach(sub => {
        if(availability[p.name][day][sub] === undefined) availability[p.name][day][sub] = true;
      });
      if(availability[p.name][day]["Work Duty"] === undefined) availability[p.name][day]["Work Duty"] = true;
    });
  });

  peopleList.forEach(p=>{
    const tasks = kitchenSubTasks.concat(["Work Duty"]);
    tasks.forEach((task, idx)=>{
      const tr = document.createElement("tr");
      if(idx === 0){
        const nameTd = document.createElement("td");
        nameTd.textContent = p.name;
        nameTd.rowSpan = tasks.length;
        tr.appendChild(nameTd);
      }
      const taskTd = document.createElement("td");
      taskTd.textContent = task;
      tr.appendChild(taskTd);

      days.forEach(day=>{
        const td = document.createElement("td");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!availability[p.name][day][task];
        cb.onchange = ()=>{
          availability[p.name][day][task] = cb.checked;
          saveData();
        };
        td.appendChild(cb);
        tr.appendChild(td);
      });
      availabilityTable.appendChild(tr);
    });
  });
}

// ====== Tasks UI ======
function renderTasks(taskArray, tableBody){
  tableBody.innerHTML = "";
  taskArray.forEach((task, idx)=>{
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = task.name;
    tr.appendChild(nameTd);

    const countTd = document.createElement("td");
    const countInput = document.createElement("input");
    countInput.type = "number";
    countInput.value = task.count;
    countInput.min = 1;
    countInput.onchange = ()=>{ task.count = parseInt(countInput.value) || 1; saveData(); };
    countTd.appendChild(countInput);
    tr.appendChild(countTd);

    const daysTd = document.createElement("td");
    days.forEach(d=>{
      const label = document.createElement("label"); label.className = "task-label";
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !!task.days[d];
      cb.onchange = ()=>{ task.days[d] = cb.checked; saveData(); };
      label.appendChild(cb); label.appendChild(document.createTextNode(d[0]));
      daysTd.appendChild(label);
    });
    tr.appendChild(daysTd);

    const removeTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.className = "remove-btn";
    btn.onclick = ()=>{ taskArray.splice(idx,1); renderTasks(taskArray, tableBody); saveData(); };
    removeTd.appendChild(btn);
    tr.appendChild(removeTd);

    tableBody.appendChild(tr);
  });
}

// ====== Add Tasks ======
addKitchenTaskBtn.addEventListener("click", ()=>{
  const name = kitchenTaskInput.value.trim();
  const count = parseInt(kitchenTaskCount.value) || 1;
  if(!name) return alert("Task name required");
  const taskObj = { name, count, days: {} };
  days.forEach(d => taskObj.days[d] = false);
  kitchenTasks.push(taskObj);
  renderTasks(kitchenTasks, kitchenTaskTable);
  kitchenTaskInput.value = "";
  kitchenTaskCount.value = 1;
  saveData();
});

addWorkTaskBtn.addEventListener("click", ()=>{
  const name = workTaskInput.value.trim();
  const count = parseInt(workTaskCount.value) || 1;
  const genderReq = workTaskGender.value;
  if(!name) return alert("Task name required");
  const taskObj = { name, count, days: {}, genderRequired: genderReq };
  days.forEach(d => taskObj.days[d] = false);
  workTasks.push(taskObj);
  renderTasks(workTasks, workTaskTable);
  workTaskInput.value = "";
  workTaskCount.value = 1;
  workTaskGender.value = "Any";
  saveData();
});

// ====== Generate & Clear ======
generateBtn.addEventListener("click", ()=>generateSchedule());
clearBtn.addEventListener("click", ()=>{ kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML=""; });

// ====== Scheduler ======
function generateSchedule(){
  // clear tables
  kitchenScheduleTable.innerHTML = "";
  workScheduleTable.innerHTML = "";

  // cleanup availability entries for deleted people
  Object.keys(availability).forEach(name=>{
    if(!peopleList.find(p=>p.name===name)) delete availability[name];
  });
  saveData();

  if(peopleList.length === 0) return alert("Add people first!");

  // --- headers ---
  // kitchen header must have two leading headers: Day, Task
  const kHead = kitchenScheduleTable.createTHead();
  const kHeadRow = kHead.insertRow();
  kHeadRow.insertCell().textContent = "Day";
  kHeadRow.insertCell().textContent = "Task";
  peopleList.forEach(p => kHeadRow.insertCell().textContent = p.name);
  const kBody = kitchenScheduleTable.createTBody();

  // work header
  const wHead = workScheduleTable.createTHead();
  const wHeadRow = wHead.insertRow();
  wHeadRow.insertCell().textContent = "Day";
  peopleList.forEach(p => wHeadRow.insertCell().textContent = p.name);
  const wBody = workScheduleTable.createTBody();

  // map rows for quick access
  const kDayRows = {};
  const wDayRows = {};

  // tracking for fairness across kitchen + work
  const totalAssignments = {};
  const taskHistory = {};
  peopleList.forEach(p=>{
    totalAssignments[p.name] = 0;
    taskHistory[p.name] = new Set();
  });

  // build blank rows aligned with headers
  days.forEach(day=>{
    kitchenSubTasks.forEach((sub, idx)=>{
      const row = kBody.insertRow();
      if(idx === 0){
        const dayCell = row.insertCell();
        dayCell.textContent = day;
        dayCell.rowSpan = kitchenSubTasks.length;
      } else {
        // placeholder cell for Day column (empty)
        row.insertCell();
      }
      // Task cell (always index 1)
      const taskCell = row.insertCell();
      taskCell.textContent = sub;
      // person cells start at index 2
      peopleList.forEach(()=>row.insertCell());
      kDayRows[`${day}-${sub}`] = row;
    });

    // work row per day
    const wRow = wBody.insertRow();
    wRow.insertCell().textContent = day;
    peopleList.forEach(()=>wRow.insertCell());
    wDayRows[day] = wRow;
  });

  // helper: find kitchen tasks whose name equals a subtask
  function kitchenTasksForSubtask(sub){
    return kitchenTasks.filter(t=>t.name === sub);
  }

  // Combine: assign kitchen-subtasks first, then work tasks (both balanced together)
  days.forEach(day=>{
    // KITCHEN: for each subtask row (Breakfast, Lunch, ...)
    kitchenSubTasks.forEach(sub=>{
      const entries = kitchenTasksForSubtask(sub).filter(t=>t.days[day]);
      if(entries.length === 0) return; // no user-defined kitchen task for this sub

      entries.forEach(task=>{
        // available people for this kitchen task/subtask
        let available = peopleList.filter(p=>{
          if(!availability[p.name] || !availability[p.name][day]) return false;
          // prefer specific subtask availability if present, otherwise fall back to Work Duty
          const subOk = availability[p.name][day][task.name];
          const fallback = availability[p.name][day]["Work Duty"];
          return (subOk === undefined ? !!fallback : !!subOk);
        });

        if(available.length === 0) return;
        shuffle(available);

        for(let i=0;i<task.count;i++){
          available.sort((a,b)=> totalAssignments[a.name] - totalAssignments[b.name] );
          // prefer someone who hasn't done this exact task this week
          let chosen = available.find(p=>!taskHistory[p.name].has(task.name)) || available[0];
          totalAssignments[chosen.name]++;
          taskHistory[chosen.name].add(task.name);

          // write into correct cell: for kitchen rows person cells start at index 2
          const row = kDayRows[`${day}-${sub}`];
          const personIdx = peopleList.findIndex(pl=>pl.name===chosen.name);
          const cellIndex = 2 + personIdx;
          const cell = row.cells[cellIndex];
          if(cell){
            cell.textContent += (cell.textContent ? ", " : "") + task.name;
            cell.className = "kitchen-task";
          }
        }
      });
    });

    // WORK: assign regular workTasks
    workTasks.forEach(task=>{
      if(!task.days[day]) return;

      let available = peopleList.filter(p=>{
        if(!availability[p.name] || !availability[p.name][day]) return false;
        // originally work tasks use Lunch Dishes availability; keep that behavior
        const ok = !!availability[p.name][day]["Lunch Dishes"];
        if(!ok) return false;
        if(task.genderRequired && task.genderRequired !== "Any" && p.gender !== task.genderRequired) return false;
        return true;
      });

      if(available.length === 0) return;
      shuffle(available);

      for(let i=0;i<task.count;i++){
        available.sort((a,b)=> totalAssignments[a.name] - totalAssignments[b.name] );
        let chosen = available.find(p=>!taskHistory[p.name].has(task.name)) || available[0];
        totalAssignments[chosen.name]++;
        taskHistory[chosen.name].add(task.name);

        const wRow = wDayRows[day];
        const personIdx = peopleList.findIndex(pl=>pl.name===chosen.name);
        const cellIndex = 1 + personIdx; // work row: index 0 = day, index 1 = first person
        const cell = wRow.cells[cellIndex];
        if(cell){
          cell.textContent += (cell.textContent ? ", " : "") + task.name;
          cell.className = "work-task";
        }
      }
    });
  });
}

// ====== Reset All Data Button ======
const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset All Data";
resetBtn.style.backgroundColor = "orange";
resetBtn.style.marginTop = "10px";
resetBtn.onclick = ()=>{
  if(confirm("Are you sure you want to reset all data?")){
    localStorage.clear();
    location.reload();
  }
};
document.body.appendChild(resetBtn);

// ====== Initial renders ======
renderPeople();
renderAvailability();
renderTasks(kitchenTasks, kitchenTaskTable);
renderTasks(workTasks, workTaskTable);

// ====== Dark Mode toggle (existing button) ======
if(darkmodeBtn){
  darkmodeBtn.addEventListener("click", ()=>document.body.classList.toggle("dark"));
}

// ====== CSV Download (optional) ======
if(downloadBtn){
  downloadBtn.addEventListener("click", ()=>{
    function tableToCSV(table){
      const rows = [];
      for(let r=0; r<table.rows.length; r++){
        const cells = table.rows[r].cells;
        const cols = [];
        for(let c=0; c<cells.length; c++){
          cols.push('"' + (cells[c].textContent || "").replace(/"/g,'""') + '"');
        }
        rows.push(cols.join(","));
      }
      return rows.join("\n");
    }
    const kitchenCSV = tableToCSV(kitchenScheduleTable);
    const workCSV = tableToCSV(workScheduleTable);
    const blob = new Blob([kitchenCSV + "\n\n" + workCSV], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}
