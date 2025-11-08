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
    const person = { name: name, availability: {}, taskCount: {} };
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
        header.innerHTML = "<th>Day</th><th>Breakfast</th><th>Lunch</th><th>Lunch Dishes</th><th>Dinner</th><th>Dinner Dishes</th><th>Work Duties</th>";
        table.appendChild(header);
        daysOfWeek.forEach(day => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${day}</td>
                <td><input type="checkbox" ${!person.availability[day].breakfast ? "checked" : ""} onchange="toggleAvailability(${index},'breakfast','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].lunch ? "checked" : ""} onchange="toggleAvailability(${index},'lunch','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].lunchDishes ? "checked" : ""} onchange="toggleLunchDishes(${index},'lunchDishes','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].dinner ? "checked" : ""} onchange="toggleAvailability(${index},'dinner','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].dinnerDishes ? "checked" : ""} onchange="toggleAvailability(${index},'dinnerDishes','${day}',this)"></td>
                <td><input type="checkbox" ${!person.availability[day].work ? "checked" : ""} onchange="toggleAvailability(${index},'work','${day}',this)"></td>`;
            table.appendChild(row);
        });
        div.appendChild(table);
        peopleListDiv.appendChild(div);
    });
}

// Toggle general availability
function toggleAvailability(personIndex, task, day, checkbox) {
    people[personIndex].availability[day][task] = !checkbox.checked;
}

// Toggle Lunch Dishes and link to Work Duties
function toggleLunchDishes(personIndex, task, day, checkbox) {
    const isUnavailable = checkbox.checked;
    people[personIndex].availability[day].lunchDishes = !isUnavailable;
    // Automatically mark Work Duties as unavailable if Lunch Dishes unavailable
    people[personIndex].availability[day].work = !isUnavailable;
    renderPeople(); // refresh table
}

// Add kitchen task
addKitchenTaskBtn.addEventListener("click", () => {
    const taskName = prompt("Enter Kitchen Task Name:");
    if (!taskName) return;
    let peopleNeeded = parseInt(prompt("How many people are needed for this task?"), 10);
    if (isNaN(peopleNeeded) || peopleNeeded < 1) peopleNeeded = 1;
    kitchenTasks.push({ name: taskName, peopleNeeded });
    renderTasks();
});

// Add work duty
addWorkTaskBtn.addEventListener("click", () => {
    const taskName = prompt("Enter Work Duty Name:");
    if (!taskName) return;
    let peopleNeeded = parseInt(prompt("How many people are needed for this task?"), 10);
    if (isNaN(peopleNeeded) || peopleNeeded < 1) peopleNeeded = 1;
    workTasks.push({ name: taskName, peopleNeeded });
    renderTasks();
});

// Render tasks
function renderTasks() {
    kitchenTasksListDiv.innerHTML = kitchenTasks.map(t => `<div>${t.name} (People needed: ${t.peopleNeeded})</div>`).join("");
    workTasksListDiv.innerHTML = workTasks.map(t => `<div>${t.name} (People needed: ${t.peopleNeeded})</div>`).join("");
}

// Generate schedule
generateScheduleBtn.addEventListener("click", () => {
    kitchenScheduleDiv.innerHTML = "";
    workScheduleDiv.innerHTML = "";

    // Generate kitchen schedule
    const kitchenTable = document.createElement("table");
    let header = "<tr><th>Day</th>";
    kitchenTasks.forEach(t => header += `<th>${t.name}</th>`);
    header += "</tr>";
    kitchenTable.innerHTML = header;

    daysOfWeek.forEach(day => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${day}</td>`;
        kitchenTasks.forEach(task => {
            const available = people.filter(p => p.availability[day][task.name.replace(/\s/g,"").toLowerCase()] !== false);
            let assigned = [];
            for (let i = 0; i < task.peopleNeeded; i++) {
                if (available.length === 0) assigned.push("-");
                else {
                    const idx = i % available.length;
                    assigned.push(available[idx].name);
                }
            }
            row.innerHTML += `<td>${assigned.join(", ")}</td>`;
        });
        kitchenTable.appendChild(row);
    });
    kitchenScheduleDiv.appendChild(kitchenTable);

    // Generate work duties schedule
    const workTable = document.createElement("table");
    let wHeader = "<tr><th>Day</th>";
    workTasks.forEach(t => wHeader += `<th>${t.name}</th>`);
    wHeader += "</tr>";
    workTable.innerHTML = wHeader;

    daysOfWeek.forEach(day => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${day}</td>`;
        workTasks.forEach(task => {
            const available = people.filter(p => p.availability[day].work !== false);
            let assigned = [];
            for (let i = 0; i < task.peopleNeeded; i++) {
                if (available.length === 0) assigned.push("-");
                else {
                    const idx = i % available.length;
                    assigned.push(available[idx].name);
                }
            }
            row.innerHTML += `<td>${assigned.join(", ")}</td>`;
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
