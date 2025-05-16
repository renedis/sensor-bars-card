import { LitElement, html, css, property, customElement } from 'lit-element';
import { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';

interface BarConfig {
  name: string;
  entity: string;
  unit?: string;
  max?: number;
  icon?: string;
  color_gradient?: { from: number; color: string }[];
  background_color?: string;
}

interface SensorBarsCardConfig extends LovelaceCardConfig {
  title?: string;
  bars: BarConfig[];
}

@customElement('sensor-bars-card')
class SensorBarsCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Object }) private config!: SensorBarsCardConfig;

  setConfig(config: SensorBarsCardConfig) {
    if (!config.bars || !Array.isArray(config.bars)) {
      throw new Error("You need to define 'bars' in your card config");
    }
    this.config = config;
  }

  static styles = css`
    .card {
      padding: 16px;
    }
    .bar-container {
      background-color: var(--bar-background-color, #2f3a3f);
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
      color: var(--primary-text-color, #ccc);
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
  `;

  private computeColor(bar: BarConfig, value: number): string {
    if (!bar.color_gradient || bar.color_gradient.length === 0) {
      return "#5cd679"; // default green
    }
    const sorted = [...bar.color_gradient].sort((a, b) => b.from - a.from);
    for (const grad of sorted) {
      if (value >= grad.from) return grad.color;
    }
    return sorted[sorted.length - 1].color;
  }

  render() {
    if (!this.config || !this.hass) return html``;

    return html`
      <ha-card>
        <div class="card">
          ${this.config.title ? html`<h1>${this.config.title}</h1>` : null}
          ${this.config.bars.map((bar) => {
            const stateObj = this.hass.states[bar.entity];
            if (!stateObj) {
              return html`<div class="label">${bar.name} – entity not found</div>`;
            }

            const raw = parseFloat(stateObj.state);
            const value = isNaN(raw) ? 0 : raw;
            const unit =
              bar.unit ||
              stateObj.attributes.unit_of_measurement ||
              '';
            const max = bar.max || 100;
            const percent = Math.min((value / max) * 100, 100);
            const color = this.computeColor(bar, value);
            const bg = bar.background_color || "#2f3a3f";

            return html`
              <div class="label">
                <span>
                  ${bar.icon
                    ? html`<ha-icon class="icon" .icon=${bar.icon}></ha-icon>`
                    : null}
                  ${bar.name}
                </span>
                <span>${value}${unit}</span>
              </div>
              <div class="bar-container" style="background-color: ${bg};">
                <div
                  class="bar-fill"
                  style="width: ${percent}%; background-color: ${color};"
                ></div>
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return this.config.bars.length * 2 + 1;
  }
}
