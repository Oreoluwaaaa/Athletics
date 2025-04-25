// import data
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
  
  //teams data maps
  const teams = {
    mbb: {
      label: 'MBB',
      opponents: {
        elizabeth: elizMbb,
        bowie: bowieMbb,
        shaw: shawMbb,
        fayette: fayetteMbb,
        winston: winstonMbb,
        livingstone: livingstoneMbb,
        johnson: johnsonMbb
      }
    },
    wbb: {
      label: 'WBB',
      opponents: {
        elizabeth: elizWbb,
        bowie: bowieWbb,
        shaw: shawWbb,
        fayette: fayetteWbb,
        winston: winstonWbb,
        livingstone: livingstoneWbb,
        johnson: johnsonWbb
      }
    }
  };
  
  // buttons
  const mbbBtn = document.getElementById('mbbBtn');
  const wbbBtn = document.getElementById('wbbBtn');
  const opponentSelect = document.getElementById('opponentSelect');
  const entryLink = document.getElementById('entryLink');
  const viewerLink = document.getElementById('viewerLink');
  
  let selectedTeam = 'mbb';
  let selectedOpp  = Object.keys(teams.mbb.opponents)[0];
  
  function populateOpponents() {
    opponentSelect.innerHTML = '';
    Object.entries(teams[selectedTeam].opponents).forEach(([key, _]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      opponentSelect.appendChild(opt);
    });
  }
  
  function updateLinks() {
    const sessionCode = Date.now().toString();
    localStorage.setItem('lastSessionCode', sessionCode);
    const params = new URLSearchParams({
      team: selectedTeam,
      opponent: selectedOpp,
      sessionCode
    });
    entryLink.href  = `entry.html?${params}`;
    viewerLink.href = `viewer.html?${params}`;
  }
  
  mbbBtn.addEventListener('click', () => {
    selectedTeam = 'mbb';
    mbbBtn.classList.add('active');
    wbbBtn.classList.remove('active');
    populateOpponents();
    updateLinks();
  });
  
  wbbBtn.addEventListener('click', () => {
    selectedTeam = 'wbb';
    wbbBtn.classList.add('active');
    mbbBtn.classList.remove('active');
    populateOpponents();
    updateLinks();
  });
  
  opponentSelect.addEventListener('change', () => {
    selectedOpp = opponentSelect.value;
    updateLinks();
  });
  
  // initialize
  populateOpponents();
  updateLinks();
  