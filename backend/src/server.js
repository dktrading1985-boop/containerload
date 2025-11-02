require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/v1/calculations/simple-floor', (req, res) => {
  try {
    const { container, carton, quantity, fillContainer } = req.body;
    if (!container || !carton) return res.status(400).json({ message: 'container and carton required' });

    const perRow = Math.floor(container.internalLengthCm / carton.lengthCm);
    const perCol = Math.floor(container.internalWidthCm / carton.widthCm);
    const perLayer = perRow * perCol;
    if (perLayer <= 0) return res.status(400).json({ message: 'Carton too large for container footprint.' });

    const maxLayers = Math.floor(container.internalHeightCm / carton.heightCm);
    const maxItems = perLayer * maxLayers;

    let itemsPlaced = 0;
    if (fillContainer || !quantity) itemsPlaced = maxItems;
    else itemsPlaced = Math.min(quantity ?? 0, maxItems);

    const usedVolume = itemsPlaced * (carton.lengthCm * carton.widthCm * carton.heightCm);
    const containerVolume = container.internalLengthCm * container.internalWidthCm * container.internalHeightCm;
    const utilizationPercent = Number(((usedVolume / containerVolume) * 100).toFixed(2));

    const totalWeight = itemsPlaced * carton.weightKg;
    const weightPercent = Number(((totalWeight / container.maxPayloadKg) * 100).toFixed(2));

    const warnings = [];
    if (totalWeight > container.maxPayloadKg) warnings.push('Payload exceeds container maximum.');
    if (maxLayers === 0) warnings.push('Carton height exceeds container height.');

    res.json({
      itemsPlaced,
      maxItems,
      perLayer,
      maxLayers,
      utilizationPercent,
      totalWeight,
      weightPercent,
      warnings
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log('API running on port', port));
