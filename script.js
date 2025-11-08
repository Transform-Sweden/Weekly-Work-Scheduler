const peopleList = [];
const kitchenTasks = [];
const workTasks = [];
const availability = {};

// --- People Section ---
const personInput = document.getElementById("person-name");
const addPersonBtn = document.getElementById("add-person-btn");
const peopleUl = document.getElementById("people-list");

addPersonBtn.addEventListener("click", () => {
    const name = personInput.value.trim();
    if (name && !peopleList.includes(name)) {
        peopleList.push(name);
        availability[name] = { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true };
        renderPeople();
        renderAvailability();
        personInput.value = "";
    }
});

function removePerson(name) {
    const idx = peopleList.indexOf(name);
    if (idx > -1) {
        peopleList.splice(idx, 1);
        delete availability[name];
        renderPeople();
        renderAvailability();
    }
}

function renderPeople() {
    peopleUl.innerHTML = "";
    peopleList.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "remove-btn";
        removeBtn.onclick = () => removePerson(name);
        li.appendChild(removeBtn);
        peopleUl.appendChild(li);
    });
}

// --- Availability Section ---
const availabilityTable = document.getElementById("availability-table").querySelector("tbody");

function renderAvailability() {
    availabilityTable.innerHTML = "";
    peopleList.forEach(name => {
        const tr = document.createElement("tr");
        const nameTd = document.createElement("td");
        nameTd.textContent = name;
        tr.appendChild(nameTd);

        Object.keys(availability[name]).forEach(day => {
            const td = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = availability[name][day];
            checkbox.onchange = () => {
                availability[name][day] = checkbox.checked;
            };
            td.appendChild(checkbox);
            tr.appendChild(td);
        });

        availabilityTable.appendChild(tr);
    });
}

// --- Kitchen Tasks Section ---
const kitchenTaskInput = document.getElementById("kitchen-task-name");
const kitchenTaskCount = document.getElementById("kitchen-task-count");
const addKitchenTaskBtn = document.getElementById("add-kitchen-task-btn");
const kitchenTaskTable = document.getElementById("kitchen-task-table").querySelector("tbody");

addKitchenTaskBtn.addEventListener("click", () => {
    const name = kitchenTaskInput.value.trim();
    const count = parseInt(kitchenTaskCount.value) || 1;
    if (name) {
        const task = { name, count, days: { Mon:true,Tue:true,Wed:true,Thu:true,Fri:true,Sat:true,Sun:true } };
        kitchenTasks.push(task);
        renderKitchenTasks();
        kitchenTaskInput.value = "";
        kitchenTaskCount.value = 1;
    }
});

function removeKitchenTask(idx) {
    kitchenTasks.splice(idx,1);
    renderKitchenTasks();
}

function renderKitchenTasks() {
    kitchenTaskTable.innerHTML = "";
    kitchenTasks.forEach((task, idx) => {
        const tr = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = task.name;
        tr.appendChild(nameTd);

        const countTd = document.createElement("td");
        const countInput = document.createElement("input");
        countInput.type = "number";
        countInput.value = task.count;
        countInput.min = 1;
        countInput.onchange = () => { task.count = parseInt(countInput.value) || 1; };
        countTd.appendChild(countInput);
        tr.appendChild(countTd);

        const daysTd = document.createElement("td");
        Object.keys(task.days).forEach(day => {
            const label = document.createElement("label");
            label.style.marginRight = "5px";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = task.days[day];
            cb.onchange = () => { task.days[day] = cb.checked; };
            label.appendChild(cb);
            label.appendChild(document.createTextNode(day[0]));
            daysTd.appendChild(label);
        });
        tr.appendChild(daysTd);

        const removeTd = document.createElement("td");
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "remove-btn";
        removeBtn.onclick = () => removeKitchenTask(idx);
        removeTd.appendChild(removeBtn);
        tr.appendChild(removeTd);

        kitchenTaskTable.appendChild(tr);
    });
}

// --- Work Tasks Section ---
const workTaskInput = document.getElementById("work-task-name");
const workTaskCount = document.getElementById("work-task-count");
const addWorkTaskBtn = document.getElementById("add-work-task-btn");
const workTaskTable = document.getElementById("work-task-table").querySelector("tbody");

addWorkTaskBtn.addEventListener("click", () => {
    const name = workTaskInput.value.trim();
    const count = parseInt(workTaskCount.value) || 1;
    if (name) {
        const task = { name, count, days: { Mon:true,Tue:true,Wed:true,Thu:true,Fri:true,Sat:true,Sun:true } };
        workTasks.push(task);
        renderWorkTasks();
        workTaskInput.value = "";
        workTaskCount.value = 1;
    }
});

function removeWorkTask(idx) {
    workTasks.splice(idx,1);
    renderWorkTasks();
}

function renderWorkTasks() {
    workTaskTable.innerHTML = "";
    workTasks.forEach((task, idx) => {
        const tr = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = task.name;
        tr.appendChild(nameTd);

        const countTd = document.createElement("td");
        const countInput = document.createElement("input");
        countInput.type = "number";
        countInput.value = task.count;
        countInput.min = 1;
        countInput.onchange = () => { task.count = parseInt(countInput.value) || 1; };
        countTd.appendChild(countInput);
        tr.appendChild(countTd);

        const daysTd = document.createElement("td");
        Object.keys(task.days).forEach(day => {
            const label = document.createElement("label");
            label.style.marginRight = "5px";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = task.days[day];
            cb.onchange = () => { task.days[day] = cb.checked; };
            label.appendChild(cb);
            label.appendChild(document.createTextNode(day[0]));
            daysTd.appendChild(label);
        });
        tr.appendChild(daysTd);

        const removeTd = document.createElement("td");
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "remove-btn";
        removeBtn.onclick = () => removeWorkTask(idx);
        removeTd.appendChild(removeBtn);
        tr.appendChild(removeTd);

        workTaskTable.appendChild(tr);
    });
}

// --- Schedule Generation ---
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const kitchenScheduleTable = document.getElementById("kitchen-schedule-table");
const workScheduleTable = document.getElementById("work-schedule-table");

generateBtn.addEventListener("click", () => {
    generateSchedule();
});

clearBtn.addEventListener("click", () => {
    kitchenScheduleTable.innerHTML = "";
    workScheduleTable.innerHTML = "";
});

function generateSchedule() {
    kitchenScheduleTable.innerHTML = "";
    workScheduleTable.innerHTML = "";

    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

    // --- Kitchen Schedule ---
    const kHead = kitchenScheduleTable.createTHead();
    const kHeadRow = kHead.insertRow();
    kHeadRow.insertCell().textContent = "Day";
    peopleList.forEach(name => kHeadRow.insertCell().textContent = name);

    const kBody = kitchenScheduleTable.createTBody();
    days.forEach(day => {
        const row = kBody.insertRow();
        row.insertCell().textContent = day;
        peopleList.forEach(name => {
            const cell = row.insertCell();
            cell.textContent = "";
        });
    });

    // --- Work Duties Schedule ---
    const wHead = workScheduleTable.createTHead();
    const wHeadRow = wHead.insertRow();
    wHeadRow.insertCell().textContent = "Day";
    peopleList.forEach(name => wHeadRow.insertCell().textContent = name);

    const wBody = workScheduleTable.createTBody();
    days.forEach(day => {
        const row = wBody.insertRow();
        row.insertCell().textContent = day;
        peopleList.forEach(name => {
            const cell = row.insertCell();
            cell.textContent = "";
        });
    });

    // --- Distribute Kitchen Tasks ---
    kitchenTasks.forEach(task => {
        days.forEach(day => {
            if(task.days[day]) {
                const availablePeople = peopleList.filter(p => availability[p][day]);
                for(let i=0;i<task.count;i++) {
                    const p = availablePeople[i % availablePeople.length];
                    const row = Array.from(kBody.rows).find(r=>r.cells[0].textContent===day);
                    const cellIdx = peopleList.indexOf(p)+1;
                    row.cells[cellIdx].textContent += (row.cells[cellIdx].textContent ? ", ":"") + task.name;
                }
            }
        });
    });

    // --- Distribute Work Tasks ---
    workTasks.forEach(task => {
        days.forEach(day => {
            if(task.days[day]) {
                const availablePeople = peopleList.filter(p => availability[p][day]);
                for(let i=0;i<task.count;i++) {
                    const p = availablePeople[i % availablePeople.length];
                    const row = Array.from(wBody.rows).find(r=>r.cells[0].textContent===day);
                    const cellIdx = peopleList.indexOf(p)+1;
                    row.cells[cellIdx].textContent += (row.cells[cellIdx].textContent ? ", ":"") + task.name;
                }
            }
        });
    });
}
