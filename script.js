let people = [];
let kitchenTasks = [];
let workTasks = [];
let days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ---------------- PEOPLE ----------------
function addPerson() {
  const nameInput = document.getElementById("person-name");
  const name = nameInput.value.trim();
  if(!name || people.includes(name)) return;
  people.push(name);
  nameInput.value = "";
  renderPeople();
  renderAvailability();
}

function removePerson(name) {
  people = people.filter(p=>p!==name);
  renderPeople();
  renderAvailability();
}

function renderPeople() {
  const ul = document.getElementById("people-list");
  ul.innerHTML = "";
  people.forEach(person=>{
    const li = document.createElement("li");
    li.textContent = person + " ";
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.onclick = () => removePerson(person);
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// ---------------- TASKS ----------------
function addKitchenTask() {
  const name = document.getElementById("kitchen-task-name").value.trim();
  const amount = parseInt(document.getElementById("kitchen-task-amount").value);
  if(!name || amount<1) return;
  kitchenTasks.push({name,amount});
  renderTasks();
}

function addWorkTask() {
  const name = document.getElementById("work-task-name").value.trim();
  const amount = parseInt(document.getElementById("work-task-amount").value);
  if(!name || amount<1) return;
  workTasks.push({name,amount});
  renderTasks();
}

function removeTask(type,index) {
  if(type==="kitchen") kitchenTasks.splice(index,1);
  else workTasks.splice(index,1);
  renderTasks();
}

function renderTasks() {
  const kitchenUl = document.getElementById("kitchen-task-list");
  kitchenUl.innerHTML = "";
  kitchenTasks.forEach((task,i)=>{
    const li = document.createElement("li");
    li.textContent = `${task.name} (${task.amount}) `;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.onclick = () => removeTask("kitchen",i);
    li.appendChild(btn);
    kitchenUl.appendChild(li);
  });

  const workUl = document.getElementById("work-task-list");
  workUl.innerHTML = "";
  workTasks.forEach((task,i)=>{
    const li = document.createElement("li");
    li.textContent = `${task.name} (${task.amount}) `;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.onclick = () => removeTask("work",i);
    li.appendChild(btn);
    workUl.appendChild(li);
  });
}

// ---------------- AVAILABILITY ----------------
function renderAvailability() {
  const tbody = document.querySelector("#availability-table tbody");
  tbody.innerHTML = "";
  people.forEach(person=>{
    days.forEach(day=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${person}</td><td>${day}</td>`;
      const tasks = ["Breakfast","Lunch","LunchDishes","Dinner","DinnerDishes","WorkDuties"];
      tasks.forEach(task=>{
        const td = document.createElement("td");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = true;
        cb.onchange = () => {
          if(task==="LunchDishes") {
            const workCb = td.parentElement.querySelector("td:last-child input");
            workCb.checked = cb.checked;
          }
        };
        td.appendChild(cb);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  });
}

// ---------------- SCHEDULE GENERATION ----------------
function generateSchedule() {
  if(people.length===0) return alert("Add people first!");

  const kitchenGrid = document.getElementById("kitchen-grid");
  const workGrid = document.getElementById("work-grid");
  kitchenGrid.innerHTML = "";
  workGrid.innerHTML = "";

  function createGrid(tasks,gridDiv){
    const table = document.createElement("table");
    table.className = "grid-table";
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    trHead.innerHTML = "<th>Task</th>"+days.map(d=>`<th>${d}</th>`).join("");
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    tasks.forEach(task=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${task.name}</td>`;
      days.forEach(day=>{
        const td = document.createElement("td");
        const available = people.filter(person=>{
          const row = [...document.querySelectorAll("#availability-table tbody tr")]
                      .find(r => r.cells[0].textContent===person && r.cells[1].textContent===day);
          const taskIndex = {"Breakfast":2,"Lunch":3,"LunchDishes":4,"Dinner":5,"DinnerDishes":6,"WorkDuties":7}[task.name] || 2;
          return row.cells[taskIndex].querySelector("input").checked;
        });
        td.textContent = available.slice(0,task.amount).join(", ");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    gridDiv.appendChild(table);
  }

  createGrid(kitchenTasks,kitchenGrid);
  createGrid(workTasks,workGrid);
}

function clearSchedule(){
  document.getElementById("kitchen-grid").innerHTML="";
  document.getElementById("work-grid").innerHTML="";
}

// Initial render
renderPeople();
renderTasks();
renderAvailability();
