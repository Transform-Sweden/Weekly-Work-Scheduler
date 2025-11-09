console.log("Scheduler Version 1.3.0 - Balanced Kitchen + Reset Fix");

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let people = JSON.parse(localStorage.getItem("people")) || [];
let kitchenTasks = JSON.parse(localStorage.getItem("kitchenTasks")) || [];
let workTasks = JSON.parse(localStorage.getItem("workTasks")) || [];

/* ---------- SAVE & RENDER ---------- */
function saveData() {
  localStorage.setItem("people", JSON.stringify(people));
  localStorage.setItem("kitchenTasks", JSON.stringify(kitchenTasks));
  localStorage.setItem("workTasks", JSON.stringify(workTasks));
}

function renderPeople() {
  const list = document.getElementById("people-list");
  list.innerHTML = "";
  people.forEach((p, idx) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.gender}) `;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.className = "remove-btn";
    btn.onclick = () => {
      people.splice(idx, 1);
      saveData();
      renderPeople();
      renderAvailability();
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderKitchenTasks() {
  const tbody = document.querySelector("#kitchen-task-table tbody");
  tbody.innerHTML = "";
  kitchenTasks.forEach((task, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${task.name}</td>
      <td>${task.count}</td>
      <td>
        ${days
          .map(
            (d) =>
              `<label><input type="checkbox" data-day="${d}" ${
                task.days.includes(d) ? "checked" : ""
              }> ${d}</label>`
          )
          .join(" ")}
      </td>
      <td><button class="remove-btn">Remove</button></td>
    `;
    tr.querySelectorAll("input[type=checkbox]").forEach((chk) => {
      chk.addEventListener("change", () => {
        const d = chk.dataset.day;
        if (chk.checked) {
          if (!task.days.includes(d)) task.days.push(d);
        } else {
          task.days = task.days.filter((x) => x !== d);
        }
        saveData();
      });
    });
    tr.querySelector(".remove-btn").addEventListener("click", () => {
      kitchenTasks.splice(idx, 1);
      saveData();
      renderKitchenTasks();
    });
    tbody.appendChild(tr);
  });
}

function renderWorkTasks() {
  const tbody = document.querySelector("#work-task-table tbody");
  tbody.innerHTML = "";
  workTasks.forEach((task, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${task.name}</td>
      <td>${task.count}</td>
      <td>
        ${days
          .map(
            (d) =>
              `<label><input type="checkbox" data-day="${d}" ${
                task.days.includes(d) ? "checked" : ""
              }> ${d}</label>`
          )
          .join(" ")}
      </td>
      <td><button class="remove-btn">Remove</button></td>
    `;
    tr.querySelectorAll("input[type=checkbox]").forEach((chk) => {
      chk.addEventListener("change", () => {
        const d = chk.dataset.day;
        if (chk.checked) {
          if (!task.days.includes(d)) task.days.push(d);
        } else {
          task.days = task.days.filter((x) => x !== d);
        }
        saveData();
      });
    });
    tr.querySelector(".remove-btn").addEventListener("click", () => {
      workTasks.splice(idx, 1);
      saveData();
      renderWorkTasks();
    });
    tbody.appendChild(tr);
  });
}

/* ---------- ADD BUTTONS ---------- */
document.getElementById("add-person-btn").onclick = () => {
  const name = document.getElementById("person-name").value.trim();
  const gender = document.getElementById("person-gender").value;
  if (!name) return alert("Enter a name.");
  people.push({ name, gender });
  document.getElementById("person-name").value = "";
  saveData();
  renderPeople();
  renderAvailability();
};

document.getElementById("add-kitchen-task-btn").onclick = () => {
  const name = document.getElementById("kitchen-task-name").value.trim();
  const count = parseInt(document.getElementById("kitchen-task-count").value);
  if (!name) return alert("Enter a task name.");
  kitchenTasks.push({ name, count, days: [...days] });
  document.getElementById("kitchen-task-name").value = "";
  saveData();
  renderKitchenTasks();
};

document.getElementById("add-work-task-btn").onclick = () => {
  const name = document.getElementById("work-task-name").value.trim();
  const count = parseInt(document.getElementById("work-task-count").value);
  const gender = document.getElementById("work-task-gender").value;
  if (!name) return alert("Enter a task name.");
  workTasks.push({ name, count, gender, days: [...days] });
  document.getElementById("work-task-name").value = "";
  saveData();
  renderWorkTasks();
};

/* ---------- AVAILABILITY ---------- */
function renderAvailability() {
  const tbody = document.querySelector("#availability-table tbody");
  tbody.innerHTML = "";
  people.forEach((p) => {
    ["Kitchen", "Work"].forEach((type) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${p.name}</td><td>${type}</td>`;
      days.forEach((d) => {
        const td = document.createElement("td");
        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.checked = true;
        chk.dataset.name = p.name;
        chk.dataset.type = type;
        chk.dataset.day = d;
        chk.addEventListener("change", (e) => {
          // Connect Lunch Dishes ↔ Work Duties
          if (type === "Kitchen" && kitchenTasks.some(t=>t.name.toLowerCase().includes("lunch"))) {
            const workChk = tbody.querySelector(
              `input[data-name="${p.name}"][data-type="Work"][data-day="${d}"]`
            );
            if (workChk) workChk.checked = chk.checked;
          }
          if (type === "Work" && kitchenTasks.some(t=>t.name.toLowerCase().includes("lunch"))) {
            const kitchenChk = tbody.querySelector(
              `input[data-name="${p.name}"][data-type="Kitchen"][data-day="${d}"]`
            );
            if (kitchenChk) kitchenChk.checked = chk.checked;
          }
        });
        td.appendChild(chk);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  });
}

/* ---------- GENERATE SCHEDULE ---------- */
document.getElementById("generate-btn").onclick = generateSchedule;
document.getElementById("clear-btn").onclick = () => {
  document.querySelector("#kitchen-schedule-table").innerHTML = "";
  document.querySelector("#work-schedule-table").innerHTML = "";
};

function generateSchedule() {
  generateKitchenSchedule();
  generateWorkSchedule();
}

function generateKitchenSchedule() {
  const table = document.getElementById("kitchen-schedule-table");
  table.innerHTML = "";
  const head = table.createTHead();
  const hRow = head.insertRow();
  hRow.innerHTML = `<th>Day</th><th>Task</th>${people
    .map((p) => `<th>${p.name}</th>`)
    .join("")}`;
  const body = table.createTBody();

  const load = Object.fromEntries(people.map((p) => [p.name, 0]));

  days.forEach((day) => {
    const dayTasks = kitchenTasks.filter((t) => t.days.includes(day));
    const assignedToday = new Set();
    dayTasks.forEach((t, idx) => {
      const row = body.insertRow();
      if (idx === 0) {
        const dCell = row.insertCell();
        dCell.textContent = day;
        dCell.rowSpan = dayTasks.length;
      }
      const taskCell = row.insertCell();
      taskCell.textContent = t.name;

      people.forEach((p) => {
        const td = row.insertCell();
        td.classList.add("kitchen-task");
        td.textContent = "";
      });

      const eligible = people.filter((p) => !assignedToday.has(p.name));
      eligible.sort(
        (a, b) => load[a.name] - load[b.name] || Math.random() - 0.5
      );
      const chosen = eligible.slice(0, Math.min(t.count, eligible.length));
      chosen.forEach((p) => {
        const index = people.findIndex((x) => x.name === p.name);
        row.cells[index + 2].textContent = "✔️";
        load[p.name]++;
        assignedToday.add(p.name);
      });
    });
  });
}

function generateWorkSchedule() {
  const table = document.getElementById("work-schedule-table");
  table.innerHTML = "";
  const head = table.createTHead();
  const hRow = head.insertRow();
  hRow.innerHTML = `<th>Day</th><th>Task</th>${people
    .map((p) => `<th>${p.name}</th>`)
    .join("")}`;
  const body = table.createTBody();

  const load = Object.fromEntries(people.map((p) => [p.name, 0]));

  days.forEach((day) => {
    const dayTasks = workTasks.filter((t) => t.days.includes(day));
    const assignedToday = new Set();
    dayTasks.forEach((t, idx) => {
      const row = body.insertRow();
      if (idx === 0) {
        const dCell = row.insertCell();
        dCell.textContent = day;
        dCell.rowSpan = dayTasks.length;
      }
      const taskCell = row.insertCell();
      taskCell.textContent = t.name;

      people.forEach((p) => {
        const td = row.insertCell();
        td.classList.add("work-task");
        td.textContent = "";
      });

      let eligible = people.filter(
        (p) =>
          !assignedToday.has(p.name) &&
          (t.gender === "Any" || t.gender === p.gender)
      );
      eligible.sort(
        (a, b) => load[a.name] - load[b.name] || Math.random() - 0.5
      );
      const chosen = eligible.slice(0, Math.min(t.count, eligible.length));
      chosen.forEach((p) => {
        const index = people.findIndex((x) => x.name === p.name);
        row.cells[index + 2].textContent = "✔️";
        load[p.name]++;
        assignedToday.add(p.name);
      });
    });
  });
}

/* ---------- RESET ALL (bottom box) ---------- */
const resetSection = document.createElement("section");
resetSection.style.background = "#fff8e1";
resetSection.style.border = "2px solid #ffeb3b";
resetSection.style.borderRadius = "8px";
resetSection.style.padding = "10px";
resetSection.style.marginTop = "20px";
resetSection.innerHTML = `
  <h3 style="color:#ff6f00;">⚠️ Reset All Data</h3>
  <p>This will permanently clear all names, tasks, and schedules.</p>
  <button id="reset-all-btn" style="background:#ff9800;">Reset All</button>
`;
document.body.appendChild(resetSection);

document.getElementById("reset-all-btn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear everything?")) {
    localStorage.clear();
    location.reload();
  }
});

/* ---------- INIT ---------- */
renderPeople();
renderKitchenTasks();
renderWorkTasks();
renderAvailability();
