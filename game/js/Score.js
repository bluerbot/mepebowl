class Scoreboard {
    constructor() {
        this.numPlayers = 2;
        this.numRounds = 10;
        this.gameOverShown = false;
        this.state = {
            t1: this.createEmptyState(),
            t2: this.createEmptyState()
        };
    }

    createEmptyState() {
        return { score: 0, frames: [], currentFrame: 0, currentThrow: 1, finished: false };
    }

    setup(players, rounds) {
        this.numPlayers = players;
        this.numRounds = rounds;
        this.gameOverShown = false;
        this.state.t1 = this.createEmptyState();
        this.state.t2 = this.createEmptyState();
        
        this.state.t1.frames = Array(this.numRounds).fill().map(() => ({ t1: null, t2: null, t3: null, score: null }));
        this.state.t2.frames = Array(this.numRounds).fill().map(() => ({ t1: null, t2: null, t3: null, score: null }));
        
        const renderFrames = (teamId) => {
            let html = '';
            for(let i = 0; i < this.numRounds; i++) {
                let throwsHtml = i === this.numRounds - 1 
                    ? `<div class="throw-box" id="${teamId}-f${i}-t1"></div><div class="throw-box" id="${teamId}-f${i}-t2"></div><div class="throw-box" id="${teamId}-f${i}-t3"></div>`
                    : `<div class="throw-box" id="${teamId}-f${i}-t1"></div><div class="throw-box" id="${teamId}-f${i}-t2"></div>`;
                    
                html += `<div class="frame">
                    <div class="frame-header">${i+1}</div>
                    <div class="frame-throws">${throwsHtml}</div>
                    <div class="frame-score" id="${teamId}-f${i}-score"></div>
                </div>`;
            }
            return html;
        };
        
        document.getElementById('cyan-frames').innerHTML = renderFrames('t1');
        
        if (this.numPlayers === 1) {
            document.getElementById('row-red').style.display = 'none';
            this.state.t2.finished = true;
        } else {
            document.getElementById('row-red').style.display = 'flex';
            document.getElementById('red-frames').innerHTML = renderFrames('t2');
        }
    }

    showBanner(text, typeClass) {
        let banner = document.getElementById('announce-banner');
        let bannerText = document.getElementById('announce-text');
        bannerText.textContent = text;
        bannerText.className = typeClass;
        banner.classList.add('show');
        setTimeout(() => banner.classList.remove('show'), 2000);
    }

    calculateScores(teamKey) {
        let teamState = this.state[teamKey];
        let total = 0;
        
        for(let i = 0; i < this.numRounds; i++) {
            let f = teamState.frames[i];
            if (f.t1 === null) break;
            
            let frameScore = (f.t1 === 'X' ? 10 : f.t1) + 
                             (f.t2 === '/' ? (10 - f.t1) : (f.t2 === 'X' ? 10 : (f.t2 || 0))) + 
                             (f.t3 === 'X' ? 10 : (f.t3 || 0));
            
            if (i < this.numRounds - 1) {
                if (f.t1 === 'X') {
                    let nextF = teamState.frames[i+1];
                    if (nextF.t1 !== null) {
                        frameScore += (nextF.t1 === 'X' ? 10 : nextF.t1);
                        if (nextF.t1 === 'X') {
                            if (i < this.numRounds - 2) {
                                let nextNextF = teamState.frames[i+2];
                                if (nextNextF.t1 !== null) frameScore += (nextNextF.t1 === 'X' ? 10 : nextNextF.t1);
                            } else {
                                if (nextF.t2 !== null) frameScore += (nextF.t2 === 'X' ? 10 : nextF.t2);
                            }
                        } else if (nextF.t2 !== null) {
                            frameScore += (nextF.t2 === '/' ? (10 - nextF.t1) : nextF.t2);
                        }
                    }
                } else if (f.t2 === '/') {
                    let nextF = teamState.frames[i+1];
                    if (nextF.t1 !== null) {
                        frameScore += (nextF.t1 === 'X' ? 10 : nextF.t1);
                    }
                }
            }
            total += frameScore;
            f.score = total;
        }
        teamState.score = total;
    }

    updateUI() {
        let teams = this.numPlayers === 1 ? ['t1'] : ['t1', 't2'];
        teams.forEach(teamKey => {
            let teamState = this.state[teamKey];
            document.getElementById(teamKey === 't1' ? 'cyan-total' : 'red-total').textContent = teamState.score;
            
            for(let i = 0; i < this.numRounds; i++) {
                let f = teamState.frames[i];
                document.getElementById(`${teamKey}-f${i}-t1`).innerHTML = f.t1 !== null ? f.t1 : '';
                document.getElementById(`${teamKey}-f${i}-t2`).innerHTML = f.t2 !== null ? f.t2 : '';
                if (i === this.numRounds - 1) document.getElementById(`${teamKey}-f${i}-t3`).innerHTML = f.t3 !== null ? f.t3 : '';
                document.getElementById(`${teamKey}-f${i}-score`).innerHTML = f.score !== null ? f.score : '';
            }
        });
    }

    handleStrikeOrSpare(f, state, remainingPinsCount, type) {
        if (type === 'strike') {
            f.t1 = 'X';
            this.showBanner('STRIKE!', 'strike-text');
        } else {
            f.t2 = '/';
            this.showBanner('SPARE!', 'spare-text');
        }
        return { action: 'reset' };
    }

    processThrow(team, remainingPinsCount) {
        let teamKey = team === 1 ? 't1' : 't2';
        let teamState = this.state[teamKey];
        
        if (teamState.finished) return { action: 'none' };
        
        let f = teamState.frames[teamState.currentFrame];
        let knockedDown = 10 - remainingPinsCount;
        let result = { action: 'none' };

        if (teamState.currentFrame < this.numRounds - 1) {
            if (teamState.currentThrow === 1) {
                if (knockedDown === 10) {
                    result = this.handleStrikeOrSpare(f, teamState, remainingPinsCount, 'strike');
                    teamState.currentFrame++;
                    teamState.currentThrow = 1;
                } else {
                    f.t1 = knockedDown;
                    teamState.currentThrow = 2;
                    result = { action: 'sweep' };
                }
            } else {
                if (remainingPinsCount === 0) {
                    result = this.handleStrikeOrSpare(f, teamState, remainingPinsCount, 'spare');
                } else {
                    f.t2 = 10 - remainingPinsCount - f.t1;
                    result = { action: 'reset' };
                }
                teamState.currentFrame++;
                teamState.currentThrow = 1;
            }
        } else {
            if (teamState.currentThrow === 1) {
                if (knockedDown === 10) {
                    result = this.handleStrikeOrSpare(f, teamState, remainingPinsCount, 'strike');
                    teamState.currentThrow = 2;
                } else {
                    f.t1 = knockedDown;
                    teamState.currentThrow = 2;
                    result = { action: 'sweep' };
                }
            } else if (teamState.currentThrow === 2) {
                if (f.t1 === 'X') {
                    if (remainingPinsCount === 0) {
                        f.t2 = 'X';
                        this.showBanner('STRIKE!', 'strike-text');
                        result = { action: 'reset' };
                    } else {
                        f.t2 = 10 - remainingPinsCount;
                        result = { action: 'sweep' };
                    }
                    teamState.currentThrow = 3;
                } else {
                    if (remainingPinsCount === 0) {
                        result = this.handleStrikeOrSpare(f, teamState, remainingPinsCount, 'spare');
                        teamState.currentThrow = 3;
                    } else {
                        f.t2 = 10 - remainingPinsCount - f.t1;
                        teamState.finished = true;
                        result = { action: 'end' };
                    }
                }
            } else {
                if (f.t2 === 'X' || f.t2 === '/') {
                    if (remainingPinsCount === 0) f.t3 = 'X';
                    else f.t3 = 10 - remainingPinsCount - (f.t2 === 'X' ? 0 : 10);
                } else {
                    f.t3 = 10 - remainingPinsCount;
                }
                teamState.finished = true;
                result = { action: 'end' };
            }
        }

        this.calculateScores(teamKey);
        this.updateUI();

        let allFinished = (this.numPlayers === 1 && this.state.t1.finished) || 
                          (this.numPlayers === 2 && this.state.t1.finished && this.state.t2.finished);
        
        if (teamState.finished && allFinished && !this.gameOverShown) {
            this.gameOverShown = true;
            setTimeout(() => {
                this.showBanner('GAME OVER!', 'open-text');
                setTimeout(() => {
                    document.getElementById('final-score').textContent = teamState.score;
                    document.getElementById('game-results').style.display = 'flex';
                }, 2200);
            }, 2500);
        }

        return result;
    }
}

let activeScoreboard = new Scoreboard();

function setupScoreboard(players, rounds) {
    activeScoreboard.setup(players, rounds);
}

function processThrow(team, remainingPinsCount) {
    return activeScoreboard.processThrow(team, remainingPinsCount);
}