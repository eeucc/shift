let isAdminAuthenticated = false;
const hS = 0x7EA;
  const ADMIN_PIN = hS.toString();

  const GROUP_LEADERS = {
  "Group A": [
    { id: "a1", name: "Meron Zewdie", phone: "+251 91 958 4882", active: true },
    { id: "a2", name: "Samuel Zenebe", phone: "+251 91 283 5731", active: true },
    { id: "a3", name: "Getachew Abeje", phone: "+251 91 919 6506", active: true }
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
  { name: "Evening Shift", window: "03:00 PM - 10:00 PM", key: "evening" },
  { name: "Night Shift",   window: "10:00 PM - 07:00 AM", key: "night" }
];

  const ROTATION_PATTERN = [
  { morning: "Group B", evening: "Group C", night: "Group A" },
  { morning: "Group D", evening: "Group B", night: "Group C" },
  { morning: "Group A", evening: "Group D", night: "Group B" },
  { morning: "Group C", evening: "Group A", night: "Group D" }
];

  const ANCHOR_DATE = new Date("2026-07-30T00:00:00");
  let selectedDate = new Date();

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
    document.getElementById("theme-icon").innerText = theme === "light" ? "🌙" : "☀️";
    document.getElementById("theme-text").innerText = theme === "light" ? "Dark" : "Light";
  }

  /* ADMIN LOCK / UNLOCK SYSTEM */
  function handleAdminAuthClick() {
    if (isAdminAuthenticated) {
      isAdminAuthenticated = false;
      updateAdminButtonState();
      updateDisplay();
    } else {
      document.getElementById("admin-pin-input").value = "";
      document.getElementById("auth-modal").classList.add("open");
      document.getElementById("admin-pin-input").focus();
    }
  }

  function closeAuthModal() {
    document.getElementById("auth-modal").classList.remove("open");
  }

  function verifyAdminPin() {
    const enteredPin = document.getElementById("admin-pin-input").value;
    if (enteredPin === ADMIN_PIN) {
      isAdminAuthenticated = true;
      closeAuthModal();
      updateAdminButtonState();
      updateDisplay();
    } else {
      alert("Invalid Admin PIN!");
    }
  }

  function updateAdminButtonState() {
    const btn = document.getElementById("admin-btn");
    const icon = document.getElementById("admin-icon");
    const text = document.getElementById("admin-text");

    if (isAdminAuthenticated) {
      btn.classList.add("active");
      text.innerText = "Lock Admin";
    } else {
      btn.classList.remove("active");
      text.innerText = "Admin Login";
    }
  }

  function toggleLeaderStatus(groupId, leaderId) {
    if (!isAdminAuthenticated) return;
    const leader = GROUP_LEADERS[groupId].find(l => l.id === leaderId);
    if (leader) {
      leader.active = !leader.active;
      updateDisplay();
    }
  }

  function getActiveShiftIndex(currentHour) {
    if (currentHour >= 7 && currentHour < 15) return 0;
    if (currentHour >= 15 && currentHour < 22) return 1;
    return 2;
  }

  function calculateRosterForDate(targetDate) {
    const dateCopy = new Date(targetDate);
    dateCopy.setHours(0, 0, 0, 0);
    const anchorCopy = new Date(ANCHOR_DATE);
    anchorCopy.setHours(0, 0, 0, 0);

    const diffTime = dateCopy - anchorCopy;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const cycleDay = ((diffDays % ROTATION_PATTERN.length) + ROTATION_PATTERN.length) % ROTATION_PATTERN.length;
    return ROTATION_PATTERN[cycleDay];
  }

  function formatDateToISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function handleDateInputChange(val) {
    if (!val) return;
    const parts = val.split('-');
    selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
    updateLookupDisplay();
  }

  function selectTodayDirectly() {
    selectedDate = new Date();
    document.getElementById("lookup-date-input").value = formatDateToISO(selectedDate);
    updateLookupDisplay();
  }

  function renderPopoverList(groupId, targetElemId) {
    const container = document.getElementById(targetElemId);
    const leaders = GROUP_LEADERS[groupId] || [];
    container.innerHTML = leaders.map(leader => `
      <div class="popover-leader-item">
        <span class="popover-leader-name">${leader.name}</span>
        <a href="tel:${leader.phone}" class="popover-leader-phone">${leader.phone}</a>
      </div>
    `).join("");
  }

  function updateLookupDisplay() {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    document.getElementById("selected-date-label").innerText = isToday ? "Today" : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const lookupRoster = calculateRosterForDate(selectedDate);
    document.getElementById("sched-group-morning").innerText = lookupRoster.morning;
    document.getElementById("sched-group-evening").innerText = lookupRoster.evening;
    document.getElementById("sched-group-night").innerText = lookupRoster.night;

    renderPopoverList(lookupRoster.morning, "pop-list-morning");
    renderPopoverList(lookupRoster.evening, "pop-list-evening");
    renderPopoverList(lookupRoster.night, "pop-list-night");
  }

  function updateDisplay() {
    const now = new Date();

    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    document.getElementById("clock-hours-mins").innerText = `${String(hours).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById("clock-secs").innerText = `:${String(now.getSeconds()).padStart(2, '0')}`;
    document.getElementById("clock-ampm").innerText = ampm;
    document.getElementById("clock-date-full").innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const activeShiftIndex = getActiveShiftIndex(now.getHours());
    const liveRoster = calculateRosterForDate(now);
    const activeShift = SHIFTS[activeShiftIndex];
    const activeGroup = liveRoster[activeShift.key];

    let upcomingShiftIndex = (activeShiftIndex + 1) % 3;
    let upcomingDate = new Date(now);
    if (activeShiftIndex === 2) upcomingDate.setDate(upcomingDate.getDate() + 1);

    const upcomingRoster = calculateRosterForDate(upcomingDate);
    const upcomingShift = SHIFTS[upcomingShiftIndex];

    document.getElementById("active-group").innerText = activeGroup;
    document.getElementById("shift-name").innerText = activeShift.name;
    document.getElementById("shift-window").innerText = activeShift.window;

    document.getElementById("upcoming-group").innerText = upcomingRoster[upcomingShift.key];
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
            ${isAdminAuthenticated ? '' : 'disabled'}
            onclick="toggleLeaderStatus('${activeGroup}', '${leader.id}')"
            title="${isAdminAuthenticated ? 'Click to toggle status' : 'Admin Login required to modify'}"
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

    updateLookupDisplay();
  }

  initTheme();
  document.getElementById("lookup-date-input").value = formatDateToISO(selectedDate);
  updateDisplay();
  setInterval(updateDisplay, 1000);
