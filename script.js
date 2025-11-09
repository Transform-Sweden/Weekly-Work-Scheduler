// ====== script.js - Updated generateSchedule + helpers ======

// ====== Data ======
let peopleList = JSON.parse(localStorage.getItem("peopleList")) || [];
let kitchenTasks = JSON.parse(localStorage.getItem("kitchenTasks")) || [];
let workTasks = JSON.parse(localStorage.getItem("workTasks")) || [];
let availability = JSON.parse(localStorage.getItem("availability")) || {};

// Days & kitchen subtasks (fixed)
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
function shuffle(arr){ return arr.sort(()=>Math.random()-0.5); }

// Ensure availability object has all fields for current people/days/subtasks
function ensureAvailabilityStructure(){
  peopleList.forEach(p=>{
    if(!availability[p.name]) availability[p.name] = {};
    days.forEach(d=>{
      if(!availability[p.name][d]) availability[p.name][d] = {};
      kitchenSubTasks.forEach(sub => {
        if(availability[p.name][d][sub] === undefined) availability[p.name][d][sub] = true;
      });
      if(availability[p.name][d]["Work Duty"] === undefined) availability[p.name][d]["Work Duty"] = true;
    });
  });
}

// ====== People UI (unchanged) ======
addPersonBtn.addEventListener("click",()=>{
  const name = personInput.value.trim(); const gender = personGender.value;
  if(!name) return alert("Name required");
  if(!peopleList.find(p=>p.name===name)){
    peopleList.push({name, gender});
    // initialize availability for new person
    availability[name] = availability[name] || {};
    days.forEach(d=>{
      availability[name][d] = availability[name][d] || {};
      kitchenSubTasks.forEach(sub => { if(availability[name][d][sub] === undefined) availability[name][d][sub] = true; });
      if(availability[name][d]["Work Duty"] === undefined) availability[name][d]["Work Duty"] = true;
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
    btn.textContent="Remove"; btn.className="remove-btn";
    btn.onclick=()=>removePerson(p.name);
    li.appendChild(btn); peopleUl.appendChild(li);
  });
}

// ====== Availability UI (unchanged structure but ensures subs present) ======
function renderAvailability(){
  ensureAvailabilityStructure();
  availabilityTable.innerHTML="";
  peopleList.forEach(p=>{
    const tasks = kitchenSubTasks.concat(["Work Duty"]);
    tasks.forEach((task, idx)=>{
      const tr=document.createElement("tr");
      if(idx===0){
        const nameTd=document.createElement("td");
        nameTd.textContent=p.name; nameTd.rowSpan=tasks.length; tr.appendChild(nameTd);
      }
      const taskTd=document.createElement("td");
      taskTd.textContent=task; tr.appendChild(taskTd);

      days.forEach(day=>{
        const td=document.createElement("td");
        const cb=document.createElement("input");
        cb.type="checkbox";
        cb.checked=!!availability[p.name][day][task];
        cb.onchange=()=>{
          availability[p.name][day][task] = cb.checked;
          // link Lunch Dishes <-> Work Duty
          if(task === "Lunch Dishes") availability[p.name][day]["Work Duty"] = cb.checked;
          if(task === "Work Duty") availability[p.name][day]["Lunch Dishes"] = cb.checked;
          saveData();
          renderAvailability(); // re-render to sync linked boxes
        };
        td.appendChild(cb); tr.appendChild(td);
      });
      availabilityTable.appendChild(tr);
    });
  });
}

// ====== Tasks UI (unchanged) ======
function renderTasks(taskArray, tableBody){
  tableBody.innerHTML="";
  taskArray.forEach((task, idx)=>{
    const tr=document.createElement("tr");
    const nameTd=document.createElement("td"); nameTd.textContent=task.name; tr.appendChild(nameTd);

    const countTd=document.createElement("td");
    const countInput=document.createElement("input");
    countInput.type="number"; countInput.value=task.count; countInput.min=1;
    countInput.onchange=()=>{ task.count = parseInt(countInput.value)||1; saveData(); };
    countTd.appendChild(countInput); tr.appendChild(countTd);

    const daysTd=document.createElement("td");
    Object.keys(task.days).forEach(day=>{
      const label=document.createElement("label"); label.className="task-label";
      const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=!!task.days[day];
      cb.onchange=()=>{ task.days[day]=cb.checked; saveData(); };
      label.appendChild(cb); label.appendChild(document.createTextNode(day[0]));
      daysTd.appendChild(label);
    });
    tr.appendChild(daysTd);

    const removeTd=document.createElement("td");
    const btn=document.createElement("button"); btn.textContent="Remove"; btn.className="remove-btn";
    btn.onclick=()=>{ taskArray.splice(idx,1); renderTasks(taskArray,tableBody); saveData(); };
    removeTd.appendChild(btn); tr.appendChild(removeTd);

    tableBody.appendChild(tr);
  });
}

// Add Task handlers (unchanged defaults)
addKitchenTaskBtn.addEventListener("click",()=>{
  const name=kitchenTaskInput.value.trim(); const count=parseInt(kitchenTaskCount.value)||1;
  if(!name) return alert("Task name required");
  const taskObj={name,count,days:{}};
  days.forEach(d=>taskObj.days[d]=true); // kitchen tasks start checked
  kitchenTasks.push(taskObj); renderTasks(kitchenTasks,kitchenTaskTable);
  kitchenTaskInput.value=""; kitchenTaskCount.value=1; saveData();
});
addWorkTaskBtn.addEventListener("click",()=>{
  const name=workTaskInput.value.trim(); const count=parseInt(workTaskCount.value)||1;
  const genderReq = workTaskGender.value;
  if(!name) return alert("Task name required");
  const taskObj={name,count,days:{}, genderRequired: genderReq};
  days.forEach(d=>taskObj.days[d]=false); // work tasks start unchecked
  workTasks.push(taskObj); renderTasks(workTasks,workTaskTable);
  workTaskInput.value=""; workTaskCount.value=1; workTaskGender.value="Any"; saveData();
});

// ====== Generate & Clear binding ======
generateBtn.addEventListener("click",()=>generateSchedule());
clearBtn.addEventListener("click",()=>{ kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML=""; });

// ====== GENERATE SCHEDULE (FIXED) ======
function generateSchedule(){
  // clear tables
  kitchenScheduleTable.innerHTML = "";
  workScheduleTable.innerHTML = "";

  // ensure availability keys exist and cleanup removed people
  ensureAvailabilityStructure();
  Object.keys(availability).forEach(name=>{ if(!peopleList.find(p=>p.name===name)) delete availability[name]; });
  saveData();

  if(peopleList.length === 0) { alert("Add people first."); return; }

  // Build kitchen header: two leading header cells Day / Task, then people
  const kHead = kitchenScheduleTable.createTHead();
  const kHeadRow = kHead.insertRow();
  kHeadRow.insertCell().textContent = "Day";
  kHeadRow.insertCell().textContent = "Task";
  peopleList.forEach(p => kHeadRow.insertCell().textContent = p.name);
  const kBody = kitchenScheduleTable.createTBody();

  // Build kitchen rows map
  const kDayRows = {};
  days.forEach(day=>{
    kitchenSubTasks.forEach((sub, idx)=>{
      const row = kBody.insertRow();
      if(idx === 0){
        const dayCell = row.insertCell();
        dayCell.textContent = day;
        dayCell.rowSpan = kitchenSubTasks.length;
      }
      const taskCell = row.insertCell();
      taskCell.textContent = sub;
      // create person cells
      peopleList.forEach(()=> row.insertCell());
      kDayRows[`${day}-${sub}`] = row;
    });
  });

  // Build work header and rows
  const wHead = workScheduleTable.createTHead();
  const wHeadRow = wHead.insertRow();
  wHeadRow.insertCell().textContent = "Day";
  peopleList.forEach(p=> wHeadRow.insertCell().textContent = p.name);
  const wBody = workScheduleTable.createTBody();
  const wDayRows = {};
  days.forEach(day=>{
    const row = wBody.insertRow();
    row.insertCell().textContent = day;
    peopleList.forEach(()=> row.insertCell());
    wDayRows[day] = row;
  });

  // Combined fairness counter: kitchen + work
  const totalAssignments = {};
  peopleList.forEach(p=> totalAssignments[p.name] = 0);

  // For each day, assign kitchen subtasks first (checkmarks), then work tasks (names)
  days.forEach(day=>{
    const assignedToday = new Set(); // used to prefer not giving multiple kitchen tasks a day

    // 1) KITCHEN: for each subtask, find kitchenTasks with matching name enabled for this day
    kitchenSubTasks.forEach(sub=>{
      // find any kitchenTasks that have name exactly equal to this sub and are enabled today
      const entries = kitchenTasks.filter(t => t.name === sub && t.days[day]);
      if(entries.length === 0) {
        // nothing to assign to this subtask (user didn't create a matching kitchen task)
        continue;
      }

      entries.forEach(task=>{
        // we need to assign task.count people to this subtask
        for(let i=0;i<task.count;i++){
          // build eligible list: availability for this sub
          let eligible = peopleList.filter(p=>{
            if(!availability[p.name] || !availability[p.name][day]) return false;
            const ok = availability[p.name][day][sub];
            return !!ok;
          });

          if(eligible.length === 0){
            // no one available -> skip (or could fallback to anyone)
            eligible = peopleList.slice(); // fallback to anyone
          }

          // prefer those with lowest totalAssignments and not assignedToday
          shuffle(eligible);
          eligible.sort((a,b)=>{
            const ta = (totalAssignments[a.name]||0);
            const tb = (totalAssignments[b.name]||0);
            return ta - tb;
          });

          let chosen = eligible.find(p => !assignedToday.has(p.name)) || eligible[0];
          // assign
          totalAssignments[chosen.name] = (totalAssignments[chosen.name] || 0) + 1;
          // mark assignedToday to avoid giving same person another kitchen subtask if possible
          assignedToday.add(chosen.name);

          // write checkmark into kitchen cell
          const row = kDayRows[`${day}-${sub}`];
          if(row){
            const personIdx = peopleList.findIndex(pl=>pl.name===chosen.name);
            const cellIdx = 2 + personIdx; // 0=day,1=task,2=firstPerson
            const cell = row.cells[cellIdx];
            if(cell){
              cell.textContent = (cell.textContent ? cell.textContent + ", " : "") + "✓";
              cell.className = "kitchen-task";
            }
          }
        }
      });
    });

    // 2) WORK: for each workTask enabled on this day, assign people (write task name in cell)
    workTasks.forEach(task=>{
      if(!task.days[day]) return;

      // available: must have Work Duty availability and not be assigned to Lunch Dishes this day
      let available = peopleList.filter(p=>{
        if(!availability[p.name] || !availability[p.name][day]) return false;
        if(!availability[p.name][day]["Work Duty"]) return false;
        // check if assigned to Lunch Dishes (we assigned kitchen first)
        const lunchRow = kDayRows[`${day}-Lunch Dishes`];
        if(lunchRow){
          const idx = peopleList.findIndex(pl=>pl.name===p.name);
          const c = lunchRow.cells[2 + idx];
          if(c && c.textContent && c.textContent.includes("✓")) return false; // skip, conflict
        }
        // gender constraint
        if(task.genderRequired && task.genderRequired !== "Any" && p.gender !== task.genderRequired) return false;
        return true;
      });

      if(available.length === 0){
        // fallback: allow people who are assigned to Lunch Dishes only if necessary
        available = peopleList.filter(p=>{
          if(!availability[p.name] || !availability[p.name][day]) return false;
          if(!availability[p.name][day]["Work Duty"]) return false;
          if(task.genderRequired && task.genderRequired !== "Any" && p.gender !== task.genderRequired) return false;
          return true;
        });
      }

      if(available.length === 0) return; // nothing we can do

      shuffle(available);
      available.sort((a,b)=> (totalAssignments[a.name]||0) - (totalAssignments[b.name]||0) );

      for(let i=0;i<task.count;i++){
        const chosen = available[i] || available[0]; // pick ith least loaded, fallback to first
        totalAssignments[chosen.name] = (totalAssignments[chosen.name] || 0) + 1;
        // write task name into work table cell
        const wRow = wDayRows[day];
        if(wRow){
          const personIdx = peopleList.findIndex(pl=>pl.name===chosen.name);
          const cellIdx = 1 + personIdx; // 0=day, 1=firstPerson
          const cell = wRow.cells[cellIdx];
          if(cell){
            cell.textContent = (cell.textContent ? cell.textContent + ", " : "") + task.name;
            cell.className = "work-task";
          }
        }
      }
    });

  }); // end days loop

  // done
}

// ====== Reset All Data Button (bottom) ======
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
    peopleList=[]; kitchenTasks=[]; workTasks=[]; availability={};
    renderPeople(); renderTasks(kitchenTasks,kitchenTaskTable); renderTasks(workTasks,workTaskTable); renderAvailability();
    kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML="";
  }
});

// ====== Other UI helpers (render tasks, render availability, etc.) ======
// We assume these functions already exist exactly as in your main script (renderTasks, renderAvailability, renderPeople).
// If not present in your file, include the earlier implementations you had for renderTasks/renderAvailability/renderPeople.
// For convenience if they are missing, here's a minimal fallback:

function renderTasks(tasks, tbody){
  if(!tbody) return;
  tbody.innerHTML="";
  tasks.forEach((task, idx)=>{
    const tr=document.createElement("tr");
    const nameTd=document.createElement("td"); nameTd.textContent=task.name; tr.appendChild(nameTd);
    const countTd=document.createElement("td"); const countInput=document.createElement("input"); countInput.type="number"; countInput.value=task.count; countInput.min=1;
    countInput.onchange=()=>{ task.count=parseInt(countInput.value)||1; saveData(); };
    countTd.appendChild(countInput); tr.appendChild(countTd);
    const daysTd=document.createElement("td");
    days.forEach(d=>{ const lbl=document.createElement("label"); lbl.className="task-label"; const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=!!task.days[d]; cb.onchange=()=>{ task.days[d]=cb.checked; saveData(); }; lbl.appendChild(cb); lbl.appendChild(document.createTextNode(d[0])); daysTd.appendChild(lbl); });
    tr.appendChild(daysTd);
    const remTd=document.createElement("td"); const btn=document.createElement("button"); btn.textContent="Remove"; btn.className="remove-btn"; btn.onclick=()=>{ tasks.splice(idx,1); saveData(); renderTasks(tasks,tbody); }; remTd.appendChild(btn); tr.appendChild(remTd);
    tbody.appendChild(tr);
  });
}

// If your page already defines renderTasks/renderAvailability/renderPeople exactly, the above won't override them.
// Call initial render to sync UI
try { renderPeople(); } catch(e){ /* ignore if already present */ }
try { renderAvailability(); } catch(e){ /* ignore if already present */ }
try { renderTasks(kitchenTasks,kitchenTaskTable); renderTasks(workTasks,workTaskTable); } catch(e){ /* ignore */ }
