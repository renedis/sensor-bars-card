# Sensor Bars Card

A customizable Lovelace card to display any numeric sensor as a modern, rounded progress bar.

## Installation (via HACS 2.x)

1. Go to **HACS → Settings → Custom Repositories**
2. Add this repo:
   - URL: `https://github.com/renedis/sensor-bars-card`
   - Type: `Dashboard`
3. Then use the card in your dashboard:

```yaml
type: custom:sensor-bars-card
title: Server Health
bars:
  - name: POE Load
    entity: sensor.waveshare_cm401_poe
    unit: "%"
    max: 100
    label_position: left
    value_position: right
    show_value: true
    height: 10
    color_gradient:
      - from: 0
        color: "#2ecc71"
      - from: 60
        color: "#f1c40f"
      - from: 90
        color: "#e74c3c"

```
