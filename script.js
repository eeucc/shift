// Raw Data
const GROUP_LEADERS = {
  "Group A": [
    { id: "a1", name: "Meron Zewdie", phone: "+251 91 958 4882", active: true },
    { id: "a2", name: "Samuel Zenebe", phone: "+251 91 283 5731", active: true },
    { id: "a3", name: "Getachew Abeje", phone: "+251 91 919 6506", active: false }
  ],
  "Group B": [
    { id: "b1", name: "Lemma Tadesse", phone: "+251 92 711 2871", active: true },
    { id: "b2", name: "Moera Terfasa", phone: "+251 96 116 2564", active: true },
    { id: "b3", name: "Roman Bekele", phone: "+251 92 904 5713", active: true },
    { id: "b4", name: "Tsion Legesse", phone: "+251 92 192 2978", active: false }
  ],
  "Group C": [
    { id: "c1", name: "Zemenay Seid", phone: "+251 91 366 0589", active: true },
    { id: "c2", name: "Melaku Getachew", phone: "+251 94 069 8357", active: true },
    { id: "c3", name: "Abdurehiman Yimer", phone: "+251 93 403 3815", active: true }
  ],
  "Group D": [
    { id: "d1", name: "Helen Wendosen", phone: "+251 92 256 8557", active: true },
    { id: "d2", name: "Biruk Abebe", phone: "+251 92 323 2872", active: true },
    { id: "d3", name: "Tigist Tsige", phone: "+251 93 559 6268", active: true },
    { id: "d4", name: "Legish Leul", phone: "+251 93 686 2886", active: true }
  ]
};

const SHIFTS = [
  { name: "Morning Shift", window: "07:00 AM - 03:00 PM", key: "morning" },
  { name: "Evening Shift", window: "03:00 PM - 11:00 PM", key: "evening" },
  { name: "Night Shift",   window: "11:00 PM - 07:00 AM", key: "night" }
];

const ROTATION_PATTERN = [
  { morning: "Group B", evening: "Group C", night: "Group D" },
  { morning: "Group A", evening: "Group B", night: "Group C" },
  { morning: "Group D", evening: "Group A", night: "Group B" },
  { morning: "Group C", evening: "Group D", night: "Group A" }
];

const ANCHOR_DATE = new Date("2026-07-30T00:00:00");

// --- theme ---
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const icon = document.getElementById("theme-icon");
  const text = document.getElementById("theme-text");
  if (theme === "light") {
    icon.innerText = "🌙";
    text.innerText = "Dark";
  } else {
    icon.innerText = "☀️";
    text.innerText = "Light";
  }
}

// --- shift logic ---
function getActiveShiftIndex(currentHour) {
  if (currentHour >= 7 && currentHour < 15) return 0;
  if (currentHour >= 15 && currentHour < 23) return 1;
  return 2;
}

function toggleLeaderStatus(groupId, leaderId) {
  const leader = GROUP_LEADERS[groupId].find(l => l.id === leaderId);
  if (leader) {
    leader.active = !leader.active;
    updateDisplay();
  }
}

function updateDisplay() {
  const now = new Date();
  
  document.getElementById("current-time").innerText = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });

  const diffTime = now - ANCHOR_DATE;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const activeShiftIndex = getActiveShiftIndex(now.getHours());
  
  // Active shift calculations
  const currentCycleDay = ((diffDays % ROTATION_PATTERN.length) + ROTATION_PATTERN.length) % ROTATION_PATTERN.length;
  const currentRoster = ROTATION_PATTERN[currentCycleDay];
  const activeShift = SHIFTS[activeShiftIndex];
  const activeGroup = currentRoster[activeShift.key];

  // Upcoming shift calculations
  let upcomingShiftIndex = activeShiftIndex + 1;
  let upcomingCycleDay = currentCycleDay;

  if (upcomingShiftIndex >= 3) {
    upcomingShiftIndex = 0;
    upcomingCycleDay = (currentCycleDay + 1) % ROTATION_PATTERN.length;
  }

  const upcomingRoster = ROTATION_PATTERN[upcomingCycleDay];
  const upcomingShift = SHIFTS[upcomingShiftIndex];
  const upcomingGroup = upcomingRoster[upcomingShift.key];

  // Update UI elements
  document.getElementById("active-group").innerText = activeGroup;
  document.getElementById("shift-name").innerText = activeShift.name;
  document.getElementById("shift-window").innerText = activeShift.window;

  document.getElementById("upcoming-group").innerText = upcomingGroup;
  document.getElementById("upcoming-shift-name").innerText = upcomingShift.name;
  document.getElementById("upcoming-shift-window").innerText = upcomingShift.window;

  const leaders = GROUP_LEADERS[activeGroup] || [];
  const activeCount = leaders.filter(l => l.active).length;
  document.getElementById("active-count-badge").innerText = `(${activeCount}/${leaders.length} Present)`;

  const leadersContainer = document.getElementById("leaders-list");
  leadersContainer.innerHTML = leaders.map(leader => `
    <div class="leader-card ${leader.active ? '' : 'inactive'}">
      <div class="leader-left">
        <input 
          type="checkbox" 
          class="status-toggle" 
          ${leader.active ? 'checked' : ''} 
          title="Toggle attendance status"
          onclick="toggleLeaderStatus('${activeGroup}', '${leader.id}')"
        />
        <span class="leader-name">${leader.name}</span>
      </div>
      <div class="leader-right">
        ${leader.active 
          ? `<span class="leader-phone"><a href="tel:${leader.phone}">📞 ${leader.phone}</a></span>`
          : `<span class="absent-tag">ABSENT / OFF</span>`
        }
      </div>
    </div>
  `).join("");
}

// Initialization
initTheme();
updateDisplay();
setInterval(updateDisplay, 1000);