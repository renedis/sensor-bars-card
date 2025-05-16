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

    const style = `
      <style>
        .card { padding: 16px; }
        .bar-row {
          margin: 4px 0 12px;
        }
        .bar-container {
          border-radius: 9999px;
          overflow: hidden;
          width: 100%;
          height: 12px;
          background-color: var(--bar-bg-color, #2f3a3f);
        }
        .bar-fill {
          height: 100%;
          transition: width 0.4s ease;
          border-radius: 9999px;
        }
        .label {
          font-size: 14px;
          font-weight: 500;
          color: #ccc;
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .label.left {
          margin-bottom: 0;
          margin-right: 8px;
          width: 150px;
          flex-shrink: 0;
        }
        .bar-row.left {
          display: flex;
          align-items: center;
        }
        h1 {
          font-size: 18px;
          margin: 0 0 12px;
        }
      </style>
    `;

    const barsHtml = this.config.bars.map(bar => {
      const stateObj = this._hass.states[bar.entity];
      if (!stateObj) {
        return `<div class="label">${bar.name} – entity not found</div>`;
      }

      const raw = parseFloat(stateObj.state);
      const value = isNaN(raw) ? 0 : raw;
      const unit = bar.unit || stateObj.attributes.unit_of_measurement || '';
      const max = bar.max || 100;
      const percent = Math.min((value / max) * 100, 100);
      const showValue = bar.show_value !== false;
      const height = bar.height || 12;
      const bg = bar.background_color || "#2f3a3f";

      let color = "#5cd679";
      if (Array.isArray(bar.color_gradient)) {
        const sorted = [...bar.color_gradient].sort((a, b) => b.from - a.from);
        for (const grad of sorted) {
          if (value >= grad.from) {
            color = grad.color;
            break;
          }
        }
      }

      const labelPosition = bar.label_position || "above";

      const labelHtml = labelPosition !== "none" ? `
        <div class="label ${labelPosition === "left" ? "left" : ""}">
          <span>${bar.icon ? `<ha-icon class="icon" icon="${bar.icon}"></ha-icon>` : ''}${bar.name}</span>
          ${showValue ? `<span>${value}${unit}</span>` : ''}
        </div>
      ` : "";

      return `
        <div class="bar-row ${labelPosition === "left" ? "left" : ""}">
          ${labelPosition === "above" ? labelHtml : ""}
          <div class="bar-container" style="background-color: ${bg}; height: ${height}px;">
            <div class="bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
          </div>
          ${labelPosition === "left" ? labelHtml : ""}
        </div>
      `;
    }).join('');

    root.innerHTML = `${style}<ha-card><div class="card">
      ${this.config.title ? `<h1>${this.config.title}</h1>` : ''}
      ${barsHtml}
    </div></ha-card>`;
  }

  getCardSize() {
    return this.config?.bars?.length * 2 + 1;
  }
}

customElements.define('sensor-bars-card', SensorBarsCard);
