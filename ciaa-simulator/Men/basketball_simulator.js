// basketball_simulator.js
import {
  playersData,
  shawPlayersData,
  elizabethPlayersData,
  bowiePlayersData,
  fayettePlayersData,
  winstonPlayersData,
  livingstonePlayersData,
  johnsonPlayersData,
  augustinePlayersData,
  virginiaPlayersData,
  lincolnPlayersData
} from './data.js';

class BasketballTeam {
  constructor(teamName, playerData) {
    this.teamName = teamName;
    this.playerData = playerData;
    this.selectedPlayers = [];
  }

  static fromPredefinedData(teamName, dataModule) {
    return new BasketballTeam(teamName, dataModule);
  }
}

class BasketballSimulator {
  constructor() {
    // claflin players' data
    this.teams = {
      claflin: new BasketballTeam("Claflin University", playersData),
      rival: null
    };

    this.simulationSettings = {
      TOTAL_PLAYS: 65,
      SIMULATION_RUNS: 10,
      MAX_PLAYERS: 5
    };

    this.initializeUI();
  }

  // convert a value to a number with a fallback.
  static safeNumber(val, fallback = 0) {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  }

  // parse a percentage string (or number) and return its numeric value.
  static parsePercentage(value) {
    const result = typeof value === 'string'
      ? parseFloat(value.replace('%', ''))
      : Number(value);
    return isNaN(result) ? 0 : result;
  }

  initializeUI() {
    this.cacheDOMElements();
    this.bindEvents();
    this.loadInitialPlayers();
  }

  cacheDOMElements() {
    this.dom = {
      selectTeam: document.querySelector(".select-team"),
      allTeamsDiv: document.querySelector(".all-teams"),
      rivalTeamName: document.querySelector(".rival-team-name"),
      playersContainer: document.querySelector(".players"),
      rivalsContainer: document.querySelector(".rivals"),
      selectedPlayers: document.querySelector(".selected-players"),
      selectedRivals: document.querySelector(".selected-rivals"),
      simulateBtn: document.querySelector(".simulate-btn"),
      claflinStats: document.getElementById("claflin-stats"),
      rivalStats: document.getElementById("rival-stats"),
      claflinPoints: document.getElementById("claflin-points"),
      rivalPoints: document.getElementById("rival-points")
    };
  }

  bindEvents() {
    this.dom.selectTeam.addEventListener("click", this.toggleTeamDropdown.bind(this));
    this.dom.simulateBtn.addEventListener("click", this.runSimulation.bind(this));

    this.dom.allTeamsDiv.addEventListener("click", (event) => {
      const selectedTeamName = event.target.textContent.trim().toLowerCase();

      const teamsDataMap = {
        "shaw university": shawPlayersData,
        "elizabeth city state university": elizabethPlayersData,
        "bowie state university": bowiePlayersData,
        "fayetteville state university": fayettePlayersData,
        "winston-salem state university": winstonPlayersData,
        "livingstone university": livingstonePlayersData,
        "johnson c. smith university": johnsonPlayersData,
        "st. augustine's university": augustinePlayersData,
        "virginia state university": virginiaPlayersData,
        "lincoln university": lincolnPlayersData
      };

      if (teamsDataMap[selectedTeamName]) {
        this.teams.rival = BasketballTeam.fromPredefinedData(
          event.target.textContent.trim(),
          teamsDataMap[selectedTeamName]
        );
        // rival team name in the header and later in the scoreboard.
        this.dom.rivalTeamName.textContent = this.teams.rival.teamName;
        this.loadRivalPlayers();
        this.dom.allTeamsDiv.style.maxHeight = "0px";
      }
    });
  }

  toggleTeamDropdown() {
    if (this.dom.allTeamsDiv.style.maxHeight && this.dom.allTeamsDiv.style.maxHeight !== "0px") {
      this.dom.allTeamsDiv.style.maxHeight = "0px";
    } else {
      this.dom.allTeamsDiv.style.maxHeight = "400px";
    }
  }

  loadInitialPlayers() {
    this.teams.claflin.playerData.forEach(player => {
      this.createPlayerCard(player, this.dom.playersContainer, "claflin");
    });
  }

  loadRivalPlayers() {
    this.dom.rivalsContainer.innerHTML = "";
    this.teams.rival.playerData.forEach(player => {
      this.createPlayerCard(player, this.dom.rivalsContainer, "rival");
    });
  }

  createPlayerCard(playerData, container, teamType) {
    const card = document.createElement("div");
    card.className = `player ${teamType}`;
    card.textContent = playerData["Player"];
    card.dataset.stats = JSON.stringify(playerData);
    card.addEventListener("click", () => this.handlePlayerSelection(card, teamType));
    container.appendChild(card);
  }

  handlePlayerSelection(card, teamType) {
    const selectedContainer = teamType === "claflin" ? this.dom.selectedPlayers : this.dom.selectedRivals;
    const currentContainer = card.parentElement;
    if (currentContainer === selectedContainer) {
      this.moveToOriginalContainer(card, teamType);
      return;
    }
    if (selectedContainer.children.length >= this.simulationSettings.MAX_PLAYERS) {
      alert(`Maximum ${this.simulationSettings.MAX_PLAYERS} players allowed`);
      return;
    }
    selectedContainer.appendChild(card);
  }

  moveToOriginalContainer(card, teamType) {
    const originalContainer = teamType === "claflin" ? this.dom.playersContainer : this.dom.rivalsContainer;
    originalContainer.appendChild(card);
  }

  runSimulation() {
    try {
      this.validateSelections();
      const results = this.calculateAverageResults();
      this.displayResults(results);
    } catch (error) {
      alert(error.message);
    }
  }

  validateSelections() {
    const validateTeam = (container, teamName) => {
      if (container.children.length !== this.simulationSettings.MAX_PLAYERS) {
        throw new Error(`Please select ${this.simulationSettings.MAX_PLAYERS} players for ${teamName}`);
      }
    };
    validateTeam(this.dom.selectedPlayers, "Claflin University");
    validateTeam(this.dom.selectedRivals, "the opposing team");
  }

  calculateAverageResults() {
    let claflinTotal = 0, rivalTotal = 0;
    let playerContributions = {};
    for (let i = 0; i < this.simulationSettings.SIMULATION_RUNS; i++) {
      const claflinResults = this.simulateTeamPerformance(this.dom.selectedPlayers);
      const rivalResults = this.simulateTeamPerformance(this.dom.selectedRivals);
      claflinTotal += claflinResults.totalPoints;
      rivalTotal += rivalResults.totalPoints;
      claflinResults.individualPoints.forEach(({ player, points }) => {
        playerContributions[player] = (playerContributions[player] || 0) + points;
      });
      rivalResults.individualPoints.forEach(({ player, points }) => {
        playerContributions[player] = (playerContributions[player] || 0) + points;
      });
    }
    return {
      claflin: Math.round(claflinTotal / this.simulationSettings.SIMULATION_RUNS),
      rival: Math.round(rivalTotal / this.simulationSettings.SIMULATION_RUNS),
      playerContributions
    };
  }

  // performance score calculation
  simulateTeamPerformance(selectedPlayersContainer) {
    const players = Array.from(selectedPlayersContainer.children)
      .map(card => JSON.parse(card.dataset.stats));

    players.forEach(player => {
      const fg = BasketballSimulator.parsePercentage(player["FG%"]);
      const three = BasketballSimulator.parsePercentage(player["3 FG%"]);
      const ft = BasketballSimulator.parsePercentage(player["FT%"]);
      const astTO = BasketballSimulator.safeNumber(player.Ast, 0) / Math.max(1, BasketballSimulator.safeNumber(player.TO, 1));
      const stlTO = BasketballSimulator.safeNumber(player.Stl, 0) / Math.max(1, BasketballSimulator.safeNumber(player.TO, 1));

      // scale PPP by 100 for comparable weighting.
      const ppp = BasketballSimulator.safeNumber(player.PPP, 0) * 100;

      // base score with chosen weights.
      let baseScore = 0.25 * fg + 0.15 * three + 0.2 * astTO + 0.1 * stlTO + 0.2 * ft + 0.1 * ppp;

      // incorporate usage: weight by Poss relative to average Poss.
      const totalPoss = players.reduce((sum, p) => sum + BasketballSimulator.safeNumber(p.Poss, 1), 0);
      const avgPoss = totalPoss / players.length;
      player.performanceScore = baseScore * ( BasketballSimulator.safeNumber(player.Poss, 1) / avgPoss );
    });

    // compute total score
    const totalScore = players.reduce((sum, player) => sum + player.performanceScore, 0);
    let totalPoints = 0;
    let individualPoints = {};
    players.forEach(player => {
      individualPoints[player["Player"]] = 0;
    });
    for (let i = 0; i < this.simulationSettings.TOTAL_PLAYS; i++) {
      let random = Math.random() * totalScore;
      let selectedPlayer = players[0];
      for (const player of players) {
        random -= player.performanceScore;
        if (random <= 0) {
          selectedPlayer = player;
          break;
        }
      }
      const shotResult = this.simulatePossession(selectedPlayer);
      totalPoints += shotResult.points;
      individualPoints[selectedPlayer["Player"]] += shotResult.points;
    }
    const individualPointsArray = Object.entries(individualPoints)
      .map(([player, points]) => ({ player, points }));
    return { totalPoints: Math.round(totalPoints), individualPoints: individualPointsArray };
  }

  simulatePossession(player) {
    const turnoverRate = BasketballSimulator.parsePercentage(player["TO%"]) / 100;
    if (Math.random() < turnoverRate) {
      return { points: 0 };
    }
    let shotType = "2PT";
    if (player["FG Att"] > 0) {
      const twoPtRatio = BasketballSimulator.safeNumber(player["2 FG Att"], 0) / BasketballSimulator.safeNumber(player["FG Att"], 1);
      shotType = Math.random() < twoPtRatio ? "2PT" : "3PT";
    }
    let points = 0;
    if (shotType === "2PT") {
      if (Math.random() < BasketballSimulator.parsePercentage(player["2 FG%"]) / 100) {
        points = 2;
      }
    } else {
      if (Math.random() < BasketballSimulator.parsePercentage(player["3 FG%"]) / 100) {
        points = 3;
      }
    }
    return { points };
  }

  displayResults(results) {
    // scoreboard table
    const homeCell = document.querySelector("table tr:first-child td:first-child");
    if (homeCell) {
      homeCell.textContent = this.teams.claflin.teamName;
    }
    const rivalCell = document.querySelector("#rival-name");
    if (rivalCell) {
      rivalCell.textContent = this.teams.rival ? this.teams.rival.teamName : "Rival Team";
    }

    this.dom.claflinPoints.textContent = results.claflin;
    this.dom.rivalPoints.textContent = results.rival;
    this.dom.claflinStats.innerHTML = `<h3>${this.teams.claflin.teamName} Player Performance</h3>`;
    this.dom.rivalStats.innerHTML = `<h3>${this.teams.rival ? this.teams.rival.teamName : "Rival Team"} Player Performance</h3>`;
    for (let player in results.playerContributions) {
      let stat = document.createElement("p");
      stat.textContent = `${player}: ${results.playerContributions[player]} points`;
      if (this.teams.claflin.playerData.some(p => p["Player"] === player)) {
        this.dom.claflinStats.appendChild(stat);
      } else {
        this.dom.rivalStats.appendChild(stat);
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new BasketballSimulator();
});
