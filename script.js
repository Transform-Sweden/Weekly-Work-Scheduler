// Data storage
let people = [];
let kitchenTasks = [];
let workTasks = [];
let daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// DOM elements
const personNameInput = document.getElementById("personName");
const addPersonBtn = document.getElementById("addPersonBtn");
const peopleListDiv = document.getElementById("peopleList");
const addKitchenTaskBtn = document.getElementById("addKitchenTaskBtn");
const kitchenTasksListDiv = document.getElementById("kitchenTasksList");
const addWorkTaskBtn = document.getElementById("addWorkTaskBtn");
const workTasksListDiv = document.getElementById("workTasksList");
const generateScheduleBtn = document.getElementById("generateScheduleBtn");
const clearScheduleBtn = document.getElementById("clearScheduleBtn");
const kitchenScheduleDiv = document.getElementById("kitchenSchedule");
const workScheduleDiv = document.getElementById("workSchedule");

// Add person
addPersonBtn.addEventListener("click", () => {
    const name = personNameInput.value.trim();
    if (!name) return;
    if (people.find(p => p.name === name)) {
        alert("Person already exists!");
        return;
    }
    const person = { name: name, availability: {} };
    daysOfWeek.forEach(day => {
        person.availability[day] = {
            breakfast: true,
            lunch: true,
            lunchDishes: true,
            dinner: true,
            dinnerDishes: true,
            work: true
        };
    });
    people.push(person);
    personNameInput.value = "";
    renderPeople();
});

// Render people
function renderPeople() {
    peopleListDiv.innerHTML = "";
    people.forEach((person, index) => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${person.name}</strong>`;
        const table = document.createElement("table");
        const header = document.createElement("tr");
        header.innerHTML = "<th>Day</th><th>Breakfast</th><th>Lunch</th><th>Lunch Dishes</th><th>Dinner</th><th>Dinner Dishes</th><th>Work</th>";
        table.appendChild(header);
        daysOfWeek.forEach(day => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${day}</td>
                <td><input type="checkbox" ${!person.availability[day].breakfast ? "checked" : ""} onchange="toggleAvailability(${index},'breakfast','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].lunch ? "checked" : ""} onchange="toggleAvailability(${index},'lunch','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].lunchDishes ? "checked" : ""} onchange="toggleAvailability(${index},'lunchDishes','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].dinner ? "checked" : ""} onchange="toggleAvailability(${index},'dinner','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].dinnerDishes ? "checked" : ""} onchange="toggleAvailability(${index},'dinnerDishes','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].work ? "checked" : ""} onchange="toggleAvailability(${index},'work','${day}',this)"></td>`;
            table.appendChild(row);
        });
        div.appendChild(table);
        peopleListDiv.appendChild(div);
    });
}

// Toggle availability
function toggleAvailability(personIndex, task, day, checkbox) {
    people[personIndex].availability[day][task] = !checkbox.checked;
}

// Add kitchen task
addKitchenTaskBtn.addEventListener("click", () => {
    const taskName = prompt("Enter Kitchen Task Name:");
    if (!taskName) return;
    kitchenTasks.push(taskName);
    renderTasks();
});

// Add work task
addWorkTaskBtn.addEventListener("click", () => {
    const taskName = prompt("Enter Work Task Name:");
    if (!taskName) return;
    workTasks.push(taskName);
    renderTasks();
});

// Render tasks
function renderTasks() {
    kitchenTasksListDiv.innerHTML = kitchenTasks.map(t => `<div>${t}</div>`).join("");
    workTasksListDiv.innerHTML = workTasks.map(t => `<div>${t}</div>`).join("");
}

// Generate schedule
generateScheduleBtn.addEventListener("click", () => {
    kitchenScheduleDiv.innerHTML = "";
    workScheduleDiv.innerHTML = "";
    
    // Generate kitchen schedule
    const kitchenTable = document.createElement("table");
    let header = "<tr><th>Day</th>";
    kitchenTasks.forEach(t => header += `<th>${t}</th>`);
    header += "</tr>";
    kitchenTable.innerHTML = header;
    
    daysOfWeek.forEach(day => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${day}</td>`;
        kitchenTasks.forEach(task => {
            // Pick an available person (simple round robin)
            const available = people.filter(p => p.availability[day][task.toLowerCase().replace(/\s/g,"")] !== false);
            const person = available[Math.floor(Math.random()*available.length)];
            row.innerHTML += `<td>${person ? person.name : "-"}</td>`;
        });
        kitchenTable.appendChild(row);
    });
    kitchenScheduleDiv.appendChild(kitchenTable);

    // Generate work schedule
    const workTable = document.createElement("table");
    let wHeader = "<tr><th>Day</th>";
    workTasks.forEach(t => wHeader += `<th>${t}</th>`);
    wHeader += "</tr>";
    workTable.innerHTML = wHeader;

    daysOfWeek.forEach(day => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${day}</td>`;
        workTasks.forEach(task => {
            const available = people.filter(p => p.availability[day].work !== false);
            const person = available[Math.floor(Math.random()*available.length)];
            row.innerHTML += `<td>${person ? person.name : "-"}</td>`;
        });
        workTable.appendChild(row);
    });
    workScheduleDiv.appendChild(workTable);
});

// Clear schedule
clearScheduleBtn.addEventListener("click", () => {
    kitchenScheduleDiv.innerHTML = "";
    workScheduleDiv.innerHTML = "";
});
