// Grid-based Heatmap for InvestSmart

document.addEventListener('DOMContentLoaded', function() {
    // Mock portfolio data
    const holdings = [
        { symbol: 'AAPL', buyPrice: 150, currentPrice: 180, quantity: 10 },
        { symbol: 'MSFT', buyPrice: 200, currentPrice: 250, quantity: 5 },
        { symbol: 'GOOGL', buyPrice: 1200, currentPrice: 1400, quantity: 2 },
        { symbol: 'TSLA', buyPrice: 600, currentPrice: 700, quantity: 3 },
        { symbol: 'TCS', buyPrice: 3500, currentPrice: 4000, quantity: 4 },
        { symbol: 'INFY', buyPrice: 1400, currentPrice: 1350, quantity: 6 },
        { symbol: 'HDFCBANK', buyPrice: 1600, currentPrice: 1700, quantity: 8 },
        { symbol: 'RELIANCE', buyPrice: 2500, currentPrice: 2550, quantity: 7 },
        { symbol: 'ITC', buyPrice: 400, currentPrice: 410, quantity: 12 },
        { symbol: 'BAJFINANCE', buyPrice: 7000, currentPrice: 6900, quantity: 2 },
        { symbol: 'SBIN', buyPrice: 500, currentPrice: 520, quantity: 10 },
        { symbol: 'WIPRO', buyPrice: 600, currentPrice: 590, quantity: 9 },
        { symbol: 'HCLTECH', buyPrice: 1100, currentPrice: 1150, quantity: 5 },
        { symbol: 'ADANIGREEN', buyPrice: 900, currentPrice: 850, quantity: 6 },
        { symbol: 'LT', buyPrice: 2200, currentPrice: 2250, quantity: 3 },
        { symbol: 'MARUTI', buyPrice: 9000, currentPrice: 9100, quantity: 1 },
        { symbol: 'SUNPHARMA', buyPrice: 1000, currentPrice: 980, quantity: 4 },
        { symbol: 'TITAN', buyPrice: 3200, currentPrice: 3300, quantity: 2 }
    ];

    // Color scale based on P&L %
    function getColor(pct) {
        if (pct <= -5) return '#ff3b1f'; // deep red
        if (pct <= -2) return '#ff9800'; // orange
        if (pct <= 0) return '#ffe066'; // yellow
        if (pct <= 2) return '#a3e635'; // light green
        return '#22c55e'; // strong green
    }

    const grid = document.getElementById('heatmapGrid');
    grid.innerHTML = '';
    holdings.forEach(h => {
        const pnlPct = h.buyPrice > 0 ? ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100 : 0;
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.style.background = getColor(pnlPct);
        cell.title = `${h.symbol}\nP&L: ${pnlPct.toFixed(2)}%\nValue: ₹${(h.currentPrice * h.quantity).toLocaleString()}`;
        cell.innerHTML = `<span>${h.symbol}</span>`;
        grid.appendChild(cell);
    });
}); 