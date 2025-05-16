class SensorBarsCard extends HTMLElement {
  setConfig(config) {
    if (!config.bars || !Array.isArray(config.bars)) {
      throw new Error("You need to define 'bars' in your card config");
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass || !this.config) return;
    const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        .card {
          padding: 16px;
        }
        .bar-container {
          background-color: #2f3a3f;
          border-radius: 9999px;
          overflow: hidden;
          height: 12px;
          width: 100%;
          margin: 4px 0 12px;
        }
        .bar-fill {
          height: 100%;
          transition: width 0.4s ease;
          border-radius: 9999px;
        }
        .label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
          color: #ccc;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .icon {
          margin-right: 8px;
        }
        h1 {
          font-size: 18px;
          margin: 0 0 12px;
        }
      </style>
      <ha-card>
        <div class="card">
          ${this.config.title ? `<h1>${this.config.title}</h1>` : ''}
          ${this.config.bars.map(bar => {
            const stateObj = this._hass.states[bar.entity];
            if (!stateObj) {
              return `<div class="label">${bar.name} – entity not found</div>`;
            }

            const raw = parseFloat(stateObj.state);
            const value = isNaN(raw) ? 0 : raw;
            const unit = bar.unit || stateObj.attributes.unit_of_measurement || '';
            const max = bar.max || 100;
            const percent = Math.min((value / max) * 100, 100);
            const color = bar.color_gradient?.find(g => value >= g.from)?.color || "#5cd679";
            const bg = bar.background_color || "#2f3a3f";

            return `
              <div class="label">
                <span>${bar.icon ? `<ha-icon class="icon" icon="${bar.icon}"></ha-icon>` : ''}${bar.name}</span>
                <span>${value}${unit}</span>
              </div>
              <div class="bar-container" style="background-color: ${bg};">
                <div class="bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
              </div>
            `;
          }).join('')}
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return this.config?.bars?.length * 2 + 1;
  }
}

customElements.define('sensor-bars-card', SensorBarsCard);
