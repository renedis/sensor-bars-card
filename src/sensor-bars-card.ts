import { LitElement, html, css, property, customElement } from 'lit-element';

@customElement('sensor-bars-card')
class SensorBarsCard extends LitElement {
  @property({ type: Object }) config = {};

  static styles = css\`
    .bar-container {
      background: var(--bar-background-color, #2f3a3f);
      border-radius: 9999px;
      overflow: hidden;
      height: 12px;
      width: 100%;
      margin: 4px 0;
    }

    .bar {
      background: var(--bar-fill-color, #5cd679);
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .label {
      font-size: 14px;
      color: #ccc;
      margin-bottom: 4px;
    }
  \`;

  render() {
    const bars = this.config.bars || [];
    return html\`
      <div>
        \${bars.map(bar => html\`
          <div class="label">\${bar.name}</div>
          <div class="bar-container">
            <div class="bar" style="width: \${bar.value || 0}%"></div>
          </div>
        \`)}
      </div>
    \`;
  }

  setConfig(config) {
    this.config = config;
  }
}
