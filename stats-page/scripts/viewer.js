// import roster

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
  
  // dots colour
  const colorMap = {
    'CU|true':  '#4CBB17',
    'CU|false': '#f00',
    'OPP|true':'#00f',
    'OPP|false':'#a0f'
  };
  
  const opponentsMap = {
    mbb: {
      elizabeth: elizMbb, bowie: bowieMbb, shaw: shawMbb,
      fayette: fayetteMbb, winston: winstonMbb,
      livingstone: livingstoneMbb, johnson: johnsonMbb
    },
    wbb: {
      elizabeth: elizWbb, bowie: bowieWbb, shaw: shawWbb,
      fayette: fayetteWbb, winston: winstonWbb,
      livingstone: livingstoneWbb, johnson: johnsonWbb
    }
  };
  
  function getParams() {
    const p = new URLSearchParams(window.location.search);
    return {
      team:        p.get('team')        || 'mbb',
      opponent:    p.get('opponent')    || 'elizabeth',

      // fallback to lastSessionCode if none in URL
      sessionCode: p.get('sessionCode') ||  localStorage.getItem('lastSessionCode') || ''
    };
  }
  
  const { team, opponent, sessionCode } = getParams();
  const STORAGE_KEY = `stats_${sessionCode}`;
  const raw = localStorage.getItem(STORAGE_KEY);
  
  if (!raw) {
    document.body.innerHTML = '<p>No data for that session. Go back and start a new one.</p>';
  } else {
    const state = JSON.parse(raw);
  
    // shot chart
    const courtImgEl = document.getElementById('court');     
    const canvas     = document.getElementById('shotChart');   
    const ctx        = canvas.getContext('2d');
  
    function setupCanvas() {
      // match the 400×400 grid used in entry
      canvas.width  = 400;
      canvas.height = 400;
  
      // draw the court background
      ctx.drawImage(courtImgEl, 0, 0, 400, 400);
  
      // draw each shot dot
      state.shots.forEach(s => {
        const key = `${s.side}|${s.made}`;
        ctx.fillStyle = colorMap[key];
        ctx.beginPath();
        ctx.arc(s.x, s.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  
    if (courtImgEl.complete) {
      setupCanvas();
    } else {
      courtImgEl.addEventListener('load', setupCanvas);
    }
  
    // stats summary table
    const cuData  = team === 'mbb' ? mbbPlayers : wbbPlayers;
    const oppData = opponentsMap[team][opponent];
    const tbl     = document.getElementById('statsTable');
  
    // build header row
    const headers = ['Team', '#', 'Name', 'Status', 'FG', 'FGA', 'FG3', 'FG3A', 'FT', 'FTA', 'Paint'];
    const hr = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      hr.appendChild(th);
    });
    tbl.appendChild(hr);
  
    // helper to add rows
    function addRows(label, roster, statsArr) {
      statsArr.forEach((st, i) => {
        const tr = document.createElement('tr');
        // team, number, name
        [
          label,
          roster[i].Player.match(/#(\d+)/)[1],
          roster[i].Player.replace(/^#\d+\s*/, '')
        ].forEach(txt => {
          const td = document.createElement('td');
          td.textContent = txt;
          tr.appendChild(td);
        });
        // stats cells
        ['status','FG','FGA','FG3','FG3A','FT','FTA','Paint'].forEach(key => {
          const td = document.createElement('td');
          if (key === 'status') {
            if (st.status) td.classList.add('status-on');
          } else {
            td.textContent = st[key];
          }
          tr.appendChild(td);
        });
        tbl.appendChild(tr);
      });
    }
  
    const oppLabel = opponent.toUpperCase();
    addRows('CLAFLIN',       cuData,  state.claflinStats);
    addRows(oppLabel,   oppData, state.oppStats);
  }
  