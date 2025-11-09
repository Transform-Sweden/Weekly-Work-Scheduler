// script.js - Final version (checkmarks, linked availability, balanced allocations)

// ====== Data ======
let peopleList = JSON.parse(localStorage.getItem("peopleList")) || [];
let kitchenTasks = JSON.parse(localStorage.getItem("kitchenTasks")) || [];
let workTasks = JSON.parse(localStorage.getItem("workTasks")) || [];
let availability = JSON.parse(localStorage.getItem("availability")) || {};

// Subtasks and days
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
addPersonBtn.addEventListener("click", ()=>{
  const name = personInput.value.trim();
  const gender = personGender.value;
  if(!name) return alert("Name required");
  if(peopleList.find(p=>p.name===name)) return alert("Person already exists");
  peopleList.push({name, gender});
  // initialize availability for new person
  availability[name] = availability[name] || {};
  days.forEach(day=>{
    availability[name][day] = availability[name][day] || {};
    kitchenSubTasks.forEach(sub=>{ if(availability[name][day][sub]===undefined) availability[name][day][sub]=true; });
    if(availability[name][day]["Work Duty"]===undefined) availability[name][day]["Work Duty"]=true;
  });
  renderPeople();
  renderAvailability();
  saveData();
  personInput.value="";
});

function removePerson(name){
  const idx = peopleList.findIndex(p=>p.name===name);
  if(idx>-1){
    if(!confirm(`Remove ${name}?`)) return;
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
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.gender}) `;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.className = "remove-btn";
    btn.onclick = ()=> removePerson(p.name);
    li.appendChild(btn);
    peopleUl.appendChild(li);
  });
}

// ====== Availability ======
function ensureAvailabilityStructure(){
  // ensure all people/days/subtasks exist in availability
  peopleList.forEach(p=>{
    if(!availability[p.name]) availability[p.name]={};
    days.forEach(day=>{
      if(!availability[p.name][day]) availability[p.name][day]={};
      kitchenSubTasks.forEach(sub=>{
        if(availability[p.name][day][sub]===undefined) availability[p.name][day][sub]=true;
      });
      if(availability[p.name][day]["Work Duty"]===undefined) availability[p.name][day]["Work Duty"]=true;
    });
  });
}

function renderAvailability(){
  ensureAvailabilityStructure();
  availabilityTable.innerHTML="";
  peopleList.forEach(p=>{
    const tasks = kitchenSubTasks.concat(["Work Duty"]);
    tasks.forEach((task, idx)=>{
      const tr = document.createElement("tr");
      if(idx===0){
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
          // Link Lunch Dishes <-> Work Duty
          if(task === "Lunch Dishes"){
            availability[p.name][day]["Work Duty"] = cb.checked;
          } else if(task === "Work Duty"){
            availability[p.name][day]["Lunch Dishes"] = cb.checked;
          }
          saveData();
          // Re-render to keep boxes in sync visually
          renderAvailability();
        };
        td.appendChild(cb);
        tr.appendChild(td);
      });

      availabilityTable.appendChild(tr);
    });
  });
}

// ====== Tasks UI ======
function renderTasks(taskArray, tableBody, isKitchen){
  tableBody.innerHTML="";
  taskArray.forEach((task, idx)=>{
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td"); nameTd.textContent = task.name; tr.appendChild(nameTd);

    const countTd = document.createElement("td");
    const countInput = document.createElement("input");
    countInput.type="number"; countInput.value=task.count; countInput.min=1;
    countInput.onchange = ()=>{
      task.count = parseInt(countInput.value) || 1; saveData();
    };
    countTd.appendChild(countInput); tr.appendChild(countTd);

    const daysTd = document.createElement("td");
    days.forEach(day=>{
      const label = document.createElement("label"); label.className="task-label";
      const cb = document.createElement("input"); cb.type="checkbox";
      cb.checked = !!task.days[day];
      cb.onchange = ()=>{
        task.days[day] = cb.checked; saveData();
      };
      label.appendChild(cb); label.appendChild(document.createTextNode(day[0]));
      daysTd.appendChild(label);
    });
    tr.appendChild(daysTd);

    const removeTd = document.createElement("td");
    const btn = document.createElement("button"); btn.textContent="Remove"; btn.className="remove-btn";
    btn.onclick = ()=>{ if(confirm("Remove task?")){ taskArray.splice(idx,1); renderTasks(taskArray, tableBody, isKitchen); saveData(); } };
    removeTd.appendChild(btn); tr.appendChild(removeTd);

    tableBody.appendChild(tr);
  });
}

// ====== Add Task Events ======
addKitchenTaskBtn.addEventListener("click", ()=>{
  const name = kitchenTaskInput.value.trim();
  const count = parseInt(kitchenTaskCount.value) || 1;
  if(!name) return alert("Task name required");
  const taskObj = { name, count, days: {} };
  // kitchen tasks: all days checked by default
  days.forEach(d=>taskObj.days[d]=true);
  kitchenTasks.push(taskObj);
  renderTasks(kitchenTasks, kitchenTaskTable, true);
  kitchenTaskInput.value=""; kitchenTaskCount.value=1; saveData();
});

addWorkTaskBtn.addEventListener("click", ()=>{
  const name = workTaskInput.value.trim();
  const count = parseInt(workTaskCount.value) || 1;
  const genderReq = workTaskGender.value;
  if(!name) return alert("Task name required");
  const taskObj = { name, count, days: {} , genderRequired: genderReq};
  // work tasks: all days unchecked by default
  days.forEach(d=>taskObj.days[d]=false);
  workTasks.push(taskObj);
  renderTasks(workTasks, workTaskTable, false);
  workTaskInput.value=""; workTaskCount.value=1; workTaskGender.value="Any"; saveData();
});

// ====== Generate / Clear ======
generateBtn.addEventListener("click", ()=>generateSchedule());
clearBtn.addEventListener("click", ()=>{ kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML=""; });

// ====== Scheduler: balanced + no lunch/work conflict ======
function generateSchedule(){
  // clear tables
  kitchenScheduleTable.innerHTML="";
  workScheduleTable.innerHTML="";

  // ensure availability structure & remove deleted people keys
  ensureAvailabilityStructure();
  Object.keys(availability).forEach(name=>{
    if(!peopleList.find(p=>p.name===name)) delete availability[name];
  });
  saveData();

  if(peopleList.length===0) return alert("Add people first!");

  // Headers
  const kHead = kitchenScheduleTable.createTHead();
  const kHeadRow = kHead.insertRow();
  kHeadRow.insertCell().textContent = "Day";
  kHeadRow.insertCell().textContent = "Task";
  peopleList.forEach(p=>kHeadRow.insertCell().textContent = p.name);

  const kBody = kitchenScheduleTable.createTBody();
  const kDayRows = {}; // map 'Mon-Breakfast' => row

  const wHead = workScheduleTable.createTHead();
  const wHeadRow = wHead.insertRow();
  wHeadRow.insertCell().textContent = "Day";
  peopleList.forEach(p=>wHeadRow.insertCell().textContent = p.name);

  const wBody = workScheduleTable.createTBody();
  const wDayRows = {};

  // total assignment counts (combined kitchen + work)
  const totalAssignments = {};
  peopleList.forEach(p=> totalAssignments[p.name]=0);

  // Build kitchen rows (no placeholder for subsequent rows)
  days.forEach(day=>{
    kitchenSubTasks.forEach((sub, idx)=>{
      const row = kBody.insertRow();
      if(idx===0){
        const dayTd = row.insertCell();
        dayTd.textContent = day;
        dayTd.rowSpan = kitchenSubTasks.length;
      }
      const taskTd = row.insertCell();
      taskTd.textContent = sub;
      // create person cells
      peopleList.forEach(()=> row.insertCell());
      kDayRows[`${day}-${sub}`] = row;
    });

    const wRow = wBody.insertRow();
    wRow.insertCell().textContent = day;
    peopleList.forEach(()=> wRow.insertCell());
    wDayRows[day] = wRow;
  });

  // Helper: kitchen task entries that should go into subtask rows
  // If your kitchen task names are different, they won't appear in subtask rows.
  // We will map tasks whose name exactly matches a subtask.
  const kitchenEntriesBySub = {};
  kitchenSubTasks.forEach(sub => {
    kitchenEntriesBySub[sub] = kitchenTasks.filter(t=>t.name === sub);
  });

  // For fairness and variety we will iterate day-by-day.
  days.forEach(day=>{
    // Track assigned persons today to avoid double-assigning when possible
    const assignedToday = new Set();

    // Assign kitchen subtasks (for each subtask row, assign matching kitchen tasks)
    kitchenSubTasks.forEach(sub=>{
      const entries = kitchenEntriesBySub[sub].filter(t=>t.days[day]);
      if(entries.length === 0){
        // No user-defined task matching this sub => leave row empty
        return;
      }

      entries.forEach(task=>{
        // Build available list: person must be available for that sub on that day
        let available = peopleList.filter(p=>{
          // ensure availability exists
          if(!availability[p.name] || !availability[p.name][day]) return false;
          // use specific sub availability if present; otherwise fall back to Work Duty availability
          const subVal = availability[p.name][day][task.name];
          const fallback = availability[p.name][day]["Work Duty"];
          const ok = (subVal === undefined) ? !!fallback : !!subVal;
          // Also avoid persons already assigned today (if we can)
          return ok;
        });

        if(available.length === 0) return;

        // Shuffle then sort by least totalAssignments
        shuffle(available);
        available.sort((a,b)=> totalAssignments[a.name] - totalAssignments[b.name]);

        // For each spot required
        for(let i=0;i<task.count;i++){
          // Prefer someone not assigned today and not conflicting with Lunch/Work
          let candidateIdx = available.findIndex(p=>{
            // avoid someone already assigned today if possible
            if(assignedToday.has(p.name)) return false;
            // prevent LunchDishes vs Work Duty conflict:
            if(task.name === "Lunch Dishes"){
              // don't pick someone who is already assigned to a Work Duty today (we check assignedToday types below)
              // we will track types in a separate map if needed, but for simplicity, we'll check assignedToday and prefer not assigned
              return true;
            }
            return true;
          });

          // If none found (everyone already has assignment today), fallback to first available
          if(candidateIdx === -1) candidateIdx = 0;
          const chosen = available[candidateIdx];

          // But ensure we don't assign someone to both Lunch Dishes and Work Duty.
          // If chosen already has Lunch Dishes assigned today and we're assigning Work Duty (or vice versa), try to pick another.
          // We'll maintain a small map of assignmentsTodayTypes for conflict detection:
          // Build it on the fly:
          // (scan kDayRows and wDayRows for today's assigned checkmarks)
          const assignmentsTodayTypes = {};
          // scan kBody rows for this day to find existing assignments
          kitchenSubTasks.forEach(s=>{
            const row = kDayRows[`${day}-${s}`];
            if(row){
              peopleList.forEach((pl, idxPerson)=>{
                const cell = row.cells[2 + idxPerson];
                if(cell && cell.textContent && cell.textContent.trim()){
                  assignmentsTodayTypes[pl.name] = assignmentsTodayTypes[pl.name] || new Set();
                  assignmentsTodayTypes[pl.name].add(s);
                }
              });
            }
          });
          // scan work row
          const wRow = wDayRows[day];
          if(wRow){
            peopleList.forEach((pl, idxPerson)=>{
              const cell = wRow.cells[1 + idxPerson];
              if(cell && cell.textContent && cell.textContent.trim()){
                assignmentsTodayTypes[pl.name] = assignmentsTodayTypes[pl.name] || new Set();
                assignmentsTodayTypes[pl.name].add("Work Duty");
              }
            });
          }

          // If choosing this candidate causes a Lunch vs Work conflict, try to find alternative
          function causesConflict(personName, taskName){
            const types = assignmentsTodayTypes[personName];
            if(!types) return false;
            if(taskName === "Lunch Dishes" && types.has("Work Duty")) return true;
            if(taskName === "Work Duty" && types.has("Lunch Dishes")) return true;
            return false;
          }

          if(causesConflict(chosen.name, task.name)){
            const altIdx = available.findIndex(p=>!causesConflict(p.name, task.name) && !assignedToday.has(p.name));
            if(altIdx !== -1) {
              // pick alternative
              // (note: this doesn't update chosen variable reference; do that)
              // eslint-disable-next-line prefer-destructuring
              const alt = available[altIdx];
              // use alt instead
              // push chosen to alt
              // (we'll use alt in place of chosen below)
              // assign chosenPerson variable
              var chosenPerson = alt;
            } else {
              // fallback to chosen even if conflict (we must fill)
              var chosenPerson = chosen;
            }
          } else {
            var chosenPerson = chosen;
          }

          // finalize assignment
          totalAssignments[chosenPerson.name] = (totalAssignments[chosenPerson.name]||0) + 1;
          assignedToday.add(chosenPerson.name);

          // write a checkmark into the correct cell
          const row = kDayRows[`${day}-${task.name}`];
          if(row){
            const personIndex = peopleList.findIndex(pl=>pl.name===chosenPerson.name);
            const cellIndex = 2 + personIndex; // 0=Day,1=Task,2=firstPerson
            const cell = row.cells[cellIndex];
            if(cell){
              cell.textContent = (cell.textContent ? cell.textContent + ", " : "") + "✓";
              cell.className = "kitchen-task";
            }
          } // else: if user used custom kitchen names not matching subtasks, nothing to write
        } // end for count
      }); // end entries.forEach
    }); // end kitchenSubTasks.forEach

    // Work tasks for the day
    workTasks.forEach(task=>{
      if(!task.days[day]) return;
      // available: must have Work Duty availability and meet gender if specified
      let available = peopleList.filter(p=>{
        if(!availability[p.name] || !availability[p.name][day]) return false;
        if(!availability[p.name][day]["Work Duty"]) return false;
        if(task.genderRequired && task.genderRequired !== "Any" && p.gender !== task.genderRequired) return false;
        return true;
      });

      if(available.length === 0) return;
      shuffle(available);
      // sort by least totalAssignments
      available.sort((a,b)=> (totalAssignments[a.name]||0) - (totalAssignments[b.name]||0));

      for(let i=0;i<task.count;i++){
        // try to prefer someone not assigned today and no LunchDishes conflict
        let candidate = available.find(p=> {
          // not assigned yet today if possible
          const alreadyAssigned = false;
          // detect current assignments for this person today
          // (we already constructed assignmentsTodayTypes earlier but it's local; rebuild quickly)
          let hasLunch = false;
          // check kitchen rows
          kitchenSubTasks.forEach(s=>{
            const r = kDayRows[`${day}-${s}`];
            if(r){
              const idxP = peopleList.findIndex(pl=>pl.name===p.name);
              const c = r.cells[2 + idxP];
              if(c && c.textContent && c.textContent.includes("✓") && s === "Lunch Dishes") hasLunch = true;
            }
          });
          const hasWork = (()=>{
            const wRow = wDayRows[day];
            if(!wRow) return false;
            const idxP = peopleList.findIndex(pl=>pl.name===p.name);
            const c = wRow.cells[1 + idxP];
            return c && c.textContent && c.textContent.includes("✓");
          })();
          // avoid conflict
          if(hasLunch && task.name) {
            // if the work task is happening at lunch, skip; but conservative: if any lunch dish assigned, avoid
            if(hasLunch) return false;
          }
          // prefer not assigned today (we can't easily know all assigned types here, so prefer those with fewer totalAssignments)
          return true;
        }) || available[0];

        const chosenPerson = candidate;
        totalAssignments[chosenPerson.name] = (totalAssignments[chosenPerson.name]||0) + 1;
        // write checkmark into work table cell
        const wRow = wDayRows[day];
        if(wRow){
          const personIdx = peopleList.findIndex(pl=>pl.name===chosenPerson.name);
          const cellIndex = 1 + personIdx; // 0=Day, then persons
          const cell = wRow.cells[cellIndex];
          if(cell){
            cell.textContent = (cell.textContent ? cell.textContent + ", " : "") + "✓";
            cell.className = "work-task";
          }
        }
      }
    });

  }); // end days.forEach

} // end generateSchedule

// ====== Reset All Data button (bottom yellow box) ======
(function addResetBox(){
  const resetSection = document.createElement("section");
  resetSection.style.background = "#fff8e1";
  resetSection.style.border = "2px solid #ffeb3b";
  resetSection.style.borderRadius = "8px";
  resetSection.style.padding = "10px";
  resetSection.style.marginTop = "20px";

  resetSection.innerHTML = `
    <h3 style="color:#ff6f00; margin:0 0 6px 0;">⚠️ Reset All Data</h3>
    <p style="margin:0 0 8px 0;">This will permanently clear all saved people, tasks and availability.</p>
    <button id="reset-all-btn" style="background:#ff9800; padding:6px 10px; border-radius:6px; border:none; color:white; cursor:pointer;">Reset All Data</button>
  `;
  document.body.appendChild(resetSection);
  document.getElementById("reset-all-btn").onclick = ()=>{
    if(confirm("Are you sure you want to reset ALL saved data?")){
      localStorage.clear();
      // clear in-memory too
      peopleList=[]; kitchenTasks=[]; workTasks=[]; availability={};
      // re-render UI
      renderPeople(); renderTasks(kitchenTasks,kitchenTaskTable,true); renderTasks(workTasks,workTaskTable,false); renderAvailability();
      kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML="";
      alert("All data cleared. You may now add people and tasks afresh.");
    }
  };
})();

// ====== Optional: Download CSV (kept for convenience) ======
if(downloadBtn){
  downloadBtn.addEventListener("click", ()=>{
    function tableToCSV(table){
      let csv=[];
      for(let r=0; r<table.rows.length; r++){
        const cells = table.rows[r].cells;
        const row = [];
        for(let c=0; c<cells.length; c++){
          row.push('"' + (cells[c].textContent || "").replace(/"/g,'""') + '"');
        }
        csv.push(row.join(","));
      }
      return csv.join("\n");
    }
    const kitchenCSV = tableToCSV(kitchenScheduleTable);
    const workCSV = tableToCSV(workScheduleTable);
    const blob = new Blob([kitchenCSV + "\n\n" + workCSV], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "schedule.csv"; a.click();
    URL.revokeObjectURL(url);
  });
}

// ====== Dark mode toggle (if present) ======
if(darkmodeBtn){
  darkmodeBtn.addEventListener("click", ()=> document.body.classList.toggle("dark"));
}

// ====== Initial renders ======
renderPeople();
renderTasks(kitchenTasks, kitchenTaskTable, true);
renderTasks(workTasks, workTaskTable, false);
renderAvailability();
