class SensorBarsCard extends HTMLElement {
  setConfig(config) {
    if (!config.bars || !Array.isArray(config.bars)) {
      throw new Error("You need to define 'bars' in your card config");
    }
    this.config = config;
    this.chartType = config.type || "bar";  // "bar", "pie", or "donut"
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  // Helper: create SVG arc path for pie/donut slice
  _describeArc(cx, cy, radius, startAngle, endAngle) {
    const radians = (deg) => (deg * Math.PI) / 180;
    const start = {
      x: cx + radius * Math.cos(radians(startAngle)),
      y: cy + radius * Math.sin(radians(startAngle)),
    };
    const end = {
      x: cx + radius * Math.cos(radians(endAngle)),
      y: cy + radius * Math.sin(radians(endAngle)),
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  }

  render() {
    if (!this._hass || !this.config) return;
    const root = this.shadowRoot || this.attachShadow({ mode: 'open' });

    const style = `
      <style>
        .card { padding: 16px; }
        .chart-row {
          margin: 16px 0;
          display: flex;
          align-items: center;
        }
        .pie-svg {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }
        .label-value {
          margin-left: 16px;
          flex-grow: 1;
        }
        .label {
          font-size: 14px;
          font-weight: 500;
          color: #ccc;
          margin-bottom: 4px;
        }
        .value {
          font-size: 14px;
          font-weight: 400;
          color: #aaa;
        }
      </style>
    `;

    let contentHtml = '';

    if (this.chartType === "bar") {
      // your existing bar chart rendering code (keep as is)
      // For brevity, call a function or re-use your existing code here
      // You can replace this comment with your existing barsHtml code block
      contentHtml = this._renderBars();
    } else if (this.chartType === "pie" || this.chartType === "donut") {
      // Render pie/donut charts for each bar config item
      contentHtml = this.config.bars.map(bar => {
        const stateObj = this._hass.states[bar.entity];
        if (!stateObj) {
          return `<div class="label">${bar.name} – entity not found</div>`;
        }
        const raw = parseFloat(stateObj.state);
        const value = isNaN(raw) ? 0 : raw;
        const max = bar.max || 100;
        const percent = Math.min(value / max, 1);
        const angle = percent * 360;
        const color = (bar.color_gradient && bar.color_gradient.length) ?
          // pick color by value, fallback to first color
          (() => {
            const sorted = [...bar.color_gradient].sort((a,b) => b.from - a.from);
            for (const grad of sorted) {
              if (value >= grad.from) return grad.color;
            }
            return sorted[sorted.length-1].color;
          })() : "#5cd679";

        // SVG pie slice path for filled part (start angle 0, end angle = angle)
        const cx = 40, cy = 40, r = 35;
        const startAngle = 0;
        const endAngle = angle;

        // For donut, create a white hole circle
        const donutHole = this.chartType === "donut" ? `<circle cx="${cx}" cy="${cy}" r="${r*0.6}" fill="#1e1e2f" />` : "";

        // Label and value HTML with simple layout
        const labelHtml = `<div class="label">${bar.name}</div>`;
        const valueHtml = `<div class="value">${value}${bar.unit || ""}</div>`;

        return `
          <div class="chart-row">
            <svg class="pie-svg" viewBox="0 0 80 80" aria-label="${bar.name}">
              <circle cx="${cx}" cy="${cy}" r="${r}" fill="#2f3a3f" />
              <path d="${this._describeArc(cx, cy, r, startAngle, endAngle)}" fill="${color}" />
              ${donutHole}
            </svg>
            <div class="label-value">
              ${labelHtml}
              ${valueHtml}
            </div>
          </div>
        `;
      }).join('');
    }

    root.innerHTML = `${style}<ha-card><div class="card">
      ${this.config.title ? `<h1>${this.config.title}</h1>` : ''}
      ${contentHtml}
    </div></ha-card>`;
  }

  // Your existing _renderBars() function here if you want to separate bar code

  // The arc helper function from above
  _describeArc(cx, cy, radius, startAngle, endAngle) {
    const radians = (deg) => (deg * Math.PI) / 180;
    const start = {
      x: cx + radius * Math.cos(radians(startAngle)),
      y: cy + radius * Math.sin(radians(startAngle)),
    };
    const end = {
      x: cx + radius * Math.cos(radians(endAngle)),
      y: cy + radius * Math.sin(radians(endAngle)),
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  }

  getCardSize() {
    return this.config?.bars?.length * 2 + 1;
  }
}

customElements.define('sensor-bars-card', SensorBarsCard);
