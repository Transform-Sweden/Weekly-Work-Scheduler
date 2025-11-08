const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const kitchenSlots = ["Breakfast","Lunch","Lunch Dishes","Dinner","Dinner Dishes"];

let people = JSON.parse(localStorage.getItem("people")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const peopleListDiv = document.getElementById("peopleList");
const taskListDiv = document.getElementById("taskList");
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
  people.push({
    name,
    unavailableKitchen: {},
    unavailableWork: {}
  });
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

    // Kitchen Availability
    const kitchenTable = document.createElement("table");
    kitchenTable.className = "availability-grid";
    const kitchenHead = `<tr><th>Kitchen Task</th>${daysOfWeek.map(d=>`<th>${d}</th>`).join("")}</tr>`;
    kitchenTable.innerHTML = kitchenHead;

    kitchenSlots.forEach(slot=>{
      const row = document.createElement("tr");
      row.innerHTML = `<td>${slot}</td>`;
      daysOfWeek.forEach(day=>{
        if(!p.unavailableKitchen[day]) p.unavailableKitchen[day] = {};
        const cell = document.createElement("td");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = p.unavailableKitchen[day][slot] || false;
        cb.addEventListener("change",()=>{
          p.unavailableKitchen[day][slot] = cb.checked;
          saveAll();
        });
        cell.appendChild(cb);
        row.appendChild(cell);
      });
      kitchenTable.appendChild(row);
    });

    container.appendChild(document.createElement("br"));
    container.appendChild(kitchenTable);

    // Housework Availability
    const workTable = document.createElement("table");
    workTable.className = "availability-grid";
    const workHead = `<tr><th>Housework (Afternoon)</th>${daysOfWeek.map(d=>`<th>${d}</th>`).join("")}</tr>`;
    workTable.innerHTML = workHead;

    const row = document.createElement("tr");
    row.innerHTML = "<td>Unavailable</td>";
    daysOfWeek.forEach(day=>{
      const cell = document.createElement("td");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = p.unavailableWork[day] || false;
      cb.addEventListener("change",()=>{
        p.unavailableWork[day] = cb.checked;
        saveAll();
      });
      cell.appendChild(cb);
      row.appendChild(cell);
    });
    workTable.appendChild(row);
    container.appendChild(workTable);

    peopleListDiv.appendChild(container);
  });
}

// -------- Tasks --------
function addTask() {
  const name = document.getElementById("taskName").value.trim();
  const type = document.getElementById("taskType").value;
  const peopleNeeded = parseInt(document.getElementById("taskPeople").value);
  const dayCheckboxes = document.querySelectorAll("#taskDays input[type=checkbox]");
  const days = Array.from(dayCheckboxes).filter(cb=>cb.checked).map(cb=>cb.value);

  if(!name || days.length===0) return alert("Enter task name and days");

  tasks.push({name,type,peopleNeeded,days});
  saveAll();
  renderTasks();
}

function removeTask(i){
  tasks.splice(i,1);
  saveAll();
  renderTasks();
}

function toggleTaskDay(i,day){
  const task = tasks[i];
  if(task.days.includes(day)){
    task.days = task.days.filter(d=>d!==day);
  } else task.days.push(day);
  saveAll();
  renderTasks();
}

function renderTasks(){
  taskListDiv.innerHTML="";
  tasks.forEach((t,i)=>{
    const div=document.createElement("div");
    const dayControls = daysOfWeek.map(day=>{
      const checked = t.days.includes(day) ? "checked" : "";
      return `<label><input type="checkbox" ${checked} onclick="toggleTaskDay(${i},'${day}')">${day.slice(0,3)}</label>`;
    }).join(" ");
    div.innerHTML=`${t.name} (${t.type}) - ${t.peopleNeeded} people<br>Days: ${dayControls}<br><button onclick="removeTask(${i})">Remove</button>`;
    taskListDiv.appendChild(div);
  });
}

// -------- Generate Schedule --------
function generateSchedules() {
  const kitchenGrid = createScheduleGrid(tasks.filter(t=>t.type==="kitchen"), "kitchen");
  const houseworkGrid = createScheduleGrid(tasks.filter(t=>t.type==="housework"), "housework");

  kitchenContainer.innerHTML = kitchenGrid;
  houseworkContainer.innerHTML = houseworkGrid;
}

function createScheduleGrid(taskArray, type){
  let taskCount = {};
  people.forEach(p=> taskCount[p.name] = 0);

  let grid = `<table class='schedule-grid'><tr><th>Task / Day</th>${daysOfWeek.map(d=>`<th>${d}</th>`).join("")}</tr>`;
  
  taskArray.forEach(task=>{
    grid += `<tr><td>${task.name}</td>`;
    daysOfWeek.forEach(day=>{
      if(task.days.includes(day)){
        let availablePeople;
        if(type==="kitchen"){
          availablePeople = people.filter(p=>{
            return kitchenSlots.some(slot=>!p.unavailableKitchen[day]?.[slot]);
          });
        } else {
          availablePeople = people.filter(p=>!p.unavailableWork[day]);
        }
        availablePeople.sort((a,b)=>taskCount[a.name]-taskCount[b.name]);
        let assigned = availablePeople.slice(0,task.peopleNeeded).map(p=>p.name);
        assigned.forEach(name=>taskCount[name]++);
        grid += `<td>${assigned.join(", ") || "-"}</td>`;
      } else grid += `<td>-</td>`;
    });
    grid += `</tr>`;
  });

  grid += `</table>`;
  return grid;
}

// -------- Download CSV --------
function downloadCSV(type){
  let taskArray = tasks.filter(t=>t.type===type);
  if(taskArray.length===0) return alert("No tasks of this type");

  let csv="Task,"+daysOfWeek.join(",")+"\n";
  taskArray.forEach(task=>{
    csv+=task.name+",";
    csv+=daysOfWeek.map(day=>{
      return task.days.includes(day) ? "Assigned" : "-";
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
