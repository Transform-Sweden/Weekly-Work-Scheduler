const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const timesOfDay = ["Morning","Afternoon","Evening"];

let people = JSON.parse(localStorage.getItem("people")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const peopleListDiv = document.getElementById("peopleList");
const taskListGrid = document.getElementById("taskListGrid");
const kitchenContainer = document.getElementById("kitchenSchedulesContainer");
const houseworkContainer = document.getElementById("houseworkSchedulesContainer");

function saveAll() {
  localStorage.setItem("people", JSON.stringify(people));
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// -------- People --------
function addPerson() {
  const name = document.getElementById("personName").value.trim();
  if (!name) return alert("Enter a name");
  people.push({name, unavailable:{}});
  saveAll();
  renderPeople();
}

function removePerson(i) {
  people.splice(i,1);
  saveAll();
  renderPeople();
}

function renderPeople() {
  peopleListDiv.innerHTML = "";
  people.forEach((p,i)=>{
    const container = document.createElement("div");
    container.style.marginBottom = "20px";
    const header = document.createElement("div");
    header.innerHTML = `<strong>${p.name}</strong> <button onclick="removePerson(${i})">Remove</button>`;
    container.appendChild(header);

    const table = document.createElement("table");
    table.className = "availability-grid";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `<th>Time</th>` + daysOfWeek.map(d=>`<th>${d}</th>`).join("");
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    timesOfDay.forEach(time=>{
      const row = document.createElement("tr");
      row.innerHTML = `<td>${time}</td>`;
      daysOfWeek.forEach(day=>{
        if(!p.unavailable[day]) p.unavailable[day]={};
        const cell = document.createElement("td");
        const cb = document.createElement("input");
        cb.type="checkbox";
        cb.checked = p.unavailable[day][time] || false;
        cb.addEventListener("change", ()=>{p.unavailable[day][time]=cb.checked; saveAll();});
        cell.appendChild(cb);
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    peopleListDiv.appendChild(container);
  });
}

// -------- Tasks --------
function addTask() {
  const name = document.getElementById("taskName").value.trim();
  const type = document.getElementById("taskType").value;
  const peopleNeeded = parseInt(document.getElementById("taskPeople").value);
  let timeCheckboxes = document.querySelectorAll("#taskTimes input[type=checkbox]");
  let times = Array.from(timeCheckboxes).filter(cb=>cb.checked).map(cb=>cb.value);
  if(type==="housework") times = ["Afternoon"];
  if(!name || times.length===0) return alert("Enter task name and times");
  
  // Assign initially to all days
  tasks.push({name,type,peopleNeeded,times,days:[...daysOfWeek]});
  saveAll();
  renderTasks();
}

function removeTask(i){
  tasks.splice(i,1);
  saveAll();
  renderTasks();
}

// -------- Drag & Drop --------
function renderTasks(){
  taskListGrid.innerHTML="";
  daysOfWeek.forEach(day=>{
    const dayCol = document.createElement("div");
    dayCol.className="day-column";
    dayCol.dataset.day=day;
    const h4 = document.createElement("h4");
    h4.innerText=day;
    dayCol.appendChild(h4);

    tasks.filter(t=>t.days.includes(day)).forEach((t,i)=>{
      const div = document.createElement("div");
      div.className="task-item";
      div.draggable=true;
      div.innerText=`${t.name} (${t.type}, ${t.peopleNeeded})`;
      div.dataset.index = tasks.indexOf(t);

      div.addEventListener("dragstart", e=>{
        e.dataTransfer.setData("text/plain", tasks.indexOf(t));
        setTimeout(()=>div.classList.add("dragging"),0);
      });
      div.addEventListener("dragend", e=>{
        div.classList.remove("dragging");
      });

      dayCol.appendChild(div);
    });

    dayCol.addEventListener("dragover", e=>e.preventDefault());
    dayCol.addEventListener("drop", e=>{
      const index = parseInt(e.dataTransfer.getData("text/plain"));
      const task = tasks[index];
      if(!task.days.includes(day)) task.days.push(day);
      // Optionally remove from other days if you want one day per task:
      // task.days = [day];
      saveAll();
      renderTasks();
    });

    taskListGrid.appendChild(dayCol);
  });
}

// -------- Generate Schedule --------
function generateSchedules() {
  const kitchenGrid = createScheduleGrid(tasks.filter(t=>t.type==="kitchen"));
  const houseworkGrid = createScheduleGrid(tasks.filter(t=>t.type==="housework"));

  appendSchedule(kitchenContainer, kitchenGrid, 'Kitchen');
  appendSchedule(houseworkContainer, houseworkGrid, 'Housework');
}

function appendSchedule(container, htmlGrid, title){
  const wrapper = document.createElement("div");
  wrapper.className = "schedule-wrapper";
  wrapper.innerHTML = `<button class="delete-schedule" onclick="wrapper.remove()">Delete</button>${htmlGrid}`;
  container.appendChild(wrapper);
}

function createScheduleGrid(taskArray){
  let taskCount = {};
  people.forEach(p=> taskCount[p.name] = 0);

  const grid = document.createElement("table");
  grid.className="schedule-grid";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Task / Day</th>" + daysOfWeek.map(d=>`<th>${d}</th>`).join("");
  thead.appendChild(headerRow);
  grid.appendChild(thead);

  taskArray.forEach(task=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${task.name}</td>`;

    daysOfWeek.forEach(day=>{
      const td=document.createElement("td");
      if(task.days.includes(day)){
        let assignedPeople = [];
        task.times.forEach(t=>{
          const available = people.filter(p=> !p.unavailable[day][t]);
          available.sort((a,b)=> taskCount[a.name]-taskCount[b.name]);
          for(let i=0;i<task.peopleNeeded;i++){
            if(i>=available.length) break;
            assignedPeople.push(available[i].name);
            taskCount[available[i].name]++;
          }
        });
        td.innerText = assignedPeople.join(", ") || "-";
      } else td.innerText="-";
      tr.appendChild(td);
    });

    grid.appendChild(tr);
  });

  return grid.outerHTML;
}

// -------- Download CSV --------
function downloadCSV(type){
  let taskArray = tasks.filter(t=>t.type===type);
  if(taskArray.length===0) return alert("No tasks of this type");

  let taskCount = {};
  people.forEach(p=> taskCount[p.name] = 0);

  let csv="Task,"+daysOfWeek.join(",")+"\n";
  taskArray.forEach(task=>{
    csv+=task.name+",";
    csv+=daysOfWeek.map(day=>{
      if(task.days.includes(day)){
        let assignedPeople=[];
        task.times.forEach(t=>{
          const available = people.filter(p=>!p.unavailable[day][t]);
          available.sort((a,b)=> taskCount[a.name]-taskCount[b.name]);
          for(let i=0;i<task.peopleNeeded;i++){
            if(i>=available.length) break;
            assignedPeople.push(available[i].name);
            taskCount[available[i].name]++;
          }
        });
        return assignedPeople.join(" & ") || "-";
      } else return "-";
    }).join(",")+"\n";
  });

  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download=type+"_schedule.csv";
  a.click();
  URL.revokeObjectURL(url);
}

renderPeople();
renderTasks();
