import {
    playersData as mbbPlayers, elizabethPlayersData as elizMbb,
    bowiePlayersData as bowieMbb, shawPlayersData as shawMbb,
    fayettePlayersData as fayetteMbb, winstonPlayersData as winstonMbb,
    livingstonePlayersData as livingstoneMbb, johnsonPlayersData as johnsonMbb
  } from './data-mbb.js';
  
  import {
    playersData as wbbPlayers, elizabethPlayersData as elizWbb,
    bowiePlayersData as bowieWbb, shawPlayersData as shawWbb,
    fayettePlayersData as fayetteWbb, winstonPlayersData as winstonWbb,
    livingstonePlayersData as livingstoneWbb, johnsonPlayersData as johnsonWbb
  } from './data-wbb.js';
  
  const historyStack = [];
  
  const colorMap = {
    'CU|true':  '#4CBB17',
    'CU|false': '#f00',
    'OPP|true':'#00f',
    'OPP|false':'#a0f'
  };
  
  const opponentsMap = {
    mbb: { elizabeth: elizMbb, bowie: bowieMbb, shaw: shawMbb, fayette: fayetteMbb, winston: winstonMbb, livingstone: livingstoneMbb, johnson: johnsonMbb },
    wbb: { elizabeth: elizWbb, bowie: bowieWbb, shaw: shawWbb, fayette: fayetteWbb, winston: winstonWbb, livingstone: livingstoneWbb, johnson: johnsonWbb }
  };
  
  function getParams() {
    const p = new URLSearchParams(window.location.search);
    return {
      team:        p.get('team')       || 'mbb',
      opponent:    p.get('opponent')   || 'elizabeth',
      sessionCode: p.get('sessionCode')|| Date.now().toString()
    };
  }
  const { team, opponent, sessionCode } = getParams();
  const tablesH2 = document.querySelectorAll('.tables h2');
  if (tablesH2[1]) {
    tablesH2[1].textContent = opponent.toUpperCase();
   }
  const claflinData  = team === 'mbb' ? mbbPlayers : wbbPlayers;
  const opponentData = opponentsMap[team][opponent];
  
  const STORAGE_KEY = `stats_${sessionCode}`;
  
  function emptyStats() {
    return { status:false, FG:0, FGA:0, FG3:0, FG3A:0, FT:0, FTA:0, Paint:0 };
  }
  
  let state = (() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return {
      claflinStats: claflinData.map(emptyStats),
      oppStats:     opponentData.map(emptyStats),
      shots:        []
    };
  })();
  
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  
  const courtImg = document.getElementById('court');
  const canvas   = document.getElementById('shotChart');
  const ctx      = canvas.getContext('2d');
  
  function drawShot(s) {
    ctx.fillStyle = colorMap[`${s.side}|${s.made}`];
    ctx.beginPath();
    ctx.arc(s.x, s.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  function buildTable(containerId, roster, statsArray, side) {
    const cont = document.getElementById(containerId);
    const tbl  = document.createElement('table');
    tbl.className = 'stats-table';
  
    const hdr = ['#','Name','Status','FG','FGA','FG3','FG3A','FT','FTA','Paint'];
    const hrow = document.createElement('tr');
    hdr.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      hrow.appendChild(th);
    });
    tbl.appendChild(hrow);
  
    roster.forEach((p, i) => {
      const tr = document.createElement('tr');
      // jersey #
      const num = document.createElement('td');
      num.textContent = p.Player.match(/#(\d+)/)[1];
      // name
      const nm = document.createElement('td');
      nm.textContent = p.Player.replace(/^#\d+\s*/, '');
      tr.append(num, nm);
  
      // status (max 5 per team)
      const st = document.createElement('td');
      st.className = 'clickableStats';
      if (statsArray[i].status) st.classList.add('status-on');
      st.addEventListener('click', () => {
        const activeCount = statsArray.filter(s => s.status).length;
        if (!statsArray[i].status && activeCount >= 5) {
          return alert('Maximum of 5 active statuses allowed');
        }
        statsArray[i].status = !statsArray[i].status;
        if (statsArray[i].status) st.classList.add('status-on');
        else st.classList.remove('status-on');
        save();
      });
      tr.appendChild(st);
  
      // other stats
      ['FG','FGA','FG3','FG3A','FT','FTA','Paint'].forEach(stat => {
        const td = document.createElement('td');
        if (['FG','FG3','FT'].includes(stat)) {
          // ✓ / ✗
          const mk = document.createElement('span');
          mk.classList.add('addShot','tick');
          mk.textContent = '✓';
          mk.addEventListener('click', () => startShot(i, stat, true, side));
  
          const ms = document.createElement('span');
          ms.classList.add('addShot','miss');
          ms.textContent = '✗';
          ms.addEventListener('click', () => startShot(i, stat, false, side));
  
          const br = document.createElement('br');
          const ct = document.createElement('span');
          ct.className = 'count';
          ct.textContent = statsArray[i][stat];
  
          td.append(mk, ms, br, ct);
  
        } else if (['FGA','FG3A','FTA'].includes(stat)) {
          // passive attempt count
          td.textContent = statsArray[i][stat];
  
        } else {
          // paint increment on click
          td.className = 'clickableStats';
          td.textContent = statsArray[i][stat];
          td.addEventListener('click', () => {
            statsArray[i][stat]++;
            td.textContent = statsArray[i][stat];
            save();
          });
        }
        tr.appendChild(td);
      });
  
      tbl.appendChild(tr);
    });
  
    cont.innerHTML = '';
    cont.appendChild(tbl);
  }
  
  // initial render
  buildTable('cuTableContainer',  claflinData,  state.claflinStats, 'CU');
  buildTable('oppTableContainer', opponentData, state.oppStats,    'OPP');
  
  courtImg.onload = () => {
    ctx.drawImage(courtImg, 0, 0, canvas.width, canvas.height);
    state.shots.forEach(drawShot);
  };
  
  let pending = null;
  function startShot(idx, stat, made, side) {
    pending = { idx, stat, made, side };
    canvas.style.cursor = 'crosshair';
  }
  
  canvas.addEventListener('click', e => {
    if (!pending) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
  
    // draw and record shot
    drawShot({ x, y, ...pending });
    historyStack.push({ type:'shot', data:{ ...pending, x, y } });
  
    // update stats
    const arr = pending.side==='CU'
      ? state.claflinStats
      : state.oppStats;
    if (pending.made) arr[pending.idx][pending.stat]++;
    const attKey = pending.stat==='FG' ? 'FGA'
                  : pending.stat==='FG3'? 'FG3A'
                  : 'FTA';
    arr[pending.idx][attKey]++;
    save();
  
    // refresh UI
    buildTable('cuTableContainer',  claflinData,  state.claflinStats, 'CU');
    buildTable('oppTableContainer', opponentData, state.oppStats,    'OPP');
    state.shots.push({ ...pending, x, y });
    save();
  
    pending = null;
    canvas.style.cursor = 'default';
  });
  
  // undo button
  const undoBtn = document.getElementById('undoBtn');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      const last = historyStack.pop();
      if (!last || last.type !== 'shot') {
        return alert('Nothing to undo');
      }
      const { idx, stat, made, side } = last.data;
      state.shots.pop();
      const arr = side==='CU'
        ? state.claflinStats
        : state.oppStats;
      if (made) arr[idx][stat]--;
      const attKey = stat==='FG' ? 'FGA'
                    : stat==='FG3'? 'FG3A'
                    : 'FTA';
      arr[idx][attKey]--;
      save();
  
      // redraw
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(courtImg,0,0,canvas.width,canvas.height);
      state.shots.forEach(drawShot);
      buildTable('cuTableContainer',  claflinData,  state.claflinStats, 'CU');
      buildTable('oppTableContainer', opponentData, state.oppStats,    'OPP');
    });
  }
  