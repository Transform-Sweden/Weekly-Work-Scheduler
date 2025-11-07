const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const timesOfDay = ["Morning","Afternoon","Evening"];

let people = JSON.parse(localStorage.getItem('people')) || [];
let kitchenTasks = JSON.parse(localStorage.getItem('kitchenTasks')) || [];
let workTasks = JSON.parse(localStorage.getItem('workTasks')) || [];
let kitchenSkipDays = JSON.parse(localStorage.getItem('kitchenSkipDays')) || {};
let workSkipDays = JSON.parse(localStorage.getItem('workSkipDays')) || {};
let lastAssignments = JSON.parse(localStorage.getItem('lastAssignments')) || {};

const peopleListDiv = document.getElementById('people-list');
const kitchenTasksDiv = document.getElementById('kitchen-tasks-list');
const workTasksDiv = document.getElementById('work-tasks-list');
const scheduleDisplay = document.getElementById('schedule-display');
const kitchenSkipDiv = document.getElementById('kitchen-skip-days');
const workSkipDiv = document.getElementById('work-skip-days');

function saveAll(){
  localStorage.setItem('people', JSON.stringify(people));
  localStorage.setItem('kitchenTasks', JSON.stringify(kitchenTasks));
  localStorage.setItem('workTasks', JSON.stringify(workTasks));
  localStorage.setItem('kitchenSkipDays', JSON.stringify(kitchenSkipDays));
  localStorage.setItem('workSkipDays', JSON.stringify(workSkipDays));
  localStorage.setItem('lastAssignments', JSON.stringify(lastAssignments));
}

function renderSkipDays(){
  kitchenSkipDiv.innerHTML = "";
  workSkipDiv.innerHTML = "";
  daysOfWeek.forEach(day => {
    const kcb = document.createElement('input');
    kcb.type="checkbox"; kcb.id=`kitchen-skip-${day}`;
    kcb.checked = kitchenSkipDays[day] || false;
    kcb.addEventListener('change',()=>{
      kitchenSkipDays[day]=kcb.checked;
      saveAll();
    });
    const klabel = document.createElement('label');
    klabel.textContent = day; klabel.appendChild(kcb);
    kitchenSkipDiv.appendChild(klabel);

    const wcb = document.createElement('input');
    wcb.type="checkbox"; wcb.id=`work-skip-${day}`;
    wcb.checked = workSkipDays[day] || false;
    wcb.addEventListener('change',()=>{
      workSkipDays[day]=wcb.checked;
      saveAll();
    });
    const wlabel = document.createElement('label');
    wlabel.textContent = day; wlabel.appendChild(wcb);
    workSkipDiv.appendChild(wlabel);

    kitchenSkipDays[day] = kitchenSkipDays[day] || false;
    workSkipDays[day] = workSkipDays[day] || false;
  });
}
renderSkipDays();

function renderPeople() {
  peopleListDiv.innerHTML = "";
  people.forEach((p, i) => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${p.name}</strong> 
      <button onclick="removePerson(${i})">Remove</button>`;
    daysOfWeek.forEach(day => {
      const dayDiv = document.createElement('div');
      dayDiv.innerHTML = `<em>${day}:</em> `;
      timesOfDay.forEach(time => {
        const cb = document.createElement('input');
        cb.type="checkbox";
        if(!p.unavailable) p.unavailable={};
        if(!p.unavailable[day]) p.unavailable[day]={};
        cb.checked = p.unavailable[day][time] || false;
        cb.addEventListener('change', ()=>{
          p.unavailable[day][time] = cb.checked;
          saveAll();
        });
        const label = document.createElement('label');
        label.textContent = time;
        label.appendChild(cb);
        dayDiv.appendChild(label);
      });
      div.appendChild(dayDiv);
    });
    peopleListDiv.appendChild(div);
  });
}

document.getElementById('add-person').addEventListener('click', () => {
  const name = prompt("Enter person's name:");
  if (!name) return;
  const person = {name, unavailable:{}};
  people.push(person);
  saveAll();
  renderPeople();
});

function removePerson(index) {
  people.splice(index,1);
  saveAll();
  renderPeople();
}

function renderKitchenTasks() {
  kitchenTasksDiv.innerHTML="";
  kitchenTasks.forEach((t,i)=>{
    const div = document.createElement('div');
    div.innerHTML = `${t.name} — ${t.people} person(s) 
      <button onclick="removeKitchenTask(${i})">Remove</button>`;
    kitchenTasksDiv.appendChild(div);
  });
}

document.getElementById('add-kitchen-task').addEventListener('click', () => {
  const name = prompt("Enter task name (Breakfast/Lunch/Dinner):");
  const peopleNum = parseInt(prompt("Number of people for task:"),10)||1;
  if (!name) return;
  kitchenTasks.push({name, people: peopleNum});
  saveAll();
  renderKitchenTasks();
});

function removeKitchenTask(i){
  kitchenTasks.splice(i,1);
  saveAll();
  renderKitchenTasks();
}

function renderWorkTasks() {
  workTasksDiv.innerHTML="";
  workTasks.forEach((t,i)=>{
    const div = document.createElement('div');
    div.innerHTML = `${t.name} — ${t.people} person(s) — ${t.time} 
      <button onclick="removeWorkTask(${i})">Remove</button>`;
    workTasksDiv.appendChild(div);
  });
}

document.getElementById('add-work-task').addEventListener('click', () => {
  const name = prompt("Enter housework task name:");
  const peopleNum = parseInt(prompt("Number of people for task:"),10)||1;
  const time = prompt("Preferred time: Morning, Afternoon, Evening, Any") || "Any";
  if (!name) return;
  workTasks.push({name, people: peopleNum, time});
  saveAll();
  renderWorkTasks();
});

function removeWorkTask(i){
  workTasks.splice(i,1);
  saveAll();
  renderWorkTasks();
}

document.getElementById('generate-schedule').addEventListener('click', () => {
  if(people.length===0){ alert("Add people first!"); return; }

  const assignmentCount = {};
  people.forEach(p => assignmentCount[p.name]=0);

  const assignments = {};
  people.forEach(p=>{
    assignments[p.name]={};
    daysOfWeek.forEach(d=>{
      assignments[p.name][d]={};
      timesOfDay.forEach(t=> assignments[p.name][d][t]=[]);
    });
  });

  function pickAvailablePerson(available) {
    if (available.length === 0) return null;
    available.sort((a,b) => assignmentCount[a.name] - assignmentCount[b.name]);
    const chosen = available[0];
    assignmentCount[chosen.name]++;
    return chosen;
  }

  daysOfWeek.forEach(day=>{
    timesOfDay.forEach(time=>{
      
      if (!kitchenSkipDays[day]) {
        kitchenTasks.forEach(t=>{
          if ((time==="Morning" && t.name.includes("Breakfast")) ||
              (time==="Afternoon" && t.name.includes("Lunch")) ||
              (time==="Evening" && t.name.includes("Dinner"))) {

            for(let i=0;i<t.people;i++){
              const available = people.filter(p=>!p.unavailable[day]?.[time]);
              const person = pickAvailablePerson(available);
              if(person){
                assignments[person.name][day][time].push(t.name);
              } else {
                assignments["Unassigned"] = assignments["Unassigned"] || {};
                assignments["Unassigned"][day] = assignments["Unassigned"][day] || {};
                assignments["Unassigned"][day][time] = assignments["Unassigned"][day][time] || [];
                assignments["Unassigned"][day][time].push(t.name);
              }
            }
          }
        });
      }

      if (!workSkipDays[day]) {
        workTasks.forEach(t=>{
          if ((time===t.time) || t.time==="Any") {
            for(let i=0;i<t.people;i++){
              const available = people.filter(p=>!p.unavailable[day]?.[time]);
              const person = pickAvailablePerson(available);
              if(person){
                assignments[person.name][day][time].push(t.name);
              } else {
                assignments["Unassigned"] = assignments["Unassigned"] || {};
                assignments["Unassigned"][day] = assignments["Unassigned"][day] || {};
                assignments["Unassigned"][day][time] = assignments["Unassigned"][day][time] || [];
                assignments["Unassigned"][day][time].push(t.name);
              }
            }
          }
        });
      }

    });
  });

  lastAssignments = assignments;
  saveAll();

  displaySchedule(assignments);
});

function displaySchedule(assignments){
  let html="";
  daysOfWeek.forEach(day=>{
    const dayHasTasks = people.some(p=>timesOfDay.some(time=>assignments[p.name][day][time].length>0));
    if(!dayHasTasks) return;
    html+=`<div class="day-schedule"><h3>${day}</h3>`;
    timesOfDay.forEach(time=>{
      html+=`<h4>${time}</h4><ul>`;
      people.forEach(p=>{
        const tasks = assignments[p.name][day][time];
        if(tasks.length===0){
          html+=`<li style="color: gray;">${p.name} — unavailable</li>`;
        } else {
          tasks.forEach((t, idx)=>{
            html+=`<li>
              <span class="task-name">${t}</span> — 
              <select class="person-select" data-day="${day}" data-time="${time}" data-task="${t}" data-idx="${idx}">
                ${people.map(pp=>`<option value="${pp.name}" ${pp.name===p.name?"selected":""}>${pp.name}</option>`).join('')}
              </select>
            </li>`;
          });
        }
      });
      if(assignments["Unassigned"] && assignments["Unassigned"][day] && assignments["Unassigned"][day][time]){
        assignments["Unassigned"][day][time].forEach(t=>{
          html+=`<li class="unassigned">${t} — Unassigned</li>`;
        });
      }
      html+="</ul>";
    });
    html+="</div>";
  });
  scheduleDisplay.innerHTML=html;

  document.querySelectorAll(".person-select").forEach(select=>{
    select.addEventListener("change", e=>{
      const day = e.target.dataset.day;
      const time = e.target.dataset.time;
      const task = e.target.dataset.task;
      const idx = parseInt(e.target.dataset.idx);

      const oldPerson = Object.keys(assignments).find(name=>assignments[name][day][time].includes(task));
      if(oldPerson){
        assignments[oldPerson][day][time].splice(assignments[oldPerson][day][time].indexOf(task),1);
      }
      const newPerson = e.target.value;
      assignments[newPerson][day][time].push(task);
      lastAssignments = assignments;
      saveAll();
    });
  });
}

document.getElementById('clear-schedule').addEventListener('click', ()=>{
  scheduleDisplay.innerHTML="";
  lastAssignments = {};
  saveAll();
});

window.addEventListener('load', ()=>{
  renderPeople();
  renderKitchenTasks();
  renderWorkTasks();
  if(Object.keys(lastAssignments).length>0){
    displaySchedule(lastAssignments);
  }
});
