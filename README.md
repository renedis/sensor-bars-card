# Sensor Bars Card

A customizable Lovelace card to display any numeric sensor as a modern, rounded progress bar.

## Installation (via HACS 2.x)

1. Go to **HACS → Settings → Custom Repositories**
2. Add this repo:
   - URL: `https://github.com/renedis/sensor-bars-card`
   - Type: `Dashboard` (this is required due to HACS 2.x limitations)
3. After installation, add the following to your **Resources** in Home Assistant:

```
/hacsfiles/sensor-bars-card/sensor-bars-card.js
```

4. Then use the card in your dashboard:

```yaml
type: custom:sensor-bars-card
title: Sensor Data
bars:
  - name: Temperature
    entity: sensor.outdoor_temp
    max: 50
    unit: °C
    height: 8
    show_value: true
    color_gradient:
      - from: 0
        color: "#5cd679"
      - from: 30
        color: "#f1c40f"
      - from: 40
        color: "#e74c3c"
```

## Development

- Run `npm install`
- Use `npm run build` to build the card to `dist/sensor-bars-card.js`