// 内联配置
let config = null;

// 主逻辑开始
let currentPageIndex = 0;
let timers = {
  single: { duration: 0, remaining: 0, interval: null },
  pro: { duration: 0, remaining: 0, interval: null },
  con: { duration: 0, remaining: 0, interval: null }
};
let currentRunning = null;
let currentStart = "pro";

const matchTitle = document.getElementById("matchTitle");
const proSide = document.getElementById("proSide");
const conSide = document.getElementById("conSide");
const sectionName = document.getElementById("sectionName");

const test30sBtn = document.getElementById("test30sBtn");
const testOverBtn = document.getElementById("testOverBtn");
test30sBtn.addEventListener("click", () => {
  playBeep(1);
});
testOverBtn.addEventListener("click", () => {
  playBeep(2);
});

const modal = document.getElementById("modal");

const singleTimerBox = document.getElementById("singleTimer");
const singleTime = document.getElementById("singleTime");
const proTimerBox = document.getElementById("proTimer");
const conTimerBox = document.getElementById("conTimer");
const proTime = document.getElementById("proTime");
const conTime = document.getElementById("conTime");
const startPauseBtn = document.querySelector("#startPauseBtn")
const proBtn = document.querySelector("#startProBtn")
const conBtn = document.querySelector("#startConBtn")
const resetBtn = document.getElementById("resetBtn");
const showGuideBtn = document.getElementById("showGuideBtn");
const switchBtn = document.getElementById("switchBtn");

const counting = document.querySelector("#countingHint");
counting.style.fontSize = "1.5em";
counting.style.color = "grey";

const beep = new Audio("assets/beep.mp3");

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

async function playBeep(count) {
  for (let i = 0; i < count; i++) {
    await beep.play();
    await new Promise(resolve => {
      beep.onended = resolve;
    });
  }
}

function disableBtns(btns) {
  btns.forEach(btn => {
    btn.setAttribute("disabled", true);
    btn.style.display = "none";
  });
}

function enableBtns(btns) {
  btns.forEach(btn => {
    btn.removeAttribute("disabled");
    btn.style.display = "block";
  });
}

function renderPage() {
  const page = config.pages[currentPageIndex];
  matchTitle.textContent = config.title;
  proSide.textContent = config.pro;
  conSide.textContent = config.con;
  sectionName.textContent = page.section;

  singleTimerBox.style.display = "none";
  proTimerBox.style.display = "none";
  conTimerBox.style.display = "none";

  disableBtns([test30sBtn, testOverBtn, startPauseBtn, proBtn, conBtn, resetBtn, switchBtn, showGuideBtn])

  if (currentPageIndex === 0) {
    enableBtns([showGuideBtn, test30sBtn, testOverBtn])
  }

  if (page.type === "single") {
    enableBtns([startPauseBtn, resetBtn])
    startPauseBtn.textContent = "启动/暂停 (Space)"
    singleTimerBox.style.display = "block";
    if (timers.single.duration === 0) {
      timers.single.duration = page.duration;
      timers.single.remaining = page.duration;
    }
    updateTimerDisplay("single");
  } else if (page.type === "double") {
    startPauseBtn.textContent = "暂停 (Space)"
    enableBtns([startPauseBtn, resetBtn, proBtn, conBtn, switchBtn])
    proTimerBox.style.display = "block";
    conTimerBox.style.display = "block";
    if (typeof page.duration === "number") {
      page.duration = { pro: page.duration, con: page.duration };
    }
    if (timers.pro.duration === 0) {
      timers.pro.duration = page.duration.pro;
      timers.pro.remaining = page.duration.pro;
    }
    if (timers.con.duration === 0) {
      timers.con.duration = page.duration.con;
      timers.con.remaining = page.duration.con;
    }
    currentStart = page.start || "pro";
    updateTimerDisplay("pro");
    updateTimerDisplay("con");
  } else {
    startPauseBtn.style.display = "none"
    proBtn.style.display = conBtn.style.display = "none"
    
  }
}

function updateTimerDisplay(type) {
  let timeText = formatTime(timers[type].remaining);
  const el = (type === "single") ? singleTime : (type === "pro" ? proTime : conTime);
  el.textContent = timeText;
  el.style.color = timers[type].remaining <= 30 ? "red" : "white";
}

function clearAllIntervals() {
  Object.keys(timers).forEach(k => {
    if (timers[k].interval) clearInterval(timers[k].interval);
    timers[k].interval = null;
  });
  counting.style.display = "none";
  currentRunning = null;
}

function startCountdown(type) {
  if (currentRunning && currentRunning !== type) stopCountdown();
  if (timers[type].remaining <= 0) return;
  currentRunning = type;
  counting.style.display = "block";
  timers[type].interval = setInterval(() => {
    timers[type].remaining--;
    updateTimerDisplay(type);
    if (timers[type].remaining === 30) playBeep(1);
    if (timers[type].remaining <= 0) {
      stopCountdown();
      playBeep(2);
    }
  }, 1000);
}

function stopCountdown() {
  if (currentRunning && timers[currentRunning].interval) {
    clearInterval(timers[currentRunning].interval);
    timers[currentRunning].interval = null;
  }
  currentRunning = null;
  counting.style.display = "none";
}

function toggleStartPause() {
  const page = config.pages[currentPageIndex];
  if (currentRunning) stopCountdown();
  else if (page.type === "single") startCountdown("single");
  else startCountdown(currentRunning || currentStart);
}

function resetTimers() {
  const page = config.pages[currentPageIndex];
  clearAllIntervals();
  if (page.type === "single") {
    timers.single.remaining = timers.single.duration;
    updateTimerDisplay("single");
  } else if (page.type === "double") {
    timers.pro.remaining = timers.pro.duration;
    timers.con.remaining = timers.con.duration;
    updateTimerDisplay("pro");
    updateTimerDisplay("con");
  }
}

document.getElementById("prevBtn").onclick = () => {
  clearAllIntervals();
  currentPageIndex = Math.max(0, currentPageIndex - 1);
  renderPage();
  resetTimers();
};
document.getElementById("nextBtn").onclick = () => {
  clearAllIntervals();
  currentPageIndex = Math.min(config.pages.length - 1, currentPageIndex + 1);
  renderPage();
  resetTimers();
};
document.getElementById("startPauseBtn").onclick = toggleStartPause;
document.getElementById("resetBtn").onclick = resetTimers;
document.getElementById("startProBtn").onclick = () => {
  clearAllIntervals();
  startCountdown("pro");
};
document.getElementById("startConBtn").onclick = () => {
  clearAllIntervals();
  startCountdown("con");
};
document.getElementById("switchBtn").onclick = () => {
  if (currentRunning === "pro") {
    stopCountdown();
    startCountdown("con");
  } else if (currentRunning === "con") {
    stopCountdown();
    startCountdown("pro");
  }
};

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") document.getElementById("prevBtn").click();
  else if (e.key === "ArrowRight") document.getElementById("nextBtn").click();
  else if (e.key === " ") toggleStartPause();
  else if (e.key.toLowerCase() === "r") resetTimers();
  else if (e.key.toLowerCase() === "q") document.getElementById("startProBtn").click();
  else if (e.key.toLowerCase() === "e") document.getElementById("startConBtn").click();
  else if (e.key === "Tab") {
    if (modal.style.display === "block") return;
    e.preventDefault();
    document.getElementById("switchBtn").click();
  }
  else if (e.key === "?") document.getElementById("showGuideBtn").click();
});

window.onload = () => {
  const str = localStorage.getItem("config");
  if (str) {
    try {
      config = JSON.parse(str);
    } catch (e) {}
  }
  if (!config) {
    config = {
      title: "人工智能的发展利大于弊",
      pro: "人工智能的发展利大于弊",
      con: "人工智能的发展弊大于利",
      pages: [
        { type: "none", section: "主持人开场" },
        { type: "single", section: "正方立论", duration: 35 },
        { type: "single", section: "反方立论", duration: 35 },
        { type: "double", section: "自由辩论", duration: { pro: 35, con: 35 }, start: "pro" },
        { type: "single", section: "总结陈词", duration: 35 }
      ]
    }
    alert("未找到保存的配置文件，使用默认配置！")
  }
  showGuideBtn.onclick = function settingsPage() {
    modal.style.display = "block";
    const pageList = [];
    const pageListEl = document.getElementById("settings-pageList");
    const resultBox = document.getElementById("settings-resultBox");

    document.getElementById("settings-pageType").addEventListener("change", function() {
      const val = this.value;
      document.getElementById("settings-singleSettings").style.display = val === "single" ? "block" : "none";
      document.getElementById("settings-doubleSettings").style.display = val === "double" ? "block" : "none";
    });

    function addPage() {
      const type = document.getElementById("settings-pageType").value;
      const section = document.getElementById("settings-sectionName").value;
      let page = { type, section };

      if (type === "single") {
        const duration = parseInt(document.getElementById("settings-singleDuration").value);
        if (!duration) return alert("请输入单计时时长");
        page.duration = duration;
      } else if (type === "double") {
        const pro = parseInt(document.getElementById("settings-proDuration").value);
        const con = parseInt(document.getElementById("settings-conDuration").value);
        const start = document.getElementById("settings-startSide").value;
        if (!pro || !con) return alert("请输入双计时双方时长");
        page.duration = { pro, con };
        page.start = start;
      }

      pageList.push(page);
      updateDisplay();
    }
    document.getElementById("settings-addPage").onclick = addPage;
    document.querySelector("#settings-save").onclick = saveResult;
    resultBox.value = JSON.stringify(config, null, 2);

    function updateDisplay() {
      pageListEl.innerHTML = "";
      pageList.forEach((p, i) => {
        const li = document.createElement("li");
        li.textContent = `[${i+1}] ${p.section} - ${p.type}` + (p.type!=='none'?`(${(typeof p.duration !== 'object') ? p.duration : p.duration.pro + '/' + p.duration.con})`:"");
        pageListEl.appendChild(li);
      });

      const config = {
        title: document.getElementById("settings-matchTitle").value,
        pro: document.getElementById("settings-proSide").value,
        con: document.getElementById("settings-conSide").value,
        pages: pageList
      };

      resultBox.value = JSON.stringify(config, null, 2);
    }

    function saveResult() {
      currentPageIndex = 0;
      config = JSON.parse(resultBox.value);
      localStorage.setItem("config", JSON.stringify(config));
      modal.style.display = "none";
      renderPage();
    }

    resultBox.oninput = function() {
      try {
        let tmpConfig = null;
        if (!resultBox.value) {
          tmpConfig = JSON.stringify(
            {
              title: "",
              pro: "",
              con: "",
              pages: []
            }, null, 2
          )
          resultBox.value = tmpConfig;
        }
        tmpConfig = JSON.parse(resultBox.value);
        pageList.length = 0;
        tmpConfig.pages.forEach(p => pageList.push(p));
        document.getElementById("settings-matchTitle").value = tmpConfig.title;
        document.getElementById("settings-proSide").value = tmpConfig.pro;
        document.getElementById("settings-conSide").value = tmpConfig.con;
        updateDisplay();
      } catch (e) {
        console.error(e);
      }
    }
    resultBox.dispatchEvent(new Event("input"));
  }
  const x = localStorage.getItem("bg");
  if (x) document.querySelector("body").style.backgroundImage = `url(${x})`;
  renderPage();
}
function toBase64() {
  var file = document.querySelector('input[type=file]').files[0];
  var reader = new FileReader();
  reader.onloadend = function () {
    document.querySelector('body').style.backgroundImage = `url(${reader.result})`;
    localStorage.setItem("bg", reader.result);
  }
  if (file) {
    reader.readAsDataURL(file);
  }
}