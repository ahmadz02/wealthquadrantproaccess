// Optional Phase 2 backend stub. Phase 1 uses browser localStorage.
const express = require('express');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ ok: true }));
app.listen(3000, () => console.log('Wealth Quadrant Pro Access API on http://localhost:3000'));
