// --- Tab Navigation ---
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabContents.forEach(tc => tc.classList.remove('active'));
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Activate first tab by default
tabContents[0].classList.add('active');

// --- LOCAL STORAGE HELPERS ---
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const loadData = (key, defaultData) => JSON.parse(localStorage.getItem(key)) || defaultData;

// --- PEOPLE MANAGEMENT ---
let people = loadData('people', []);

const peopleList = document.getElementById('people-list');
const personNameInput = document.getElementById('person-name');
const addPersonBtn = document.getElementById('add-person');

function renderPeople() {
  peopleList.innerHTML = '';
  people.forEach((p, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${p.name} - Unavailable: ${p.unavailable.join(', ') || 'None'}
      <button class="remove-person" data-index="${index}">Remove</button>`;
    peopleList.appendChild(li);
  });
  saveData('people', people);
}

addPersonBtn.addEventListener('click', () => {
  const name = personNameInput.value.trim();
  if (name) {
    people.push({name, unavailable: []});
    personNameInput.value = '';
    renderPeople();
  }
});

peopleList.addEventListener('click', e => {
  if(e.target.classList.contains('remove-person')){
    const idx = e.target.dataset.index;
    people.splice(idx, 1);
    renderPeople();
  }
});

// --- TASK & DAY MANAGEMENT ---
let kitchenDays = loadData('kitchenDays', []);
let workDays = loadData('workDays', []);

const kitchenContainer = document.getElementById('kitchen-days');
const workContainer = document.getElementById('work-days');

function createDayElement(dayObj, type, dayIndex){
  const dayDiv = document.createElement('div');
  dayDiv.className = 'day';
  const title = document.createElement('h3');
  title.textContent = dayObj.name;
  const delDayBtn = document.createElement('button');
  delDayBtn.textContent = 'Remove Day';
  delDayBtn.className = 'delete-day';
  delDayBtn.addEventListener('click', () => {
    if(type === 'kitchen'){
      kitchenDays.splice(dayIndex,1);
      renderDays('kitchen');
    } else {
      workDays.splice(dayIndex,1);
      renderDays('work');
    }
  });
  dayDiv.appendChild(title);
  dayDiv.appendChild(delDayBtn);

  dayObj.tasks.forEach((task, tIdx) => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    const taskName = document.createElement('input');
    taskName.type = 'text';
    taskName.value = task.name;
    taskName.addEventListener('input', ()=>{task.name=taskName.value; saveAll();});
    const peopleCount = document.createElement('input');
    peopleCount.type = 'number';
    peopleCount.value = task.people || 1;
    peopleCount.min = 1;
    peopleCount.addEventListener('input', ()=>{task.people=Number(peopleCount.value); saveAll();});
    const delTaskBtn = document.createElement('button');
    delTaskBtn.textContent = 'Delete';
    delTaskBtn.className = 'delete-task';
    delTaskBtn.addEventListener('click', ()=>{
      dayObj.tasks.splice(tIdx,1);
      renderDays(type);
    });

    taskDiv.appendChild(taskName);
    taskDiv.appendChild(peopleCount);
    taskDiv.appendChild(delTaskBtn);
    dayDiv.appendChild(taskDiv);
  });

  const addTaskBtn = document.createElement('button');
  addTaskBtn.textContent = 'Add Task';
  addTaskBtn.className = 'add-task';
  addTaskBtn.addEventListener('click', ()=>{
    const newTask = {name:'New Task', people:1};
    dayObj.tasks.push(newTask);
    renderDays(type);
  });
  dayDiv.appendChild(addTaskBtn);

  return dayDiv;
}

function renderDays(type){
  if(type === 'kitchen'){
    kitchenContainer.innerHTML = '';
    kitchenDays.forEach((d,i)=>{
      kitchenContainer.appendChild(createDayElement(d,'kitchen',i));
    });
    saveData('kitchenDays', kitchenDays);
  } else {
    workContainer.innerHTML = '';
    workDays.forEach((d,i)=>{
      workContainer.appendChild(createDayElement(d,'work',i));
    });
    saveData('workDays', workDays);
  }
}

// --- ADD DAY BUTTONS ---
document.querySelectorAll('.add-day').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const type = btn.dataset.type;
    const dayName = prompt('Enter day name (e.g., Monday):');
    if(dayName){
      const defaultTasks = type==='kitchen' ? [
        {name:'Breakfast (includes dishes)', people:1},
        {name:'Lunch (includes dishes)', people:1},
        {name:'Dinner (includes dishes)', people:1},
      ] : [
        {name:'Vacuum living room', people:1},
        {name:'Take out trash', people:1},
        {name:'Laundry', people:1},
      ];
      const dayObj = {name: dayName, tasks: defaultTasks};
      if(type==='kitchen'){
        kitchenDays.push(dayObj);
        renderDays('kitchen');
      } else {
        workDays.push(dayObj);
        renderDays('work');
      }
    }
  });
});

// --- SAVE ALL ---
function saveAll(){
  saveData('kitchenDays', kitchenDays);
  saveData('workDays', workDays);
  saveData('people', people);
}

renderPeople();
renderDays('kitchen');
renderDays('work');

// --- SCHEDULE GENERATOR (Simplified Equal Distribution) ---
document.getElementById('generate-schedule').addEventListener('click', ()=>{
  const allTasks = [];
  kitchenDays.forEach(d=>{
    d.tasks.forEach(t=>{
      for(let i=0;i<t.people;i++){
        allTasks.push({day:d.name, task:t.name});
      }
    });
  });
  workDays.forEach(d=>{
    d.tasks.forEach(t=>{
      for(let i=0;i<t.people;i++){
        allTasks.push({day:d.name, task:t.name});
      }
    });
  });

  const availablePeople = people.map(p=>p.name);
  if(availablePeople.length===0){
    alert('Please add people first!');
    return;
  }

  const shuffledTasks = allTasks.sort(()=>Math.random()-0.5);

  const assignments = {};
  availablePeople.forEach(name=>assignments[name]=[]);
  let i=0;
  shuffledTasks.forEach(t=>{
    const person = availablePeople[i % availablePeople.length];
    assignments[person].push(`${t.day}: ${t.task}`);
    i++;
  });

  let result = 'Generated Schedule:\n\n';
  for(const [name,tasks] of Object.entries(assignments)){
    result += `${name}:\n`;
    tasks.forEach(task=>{result+=`  - ${task}\n`;});
    result+='\n';
  }
  alert(result);
});
