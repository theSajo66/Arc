let view = localStorage.getItem("view") || "calendar";
const today = new Date();

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    renderWeeks(data.trialWeeks);
    renderDecks(data.decks);
    checkNotification(data.trialWeeks);
  });

function setView(v) {
  localStorage.setItem("view", v);
  location.reload();
}

function isCurrentWeek(startDate) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return today >= start && today < end;
}

function getIcon(text) {
  const t = text.toLowerCase();
  if (t.includes("hornet") || t.includes("wasp")) return "🐝";
  if (t.includes("queen") || t.includes("matriarch")) return "👑";
  if (t.includes("rocketeer")) return "🚀";
  if (t.includes("bastion")) return "🛡️";
  if (t.includes("shredder")) return "⚙️";
  if (t.includes("tick")) return "🐜";
  if (t.includes("pop")) return "💥";
  if (t.includes("leaper")) return "🦿";
  if (t.includes("download") || t.includes("data")) return "💾";
  if (t.includes("deliver")) return "📦";
  return "🎯";
}

function renderWeeks(weeks) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  weeks.forEach(week => {
    const current = isCurrentWeek(week.start);
    const div = document.createElement("div");
    div.className = "week" + (current ? " current" : "");

    const start = new Date(week.start).toLocaleDateString("de-DE");
    div.innerHTML = `<h3>Woche ab ${start}</h3>`;

    const ul = document.createElement("ul");
    week.trials.forEach(trial => {
      const li = document.createElement("li");
      li.textContent = `${getIcon(trial)} ${trial}`;
      ul.appendChild(li);
    });

    div.appendChild(ul);
    content.appendChild(div);
  });
}
function checkNotification(weeks) {
  const currentWeek = weeks.find(w => isCurrentWeek(w.start));
  if (!currentWeek) return;

  const key = "notified_" + currentWeek.start;
  if (localStorage.getItem(key)) return;

  if (Notification.permission === "granted") {
    new Notification("Neue ARC Raiders Trials", {
      body: "Die neuen Trials für diese Woche sind jetzt verfügbar."
    });
    localStorage.setItem(key, "true");
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
function getNextReset() {
  const now = new Date();
  const reset = new Date(now);
  reset.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7));
  reset.setHours(0, 0, 0, 0);
  return reset;
}

function updateCountdown() {
  const now = new Date();
  const reset = getNextReset();
  const diff = reset - now;

  if (diff <= 0) {
    document.getElementById("resetTimer").textContent = "jetzt";
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);

  document.getElementById("resetTimer").textContent =
    `${d} Tage ${h} Std ${m} Min`;
}

setInterval(updateCountdown, 60000);
updateCountdown();