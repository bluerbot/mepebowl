// FrontDoor Credits

const style = document.createElement('style');
style.textContent = `
    .credits-link {
      margin-top: 18px;
      padding: 6px 12px;
      border: 0;
      background: transparent;
      color: #888;
      font-size: 11px;
      letter-spacing: 1px;
      cursor: pointer;
    }

    #credits-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 10;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(5,8,16,.88);
    }

    .credits-panel {
      width: min(420px, 100%);
      max-height: 80vh;
      overflow-y: auto;
      padding: 26px;
      border: 1px solid #333;
      border-radius: 4px;
      background: #111;
      color: #bbb;
      font-size: 13px;
      line-height: 1.6;
    }

    .credits-panel h2 {
      color: white;
      text-align: center;
    }

    .credits-panel h3 {
      margin: 18px 0 5px;
      color: #00cfe8;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .credits-panel a { color: #00cfe8; }

    .credits-close {
      display: block;
      margin: 22px auto 0;
      padding: 9px 22px;
      background: #191919;
      border: 1px solid #444;
      color: white;
      cursor: pointer;
    }

`;
document.head.appendChild(style);

document.body.insertAdjacentHTML('beforeend', `
  <div id="credits-overlay">
    <div class="credits-panel" role="dialog"
         aria-modal="true" aria-labelledby="credits-title">
      <h2 id="credits-title">CREDITS</h2>

      <h3>Original Bowling Game</h3>
      <p>AHMIM Mohamed</p>
      <p>RAMDANI Ferhat</p>
      <p><a href="https://github.com/bluerbot/pro-bowling-3d"
            target="_blank" rel="noopener noreferrer">
        Pro Bowling 3D source project
      </a></p>

      <h3>Character</h3>
      <p>Mepe character — Mepe token on Solada.fun</p>

      <h3>Technology</h3>
      <p>Three.js · Physijs · Ammo.js · ThreeBSP</p>
      <p>Stats.js — mrdoob</p>
      <p>dat.GUI — Data Arts Team, Google Creative Lab</p>

      <button class="credits-close" id="hide-credits">CLOSE</button>
    </div>
  </div>

`);

    const credits = document.querySelector('#credits-overlay');
    document.querySelector('#show-credits').onclick = () => {
      credits.style.display = 'flex';
    };
    document.querySelector('#hide-credits').onclick = () => {
      credits.style.display = 'none';
    };
    credits.addEventListener('click', event => {
      if (event.target === credits) credits.style.display = 'none';
    });
