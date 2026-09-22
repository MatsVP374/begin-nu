import './styles/app.css';

const app = document.getElementById('app');
if (app) {
  app.innerHTML = `
    <div class="topbar"><span class="brand">Begin nu</span><button class="link">Voortgang</button></div>
    <h1>Wat ga je doen?</h1>
    <p>Je hoeft niet te studeren. Alleen te beginnen.</p>
    <label for="inVak">Vak</label>
    <input type="text" id="inVak" autocomplete="off" placeholder="Bijv. Statistiek" />
    <label for="inStep">Allerkleinste eerste stap <span>(iets van 2 minuten)</span></label>
    <input type="text" id="inStep" autocomplete="off" placeholder="Bijv. de pdf van hoofdstuk 3 openen" />
    <div class="actions">
      <button class="primary" id="btnStart" disabled>Begin nu, 2 minuten</button>
      <button class="quiet" id="btnLater">Ik begin straks…</button>
    </div>
  `;
}
