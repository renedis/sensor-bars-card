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
        }
        .label-value-above-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          width: 100%;
        }
        .label.left {
          width: 150px;
          flex-shrink: 0;
        }
        .value {
          font-size: 14px;
          font-weight: 500;
          color: #ccc;
          flex-shrink: 0;
          min-width: 50px;
          text-align: right;
        }
        .bar-row.left {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bar-row.left .bar-container {
          flex-grow: 1;
          margin: 0 12px;
        }
        .bar-row.vertical-stack {
          display: flex;
          flex-direction: column;
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
      const valuePosition = bar.value_position || "right";

      // Special fix: label left + value above → show label & value side-by-side above bar
      if (labelPosition === "left" && valuePosition === "above") {
        return `
          <div class="bar-row vertical-stack">
            <div class="label-value-above-row">
              <div class="label left">
                ${bar.icon ? `<ha-icon class="icon" icon="${bar.icon}"></ha-icon>` : ''}
                <span>${bar.name}</span>
              </div>
              ${showValue ? `<div class="value">${value}${unit}</div>` : ''}
            </div>
            <div class="bar-container" style="background-color: ${bg}; height: ${height}px;">
              <div class="bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
            </div>
          </div>
        `;
      }

      // Other existing fixes and layouts...

      if (labelPosition === "none" && valuePosition === "above") {
        return `
          <div class="bar-row vertical-stack">
            ${showValue ? `<div class="value" style="text-align: right; margin-bottom: 4px;">${value}${unit}</div>` : ''}
            <div class="bar-container" style="background-color: ${bg}; height: ${height}px;">
              <div class="bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
            </div>
          </div>
        `;
      }

      if (labelPosition === "none" && valuePosition === "right") {
        return `
          <div class="bar-row left" style="justify-content: flex-start;">
            <div class="bar-container" style="background-color: ${bg}; height: ${height}px; width: calc(100% - 60px);">
              <div class="bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
            </div>
            ${showValue ? `<div class="value" style="width: 60px; text-align: right; align-self: center;">${value}${unit}</div>` : ''}
          </div>
        `;
      }

      if (labelPosition === "above" && valuePosition === "above") {
        return `
          <div class="bar-row">
            <div class="label-value-above">
              <div class="label">
                ${bar.icon ? `<ha-icon class="icon" icon="${bar.icon}"></ha-icon>` : ''}
                <span>${bar.name}</span>
              </div>
              ${showValue ? `<div class="value">${value}${unit}</div>` : ''}
            </div>
            <div class="bar-container" style="background-color: ${bg}; height: ${height}px;">
              <div class="bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
            </div>
          </div>
        `;
      }

      if (labelPosition === "left") {
        return `
          <div class="bar-row left">
            <div class="label left">
              ${bar.icon ? `<ha-icon class="icon" icon="${bar.icon}"></ha-icon>` : ''}
              <span>${bar.name}</span>
            </div>
            <div class="bar-container" style="background-color: ${bg}; height: ${height}px;">
              <div class="bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
            </div>
            ${showValue && valuePosition === "right" ? `<div class="value">${value}${unit}</div>` : ""}
          </div>
        `;
      }

      if (labelPosition === "above" && valuePosition === "right") {
        return `
          <div class="bar-row vertical-stack">
            <div class="label" style="margin-bottom: 4px;">
              ${bar.icon ? `<ha-icon class="icon" icon="${bar.icon}"></ha-icon>` : ''}
              <span>${bar.name}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div class="bar-container" style="background-color: ${bg}; height: ${height}px; flex-grow: 1; margin-right: 12px;">
                <div class="bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
              </div>
              ${showValue ? `<div class="value" style="width: 60px;">${value}${unit}</div>` : ''}
            </div>
          </div>
        `;
      }

      // fallback
      return `
        <div class="bar-row">
          ${labelPosition === "above" ? `
            <div class="label" style="margin-bottom: 4px;">
              ${bar.icon ? `<ha-icon class="icon" icon="${bar.icon}"></ha-icon>` : ''}
              <span>${bar.name}</span>
            </div>
          ` : ""}
          <div class="bar-container" style="background-color: ${bg}; height: ${height}px;">
            <div class="bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
          </div>
          ${showValue && valuePosition === "right" ? `<div class="value">${value}${unit}</div>` : ""}
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
