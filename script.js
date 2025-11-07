// ------------------ Data ------------------
let people = [];
let kitchenTasks = [];
let workTasks = [];
const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const timesOfDay = ["Morning","Afternoon","Evening"];
const kitchenSkipDays = {};
const workSkipDays = {};

// ------------------ Local Storage ------------------
function saveState() {
  const state = {
    people,
    kitchenTasks,
    workTasks,
    kitchenSkipDays,
    workSkipDays
  };
  localStorage.setItem('schedulerState', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('schedulerState');
  if (!saved) return;
  const state = JSON.parse(saved);
  people = state.people || [];
  kitchenTasks = state.kitchenTasks || [];
  workTasks = state.workTasks || [];
  Object.assign(kitchenSkipDays, state.kitchenSkipDays || {});
  Object.assign(workSkipDays, state.workSkipDays || {});
}

loadState();

// ------------------ People ------------------
const personInput = document.getElementById('person-name');
const addPersonBtn = document.getElementById('add-person');
const peopleList = document.getElementById('people-list');

addPersonBtn.addEventListener('click', ()=>{
  const name = personInput.value.trim();
  if(!name) return;
  people.push({name, unavailable:{}});
  renderPeople();
  saveState();
  personInput.value="";
});

function renderPeople(){
  peopleList.innerHTML="";
  people.forEach((p,i)=>{
    const div = document.createElement('div');
    div.className="person-card";

    let html = `<span class="person-name">${p.name}</span>
      <button onclick="removePerson(${i})">Remove</button>
      <table class="availability-table">
        <tr>
          <th>Day</th>
          ${timesOfDay.map(t=>`<th>${t}</th>`).join('')}
        </tr>`;

    daysOfWeek.forEach(day=>{
      html += `<tr><td>${day}</td>`;
      timesOfDay.forEach(time=>{
        const checked = p.unavailable[day]?.[time] ? 'checked' : '';
        html += `<td><input type="checkbox" data-person="${i}" data-day="${day}" data-time="${time}" ${checked}></td>`;
      });
      html += `</tr>`;
    });

    html += `</table>`;
    div.innerHTML = html;
    peopleList.appendChild(div);
  });

  document.querySelectorAll('.availability-table input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change', e=>{
      const i = parseInt(cb.dataset.person);
      const day = cb.dataset.day;
      const time = cb.dataset.time;
      people[i].unavailable[day] = people[i].unavailable[day] || {};
      people[i].unavailable[day][time] = cb.checked;
      saveState();
    });
  });
}

function removePerson(index){
  people.splice(index,1);
  renderPeople();
  saveState();
}

// ------------------ Tasks ------------------
function createTaskSection(taskArray, containerId){
  const container = document.getElementById(containerId);
  container.innerHTML="";
  taskArray.forEach((t,i)=>{
    const div = document.createElement('div');
    div.className="task-card";
    div.innerHTML=`<span>${t.name} (${t.people} person(s))</span>
      <button onclick="removeTask('${containerId}',${i})">Remove</button>`;
    container.appendChild(div);
  });
  enableDrag(containerId, taskArray);
}

function removeTask(containerId,index){
  if(containerId==="kitchen-tasks") kitchenTasks.splice(index,1);
  if(containerId==="work-tasks") workTasks.splice(index,1);
  createTaskSection(containerId==="kitchen-tasks"?kitchenTasks:workTasks, containerId);
  saveState();
}

document.getElementById('add-kitchen-task').addEventListener('click',()=>{
  const name=prompt("Task name?","Breakfast");
  const peopleNum=parseInt(prompt("People needed?",1));
  if(name && peopleNum>0) kitchenTasks.push({name, people:peopleNum});
  createTaskSection(kitchenTasks,'kitchen-tasks');
  saveState();
});

document.getElementById('add-work-task').addEventListener('click',()=>{
  const name=prompt("Task name?","Vacuum");
  const peopleNum=parseInt(prompt("People needed?",1));
  if(name && peopleNum>0) workTasks.push({name, people:peopleNum});
  createTaskSection(workTasks,'work-tasks');
  saveState();
});

// ------------------ Skip Days ------------------
function renderSkipDays(){
  const kContainer = document.getElementById('kitchen-skip-days');
  const wContainer = document.getElementById('work-skip-days');
  kContainer.innerHTML=""; wContainer.innerHTML="";
  daysOfWeek.forEach(day=>{
    let cb = document.createElement('input'); cb.type='checkbox'; cb.id='kitchen-skip-'+day; cb.checked=kitchenSkipDays[day]||false;
    cb.addEventListener('change', ()=>{ kitchenSkipDays[day]=cb.checked; saveState(); });
    let label = document.createElement('label'); label.htmlFor=cb.id; label.innerText=day;
    kContainer.appendChild(cb); kContainer.appendChild(label); kContainer.appendChild(document.createElement('br'));

    let cb2 = document.createElement('input'); cb2.type='checkbox'; cb2.id='work-skip-'+day; cb2.checked=workSkipDays[day]||false;
    cb2.addEventListener('change', ()=>{ workSkipDays[day]=cb2.checked; saveState(); });
    let label2 = document.createElement('label'); label2.htmlFor=cb2.id; label2.innerText=day;
    wContainer.appendChild(cb2); wContainer.appendChild(label2); wContainer.appendChild(document.createElement('br'));
  });
}
renderSkipDays();

// ------------------ Drag & Drop ------------------
function enableDrag(containerId, taskArray){
  const container = document.getElementById(containerId);
  container.querySelectorAll('.task-card').forEach((card,index)=>{
    card.draggable=true;
    card.addEventListener('dragstart',(e)=>{ e.dataTransfer.setData('text/plain', index); });
    card.addEventListener('drop',(e)=>{
      e.preventDefault();
      const from = e.dataTransfer.getData('text/plain');
      const to = index;
      const temp = taskArray[from];
      taskArray[from] = taskArray[to];
      taskArray[to] = temp;
      createTaskSection(taskArray, containerId);
      saveState();
    });
    card.addEventListener('dragover', e=>e.preventDefault());
  });
}

// ------------------ Schedule ------------------
const scheduleDisplay = document.getElementById('schedule-display');

document.getElementById('generate-schedule').addEventListener('click', ()=>{
  if(people.length===0){ alert("Add people first!"); return; }

  const assignments = {};
  people.forEach(p=>{
    assignments[p.name]={};
    daysOfWeek.forEach(d=>{
      assignments[p.name][d]={};
      timesOfDay.forEach(t=> assignments[p.name][d][t]=[]);
    });
  });

  daysOfWeek.forEach(day=>{
    if(!kitchenSkipDays[day]){
      kitchenTasks.forEach(t=>{
        const available = people.filter(p=>!p.unavailable[day]?.["Morning"]);
        for(let i=0;i<t.people;i++){
          if(available.length===0) break;
          const person = available[i % available.length];
          assignments[person.name][day]["Morning"].push(t.name);
        }
      });
    }
    if(!workSkipDays[day]){
      workTasks.forEach(t=>{
        const available = people.filter(p=>!p.unavailable[day]?.["Afternoon"]);
        for(let i=0;i<t.people;i++){
          if(available.length===0) break;
          const person = available[i % available.length];
          assignments[person.name][day]["Afternoon"].push(t.name);
        }
      });
    }
  });

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
          tasks.forEach(t=>{ html+=`<li>${t} — ${p.name}</li>`; });
        }
      });
      html+="</ul>";
    });
    html+="</div>";
  });
  scheduleDisplay.innerHTML=html;
});

// ------------------ Export CSV ------------------
document.getElementById('export-csv').addEventListener('click', ()=>{
  let csv="Day,Time,Task,Person\n";
  const scheduleItems = scheduleDisplay.querySelectorAll(".day-schedule");
  scheduleItems.forEach(dayDiv=>{
    const day = dayDiv.querySelector("h3").innerText;
    const times = dayDiv.querySelectorAll("h4");
    times.forEach(tEl=>{
      const time = tEl.innerText;
      const lis = tEl.nextElementSibling.querySelectorAll("li");
      lis.forEach(li=>{
        if(li.style.color==="gray") return;
        const [task, person] = li.innerText.split(" — ");
        csv+=`${day},${time},${task},${person}\n`;
      });
    });
  });
  const blob = new Blob([csv], {type: "text/csv"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "weekly_schedule.csv";
  link.click();
});

// ------------------ Initial Render ------------------
renderPeople();
createTaskSection(kitchenTasks,'kitchen-tasks');
createTaskSection(workTasks,'work-tasks');
renderSkipDays();
