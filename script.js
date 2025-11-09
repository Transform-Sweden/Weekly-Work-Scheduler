// ====== script.js (Grouped-day availability with floating modal + scheduler) ======

// ---- Data storage ----
let peopleList = JSON.parse(localStorage.getItem("peopleList")) || [];
let kitchenTasks = JSON.parse(localStorage.getItem("kitchenTasks")) || [];
let workTasks = JSON.parse(localStorage.getItem("workTasks")) || [];
let availability = JSON.parse(localStorage.getItem("availability")) || {};

// ---- Constants ----
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const kitchenSubTasks = ["Breakfast","Lunch","Lunch Dishes","Dinner","Dinner Dishes"];
const allSlots = [...kitchenSubTasks, "Work Duty"];

// ---- DOM elements ----
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

const availabilityTable = document.getElementById("availability-table");
const availabilityTbody = availabilityTable.querySelector("tbody");

const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const darkmodeBtn = document.getElementById("darkmode-btn");

const kitchenScheduleTable = document.getElementById("kitchen-schedule-table");
const workScheduleTable = document.getElementById("work-schedule-table");

// ---- Utility ----
function saveData(){
  localStorage.setItem("peopleList", JSON.stringify(peopleList));
  localStorage.setItem("kitchenTasks", JSON.stringify(kitchenTasks));
  localStorage.setItem("workTasks", JSON.stringify(workTasks));
  localStorage.setItem("availability", JSON.stringify(availability));
}

function shuffle(array){ return array.sort(()=>Math.random()-0.5); }

// ensure availability structure for every person/day/slot
function ensureAvailabilityStructure(){
  peopleList.forEach(p=>{
    if(!availability[p.name]) availability[p.name] = {};
    days.forEach(day=>{
      if(!availability[p.name][day]) availability[p.name][day] = {};
      allSlots.forEach(slot=>{
        if(availability[p.name][day][slot] === undefined) availability[p.name][day][slot] = (slot === "Work Duty" ? true : true);
        // default true for kitchen slots and Work Duty (we will rely on kitchen tasks default checked and work tasks default unchecked)
      });
    });
  });
}

// emoji map for display
const slotEmoji = {
  "Breakfast":"🍳",
  "Lunch":"☀️",
  "Lunch Dishes":"🍽️",
  "Dinner":"🌙",
  "Dinner Dishes":"🧼",
  "Work Duty":"💼"
};

// ---- People UI ----
addPersonBtn.addEventListener("click", ()=>{
  const name = personInput.value.trim();
  const gender = personGender.value;
  if(!name) return alert("Name required");
  if(peopleList.find(p=>p.name===name)) return alert("Person already exists");
  peopleList.push({name, gender});
  // init availability for new person
  availability[name] = availability[name] || {};
  days.forEach(d=>{
    availability[name][d] = availability[name][d] || {};
    allSlots.forEach(s => { if(availability[name][d][s] === undefined) availability[name][d][s] = (s === "Work Duty" ? true : true); });
  });
  saveData();
  renderPeople();
  renderAvailability(); // re-render grouped grid
  personInput.value = "";
});

function removePerson(name){
  if(!confirm(`Remove ${name}?`)) return;
  const idx = peopleList.findIndex(p=>p.name===name);
  if(idx>-1){
    peopleList.splice(idx,1);
    delete availability[name];
    saveData();
    renderPeople();
    renderAvailability();
  }
}

function renderPeople(){
  peopleUl.innerHTML = "";
  peopleList.forEach(p=>{
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.gender}) `;
    const btn = document.createElement("button");
    btn.textContent = "Remove"; btn.className = "remove-btn";
    btn.onclick = ()=> removePerson(p.name);
    li.appendChild(btn);
    peopleUl.appendChild(li);
  });
}

// ---- TASK UI (unchanged behavior) ----
function renderTasks(taskArray, tableBody){
  tableBody.innerHTML = "";
  taskArray.forEach((task, idx)=>{
    const tr = document.createElement("tr");
    const nameTd = document.createElement("td"); nameTd.textContent = task.name; tr.appendChild(nameTd);

    const countTd = document.createElement("td");
    const countInput = document.createElement("input");
    countInput.type="number"; countInput.value=task.count; countInput.min=1;
    countInput.onchange = ()=>{ task.count = parseInt(countInput.value) || 1; saveData();}
    countTd.appendChild(countInput); tr.appendChild(countTd);

    const daysTd = document.createElement("td");
    days.forEach(d=>{
      const label = document.createElement("label"); label.className = "task-label";
      const cb = document.createElement("input"); cb.type="checkbox";
      cb.checked = !!task.days[d];
      cb.onchange = ()=>{ task.days[d] = cb.checked; saveData();}
      label.appendChild(cb); label.appendChild(document.createTextNode(d[0]));
      daysTd.appendChild(label);
    });
    tr.appendChild(daysTd);

    const removeTd = document.createElement("td");
    const btn = document.createElement("button"); btn.textContent="Remove"; btn.className="remove-btn";
    btn.onclick = ()=>{ taskArray.splice(idx,1); renderTasks(taskArray, tableBody); saveData(); };
    removeTd.appendChild(btn); tr.appendChild(removeTd);

    tableBody.appendChild(tr);
  });
}

addKitchenTaskBtn.addEventListener("click", ()=>{
  const name = kitchenTaskInput.value.trim();
  const count = parseInt(kitchenTaskCount.value) || 1;
  if(!name) return alert("Task name required");
  const taskObj = { name, count, days: {} };
  // kitchen tasks: all days checked by default
  days.forEach(d=>taskObj.days[d]=true);
  kitchenTasks.push(taskObj);
  saveData();
  renderTasks(kitchenTasks, kitchenTaskTable);
  kitchenTaskInput.value=""; kitchenTaskCount.value=1;
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
  saveData();
  renderTasks(workTasks, workTaskTable);
  workTaskInput.value=""; workTaskCount.value=1; workTaskGender.value="Any";
});

// ---- GROUPED AVAILABILITY UI ----
// we'll replace the existing availability table body with a grouped-by-day view.
// also update the table head to "Person | Mon | Tue | ..."

function renderAvailability(){
  ensureAvailabilityStructure();
  // rebuild the header to: Person | Mon | Tue | ... (we modify the table's thead via script)
  let thead = availabilityTable.querySelector("thead");
  if(!thead){
    thead = document.createElement("thead");
    availabilityTable.appendChild(thead);
  }
  thead.innerHTML = "";
  const hdrRow = thead.insertRow();
  hdrRow.insertCell().textContent = "Person";
  days.forEach(d=> hdrRow.insertCell().textContent = d);

  // rebuild tbody
  availabilityTbody.innerHTML = "";
  peopleList.forEach(person=>{
    const tr = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = person.name;
    tr.appendChild(nameCell);

    days.forEach(day=>{
      const td = document.createElement("td");
      td.className = "avail-cell";
      td.style.cursor = "pointer";
      td.style.minWidth = "80px";
      td.style.padding = "6px";
      td.style.textAlign = "center";

      // build inline icons for available slots
      const slots = allSlots.filter(s => !!availability[person.name][day][s]);
      td.innerHTML = slots.map(s => `<span title="${s}" style="margin:0 2px; font-size:16px;">${slotEmoji[s]||s[0]}</span>`).join("");

      // click -> open modal to edit
      td.onclick = (e)=>{
        openAvailabilityModal(person.name, day, td);
      };

      tr.appendChild(td);
    });

    availabilityTbody.appendChild(tr);
  });
}

// ---- Floating modal for editing person/day availability ----
let modalEl = null;

function openAvailabilityModal(personName, day, anchorCell){
  // close existing
  closeAvailabilityModal();

  // build modal
  modalEl = document.createElement("div");
  modalEl.style.position = "fixed";
  modalEl.style.zIndex = 9999;
  modalEl.style.background = (document.body.classList.contains("dark") ? "#1e1e1e" : "#ffffff");
  modalEl.style.color = (document.body.classList.contains("dark") ? "#e0e0e0" : "#222");
  modalEl.style.border = "1px solid rgba(0,0,0,0.12)";
  modalEl.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
  modalEl.style.padding = "10px";
  modalEl.style.borderRadius = "8px";
  modalEl.style.minWidth = "220px";

  // title
  const title = document.createElement("div");
  title.style.fontWeight = "600";
  title.style.marginBottom = "6px";
  title.textContent = `${personName} — ${day}`;
  modalEl.appendChild(title);

  // checkboxes
  const form = document.createElement("div");
  form.style.display = "grid";
  form.style.gridTemplateColumns = "1fr 1fr";
  form.style.gap = "6px";

  allSlots.forEach(slot=>{
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "6px";
    label.style.cursor = "pointer";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!availability[personName][day][slot];
    cb.dataset.slot = slot;

    const emojiSpan = document.createElement("span"); emojiSpan.textContent = slotEmoji[slot] || slot[0];
    const text = document.createElement("span"); text.textContent = slot; text.style.fontSize = "13px";

    label.appendChild(cb);
    label.appendChild(emojiSpan);
    label.appendChild(text);

    // link behavior: Lunch Dishes <-> Work Duty
    cb.onchange = ()=>{
      const checked = cb.checked;
      // set availability
      availability[personName][day][slot] = checked;

      if(slot === "Lunch Dishes"){
        availability[personName][day]["Work Duty"] = checked;
      } else if(slot === "Work Duty"){
        availability[personName][day]["Lunch Dishes"] = checked;
      }

      // reflect changes on other checkboxes in modal
      const allCbs = modalEl.querySelectorAll("input[type=checkbox]");
      allCbs.forEach(other=>{
        const s = other.dataset.slot;
        other.checked = !!availability[personName][day][s];
      });

      saveData();
    };

    form.appendChild(label);
  });

  modalEl.appendChild(form);

  // buttons row
  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.justifyContent = "flex-end";
  btnRow.style.gap = "8px";
  btnRow.style.marginTop = "8px";

  const doneBtn = document.createElement("button");
  doneBtn.textContent = "Done";
  doneBtn.style.padding = "6px 10px";
  doneBtn.style.borderRadius = "6px";
  doneBtn.style.cursor = "pointer";
  doneBtn.onclick = ()=>{
    saveData();
    renderAvailability(); // update icons in grid
    closeAvailabilityModal();
  };
  btnRow.appendChild(doneBtn);

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.padding = "6px 10px";
  cancelBtn.style.borderRadius = "6px";
  cancelBtn.style.background = "#ddd";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.onclick = ()=>{ closeAvailabilityModal(); };

  btnRow.appendChild(cancelBtn);
  modalEl.appendChild(btnRow);

  document.body.appendChild(modalEl);

  // position modal near anchorCell
  const rect = anchorCell.getBoundingClientRect();
  // try to place below-right of cell, adjust if off-screen
  let top = rect.bottom + window.scrollY + 6;
  let left = rect.left + window.scrollX;
  // ensure not off right edge
  if(left + modalEl.offsetWidth > window.innerWidth - 12) left = window.innerWidth - modalEl.offsetWidth - 12;
  modalEl.style.top = top + "px";
  modalEl.style.left = left + "px";

  // click outside to close
  setTimeout(()=>{ // delay to avoid immediate click capturing
    window.addEventListener("click", onWindowClick);
  }, 10);

  function onWindowClick(ev){
    if(!modalEl) return;
    if(modalEl.contains(ev.target)) return;
    closeAvailabilityModal();
  }

  function closeAvailabilityModal(){
    if(!modalEl) return;
    window.removeEventListener("click", onWindowClick);
    modalEl.remove();
    modalEl = null;
  }
}

// helper to close modal externally
function closeAvailabilityModal(){
  if(modalEl){
    modalEl.remove();
    modalEl = null;
    try{ window.removeEventListener("click", ()=>{}); }catch(e){}
  }
}

// ---- Generator (keeps earlier balanced logic) ----
// This section uses availability[person][day][slot] structure unchanged.
// Kitchen: checkmarks (✓). Work: task names.

generateBtn.addEventListener("click", ()=>generateSchedule());
clearBtn.addEventListener("click", ()=>{ kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML=""; });

function generateSchedule(){
  kitchenScheduleTable.innerHTML = "";
  workScheduleTable.innerHTML = "";

  ensureAvailabilityStructure();
  // remove availability keys for removed people
  Object.keys(availability).forEach(name=>{ if(!peopleList.find(p=>p.name===name)) delete availability[name]; });
  saveData();

  if(peopleList.length === 0) { alert("Add people first."); return; }

  // build kitchen header: Day | Task | Person1 | Person2 ...
  const kHead = kitchenScheduleTable.createTHead();
  const kHeadRow = kHead.insertRow();
  kHeadRow.insertCell().textContent = "Day";
  kHeadRow.insertCell().textContent = "Task";
  peopleList.forEach(p=>kHeadRow.insertCell().textContent = p.name);
  const kBody = kitchenScheduleTable.createTBody();
  const kDayRows = {};

  // create rows for each day/subtask
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
      peopleList.forEach(()=> row.insertCell());
      kDayRows[`${day}-${sub}`] = row;
    });
  });

  // build work header and rows
  const wHead = workScheduleTable.createTHead();
  const wHeadRow = wHead.insertRow();
  wHeadRow.insertCell().textContent = "Day";
  peopleList.forEach(p=>wHeadRow.insertCell().textContent = p.name);
  const wBody = workScheduleTable.createTBody();
  const wDayRows = {};
  days.forEach(day=>{
    const row = wBody.insertRow();
    row.insertCell().textContent = day;
    peopleList.forEach(()=> row.insertCell());
    wDayRows[day] = row;
  });

  // combined fairness tracker
  const totalAssignments = Object.fromEntries(peopleList.map(p=>[p.name,0]));

  // We'll assign kitchen subtasks per day; prefer people with fewer totalAssignments and not assigned today
  days.forEach(day=>{
    const assignedToday = new Set(); // to avoid giving multiple kitchen subtasks to same person if possible

    // KITCHEN: for each subtask row: find kitchenTasks whose name equals the subtask AND that are enabled for the day
    kitchenSubTasks.forEach(sub=>{
      const matchingTasks = kitchenTasks.filter(t=>t.name === sub && t.days[day]);
      if(matchingTasks.length === 0) return;
      matchingTasks.forEach(task=>{
        for(let slotIndex=0; slotIndex<task.count; slotIndex++){
          // build eligible list
          let eligible = peopleList.filter(p=>{
            if(!availability[p.name] || !availability[p.name][day]) return false;
            // check sub availability
            const subOk = availability[p.name][day][sub];
            return !!subOk;
          });

          if(eligible.length === 0) eligible = peopleList.slice(); // fallback

          shuffle(eligible);
          eligible.sort((a,b)=> totalAssignments[a.name] - totalAssignments[b.name]);

          let chosen = eligible.find(p=>!assignedToday.has(p.name)) || eligible[0];
          totalAssignments[chosen.name]++;

          // avoid LunchDishes <> WorkDuty conflict later: we mark assignments; we check when assigning work tasks
          assignedToday.add(chosen.name);

          // write checkmark
          const row = kDayRows[`${day}-${sub}`];
          if(row){
            const personIdx = peopleList.findIndex(pl=>pl.name===chosen.name);
            const cell = row.cells[2 + personIdx];
            if(cell){
              cell.textContent = (cell.textContent ? cell.textContent + ", " : "") + "✓";
              cell.className = "kitchen-task";
            }
          }
        }
      });
    });

    // WORK: assign workTasks for the day, writing their names in work table
    workTasks.forEach(task=>{
      if(!task.days[day]) return;
      // available: must have Work Duty availability and must not have Lunch Dishes already assigned (to avoid conflict)
      let available = peopleList.filter(p=>{
        if(!availability[p.name] || !availability[p.name][day]) return false;
        if(!availability[p.name][day]["Work Duty"]) return false;
        // check if Lunch Dishes was assigned in this day's kitchen rows to this person
        const lunchRow = kDayRows[`${day}-Lunch Dishes`];
        if(lunchRow){
          const pi = peopleList.findIndex(pl=>pl.name===p.name);
          const c = lunchRow.cells[2 + pi];
          if(c && c.textContent && c.textContent.includes("✓")) return false; // conflict -> not available
        }
        if(task.genderRequired && task.genderRequired !== "Any" && p.gender !== task.genderRequired) return false;
        return true;
      });

      if(available.length === 0){
        // fallback to anyone with Work Duty availability (even if conflict)
        available = peopleList.filter(p=> availability[p.name] && availability[p.name][day] && availability[p.name][day]["Work Duty"]);
      }
      if(available.length === 0) return;

      shuffle(available);
      available.sort((a,b)=> totalAssignments[a.name] - totalAssignments[b.name]);

      for(let i=0;i<task.count;i++){
        const chosen = available[i] || available[0];
        totalAssignments[chosen.name]++;

        // write task name in work row cell
        const wRow = wDayRows[day];
        if(wRow){
          const personIdx = peopleList.findIndex(pl=>pl.name===chosen.name);
          const cell = wRow.cells[1 + personIdx];
          if(cell){
            cell.textContent = (cell.textContent ? cell.textContent + ", " : "") + task.name;
            cell.className = "work-task";
          }
        }
      }
    });

  }); // end days

  // done
}

// ---- Reset All Data (bottom yellow box) ----
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
  document.getElementById("reset-all-btn").addEventListener("click", ()=>{
    if(confirm("Are you sure you want to reset ALL saved data?")){
      localStorage.clear();
      peopleList=[]; kitchenTasks=[]; workTasks=[]; availability={};
      renderPeople(); renderTasks(kitchenTasks,kitchenTaskTable); renderTasks(workTasks,workTaskTable); renderAvailability();
      kitchenScheduleTable.innerHTML=""; workScheduleTable.innerHTML="";
      alert("All data cleared.");
    }
  });
})();

// ---- CSV download (kept) ----
if(downloadBtn){
  downloadBtn.addEventListener("click", ()=>{
    function tableToCSV(table){
      let csv=[];
      for(let r=0;r<table.rows.length;r++){
        const cells = table.rows[r].cells;
        const row = [];
        for(let c=0;c<cells.length;c++){
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
    const a = document.createElement("a"); a.href = url; a.download = "schedule.csv"; a.click(); URL.revokeObjectURL(url);
  });
}

// ---- Dark mode toggle (if present) ----
if(darkmodeBtn){
  darkmodeBtn.addEventListener("click", ()=> document.body.classList.toggle("dark"));
}

// ---- Initial render ----
ensureAvailabilityStructure();
renderPeople();
renderTasks(kitchenTasks,kitchenTaskTable);
renderTasks(workTasks,workTaskTable);
renderAvailability();
