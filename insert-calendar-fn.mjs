import { readFileSync, writeFileSync } from 'fs';

const html = readFileSync('scarlett-v4-dashboard.html', 'utf8');

const insertPoint = html.indexOf('/* ---- Approvals → #approvalsList ----');

const monthFunctions = `
/* ---- Month view ---- */
let _calMonthOffset = 0;
function renderMonthView(){
  const calData = window._lastCalData || [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + _calMonthOffset;
  const container = document.getElementById("calendarMonth");
  if(!container) return;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const monthName = firstDay.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const eventsByDate = {};
  calData.forEach(ev => {
    const d = new Date(ev.start_time);
    const key = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
    if(!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  });
  const todayStr = new Date().toDateString();
  let h = "<div class=\\"cal-month-header\\"><div class=\\"cal-month-nav\\"><button onclick=\\"monthNav(-1)\\">‹</button><button onclick=\\"monthNav(1)\\">›</button></div><h3>" + monthName + "</h3><div></div></div>";
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function(d) {
    h += "<div style=\\"text-align:center;font-size:10px;font-weight:600;color:var(--muted);padding:6px 0;background:var(--paper);border-bottom:1px solid var(--line)\\">" + d + "</div>";
  });
  for(var i=startDow-1; i>=0; i--){
    var pd = prevMonthDays - i;
    h += "<div class=\\"cal-month-day other-month\\"><span class=\\"day-num\\">" + pd + "</span></div>";
  }
  for(var d=1; d<=daysInMonth; d++){
    var dateObj = new Date(year, month, d);
    var isToday = dateObj.toDateString() === todayStr;
    var key = year + "-" + (month+1) + "-" + d;
    var evts = eventsByDate[key] || [];
    var cls = "cal-month-day";
    if(isToday) cls += " today";
    h += "<div class=\\"" + cls + "\\"><span class=\\"day-num\\">" + d + "</span>";
    for(var ei=0; ei<evts.length && ei<3; ei++){
      var ev = evts[ei];
      h += "<div class=\\"cal-evt-title\\" onclick=\\"editCalendarEvent(" + ev.id + ")\\"><span class=\\"cal-dot\\" style=\\"background:" + (ev.color||"#ff6600") + "\\"></span>" + esc(ev.title) + "</div>";
    }
    if(evts.length > 3) h += "<div style=\\"font-size:9px;color:var(--faint)\\">+" + (evts.length-3) + " more</div>";
    h += "</div>";
  }
  var totalCells = startDow + daysInMonth;
  var remaining = (7 - (totalCells % 7)) % 7;
  for(var ri=1; ri<=remaining; ri++){
    h += "<div class=\\"cal-month-day other-month\\"><span class=\\"day-num\\">" + ri + "</span></div>";
  }
  container.innerHTML = h;
}
function monthNav(dir){ _calMonthOffset += dir; renderMonthView(); }

/* ---- Calendar view toggle ---- */
var _calView = "list";
function setCalView(view){
  _calView = view;
  var listBtn = document.getElementById("calViewListBtn");
  var monthBtn = document.getElementById("calViewMonthBtn");
  if(listBtn) listBtn.classList.toggle("active", view==="list");
  if(monthBtn) monthBtn.classList.toggle("active", view==="month");
  var listEl = document.getElementById("calendarList");
  if(listEl) listEl.style.display = view==="list" ? "" : "none";
  var monthEl = document.getElementById("calendarMonth");
  if(monthEl) monthEl.style.display = view==="month" ? "grid" : "none";
  if(view==="month") renderMonthView();
}

`;

const newHtml = html.slice(0, insertPoint) + monthFunctions + html.slice(insertPoint);
writeFileSync('scarlett-v4-dashboard.html', newHtml);
console.log('Inserted functions. File now', newHtml.length, 'bytes');
