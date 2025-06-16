// Charts functionality for InvestSmart
let priceChart = null;
let volumeChart = null;
let candlestickChart = null;
let allocationBarChart = null;

// Initialize charts
function initializeCharts() {
    const priceCtx = document.getElementById('priceChart');
    const volumeCtx = document.getElementById('volumeChart');
    const candlestickCtx = document.getElementById('candlestickChart');
    const allocationBarCtx = document.getElementById('allocationBarChart');
    
    if (priceCtx) {
        initializePriceChart(priceCtx);
    }
    
    if (volumeCtx) {
        initializeVolumeChart(volumeCtx);
    }
    
    if (candlestickCtx) {
        initializeCandlestickChart(candlestickCtx);
    }
    
    if (allocationBarCtx) {
        initializeAllocationBarChart(allocationBarCtx);
    }
}

// Initialize price chart
function initializePriceChart(ctx) {
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Stock Price',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Stock Price Chart'
                },
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Initialize volume chart
function initializeVolumeChart(ctx) {
    volumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Volume',
                data: [],
                backgroundColor: 'rgba(33, 150, 243, 0.6)',
                borderColor: '#2196F3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Trading Volume'
                },
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Initialize candlestick chart
function initializeCandlestickChart(ctx) {
    // Destroy existing chart if it exists
    if (candlestickChart) {
        candlestickChart.destroy();
    }
    
    // Generate realistic candlestick data
    const candlestickData = generateCandlestickData('AAPL', 30);
    
    candlestickChart = new Chart(ctx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: 'AAPL Candlestick',
                data: candlestickData.data,
                color: {
                    up: '#00bcd4',        // Cyan/blue for up candles
                    down: '#ffb300',      // Orange for down candles
                    unchanged: '#999'
                },
                borderColor: {
                    up: '#00bcd4',
                    down: '#ffb300',
                    unchanged: '#999'
                },
                borderWidth: 1,
                wickColor: 'black',      // Black wicks
                wickWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Candlestick Chart' }
            },
            scales: {
                x: { grid: { color: 'rgba(0,0,0,0.05)' } },
                y: { grid: { color: 'rgba(0,0,0,0.05)' } }
            }
        }
    });
}

// Generate candlestick data
function generateCandlestickData(symbol, days) {
    const data = [];
    const labels = [];
    let basePrice = 196.45; // Starting price for AAPL
    
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate realistic OHLC data
        const volatility = 0.02; // 2% daily volatility
        const trend = (Math.random() - 0.5) * 0.01; // Small trend component
        
        const open = basePrice;
        const change = (Math.random() - 0.5) * 2 * volatility + trend;
        const close = open * (1 + change);
        
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        
        data.push({ x: date.getTime(), o: parseFloat(open.toFixed(2)), h: parseFloat(high.toFixed(2)), l: parseFloat(low.toFixed(2)), c: parseFloat(close.toFixed(2)) });
        
        labels.push(date.toLocaleDateString());
        basePrice = close; // Use close as next day's base
    }
    
    return { data, labels };
}

// Generate mock historical data for charts
function generateMockChartData(symbol, timeframe) {
    const now = new Date();
    const dataPoints = timeframe === '1d' ? 24 : timeframe === '1w' ? 7 : timeframe === '1m' ? 30 : 90;
    const labels = [];
    const prices = [];
    const volumes = [];
    
    // Base price for the symbol
    const basePrices = {
        'AAPL': 196.45,
        'MSFT': 474.96,
        'GOOGL': 174.67,
        'NVDA': 141.97
    };
    
    let basePrice = basePrices[symbol] || 100;
    
    for (let i = dataPoints; i >= 0; i--) {
        const date = new Date(now);
        
        if (timeframe === '1d') {
            date.setHours(date.getHours() - i);
            labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else if (timeframe === '1w') {
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString([], { weekday: 'short' }));
        } else {
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
        }
        
        // Generate realistic price movement
        const volatility = 0.02; // 2% volatility
        const change = (Math.random() - 0.5) * 2 * volatility;
        basePrice = basePrice * (1 + change);
        prices.push(parseFloat(basePrice.toFixed(2)));
        
        // Generate volume data
        const baseVolume = 50000000;
        const volumeVariation = (Math.random() * 0.5 + 0.75); // 75% to 125% of base
        volumes.push(Math.floor(baseVolume * volumeVariation));
    }
    
    return { labels, prices, volumes };
}

// Update charts with new data
function updateCharts(symbol, timeframe) {
    if (!priceChart || !volumeChart) {
        initializeCharts();
    }
    
    const data = generateMockChartData(symbol, timeframe);
    
    // Update price chart
    if (priceChart) {
        priceChart.data.labels = data.labels;
        priceChart.data.datasets[0].data = data.prices;
        priceChart.data.datasets[0].label = `${symbol} Price`;
        priceChart.options.plugins.title.text = `${symbol} Stock Price Chart (${timeframe})`;
        priceChart.update();
    }
    
    // Update volume chart
    if (volumeChart) {
        volumeChart.data.labels = data.labels;
        volumeChart.data.datasets[0].data = data.volumes;
        volumeChart.data.datasets[0].label = `${symbol} Volume`;
        volumeChart.options.plugins.title.text = `${symbol} Trading Volume (${timeframe})`;
        volumeChart.update();
    }
}

// Update candlestick chart
function updateCandlestickChart(symbol, timeframe) {
    if (!candlestickChart) return;
    
    const days = timeframe === '1w' ? 7 : timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 30;
    const candlestickData = generateCandlestickData(symbol, days);
    
    candlestickChart.data.datasets[0].data = candlestickData.data;
    candlestickChart.data.datasets[0].label = `${symbol} Candlestick`;
    candlestickChart.options.plugins.title.text = `${symbol} Candlestick Chart (${timeframe})`;
    candlestickChart.update();
}

// Create mini charts for stock cards
function createMiniChart(canvas, data) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (!data || data.length === 0) return;
    
    // Find min and max values
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    // Draw line chart
    ctx.strokeStyle = data[data.length - 1] > data[0] ? '#4CAF50' : '#f44336';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Fill area under curve
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
}

// Portfolio performance chart
let portfolioChartInstance = null;
function createPortfolioChart() {
    const portfolioCtx = document.getElementById('portfolioChart');
    if (!portfolioCtx) return;

    // Destroy previous chart if it exists
    if (portfolioChartInstance) {
        portfolioChartInstance.destroy();
    }

    // Get user's portfolio data
    const user = authManager.getCurrentUser();
    if (!user || !user.portfolio.holdings || user.portfolio.holdings.length === 0) {
        return;
    }

    const holdings = user.portfolio.holdings;
    const labels = holdings.map(h => h.symbol);
    const values = holdings.map(h => h.quantity * h.currentPrice);
    const colors = [
        '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336',
        '#00BCD4', '#8BC34A', '#FFC107', '#E91E63', '#607D8B'
    ];

    portfolioChartInstance = new Chart(portfolioCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, holdings.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Portfolio Allocation'
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const holding = holdings[context.dataIndex];
                            const percentage = ((context.parsed / user.portfolio.totalValue) * 100).toFixed(1);
                            return `${holding.symbol}: $${context.parsed.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Market sentiment chart
function createSentimentChart() {
    const sentimentCtx = document.getElementById('sentimentChart');
    if (!sentimentCtx) return;
    
    new Chart(sentimentCtx, {
        type: 'radar',
        data: {
            labels: ['Bullish', 'Bearish', 'Neutral', 'Volatile', 'Stable'],
            datasets: [{
                label: 'Market Sentiment',
                data: [75, 25, 50, 60, 40],
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: '#4CAF50',
                borderWidth: 2,
                pointBackgroundColor: '#4CAF50'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Market Sentiment Analysis'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// ===== HEATMAP CHART =====
let heatmapChartInstance = null;
function createHeatmapChart() {
    const heatmapCtx = document.getElementById('heatmapChart');
    if (!heatmapCtx) return;
    // Destroy previous chart if it exists
    if (heatmapChartInstance) {
        heatmapChartInstance.destroy();
    }
    // Mock data: Each stock is a cell, color by performance
    const user = authManager.getCurrentUser();
    const holdings = (user && user.portfolio && user.portfolio.holdings) ? user.portfolio.holdings : [];
    const labels = holdings.map(h => h.symbol);
    // Use P&L percent as heat value
    const data = holdings.map(h => {
        const buy = h.buyPrice || h.avgPrice || 0;
        const curr = h.currentPrice || (typeof h.value === 'number' && h.shares > 0 ? h.value / h.shares : 0);
        return buy > 0 ? ((curr - buy) / buy) * 100 : 0;
    });
    // Color scale: red (loss) to green (gain)
    const bgColors = data.map(val => {
        if (val > 0) {
            // Green gradient
            const g = Math.min(255, 100 + Math.round(val * 3));
            return `rgba(76, 175, 80, ${0.3 + Math.min(0.7, val/100)})`;
        } else {
            // Red gradient
            const r = Math.min(255, 200 + Math.abs(Math.round(val * 2)));
            return `rgba(244, 67, 54, ${0.3 + Math.min(0.7, Math.abs(val)/100)})`;
        }
    });
    heatmapChartInstance = new Chart(heatmapCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'P&L %',
                data: data,
                backgroundColor: bgColors,
                borderColor: '#222',
                borderWidth: 2,
                barPercentage: 0.8,
                categoryPercentage: 0.8
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Portfolio Heatmap (P&L %)',
                    color: '#fff',
                    font: { size: 18 }
                },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.x.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'P&L %', color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.08)' },
                    ticks: { color: '#fff' }
                },
                y: {
                    title: { display: false },
                    grid: { color: 'rgba(255,255,255,0.08)' },
                    ticks: { color: '#fff' }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            animation: false
        }
    });
}

// Initialize allocation bar chart
function initializeAllocationBarChart(ctx) {
    // Mock data for sector allocation
    const sectors = ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Utilities'];
    const allocations = [35, 20, 15, 10, 12, 8];
    const colors = [
        '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ef5350', '#ffd600'
    ];
    allocationBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sectors,
            datasets: [{
                label: 'Portfolio Allocation by Sector (%)',
                data: allocations,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Portfolio Allocation by Sector'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Allocation (%)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Initialize chart event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all main charts immediately
    initializeCharts();

    // Chart symbol and timeframe change handlers
    const chartSymbol = document.getElementById('chart-symbol');
    const chartTimeframe = document.getElementById('chart-timeframe');
    
    if (chartSymbol && chartTimeframe) {
        const updateChartsHandler = () => {
            updateCharts(chartSymbol.value, chartTimeframe.value);
            updateCandlestickChart(chartSymbol.value, chartTimeframe.value);
        };
        
        chartSymbol.addEventListener('change', updateChartsHandler);
        chartTimeframe.addEventListener('change', updateChartsHandler);
        
        // Initialize with default values
        setTimeout(() => {
            updateCharts('AAPL', '1d');
            updateCandlestickChart('AAPL', '1d');
        }, 1000);
    }
    
    // Initialize other charts when their sections are shown
    setTimeout(() => {
        createPortfolioChart();
        createSentimentChart();
        createHeatmapChart();
    }, 2000);

    const candlestickCtx = document.getElementById('candlestickChart');
    if (candlestickCtx) {
        initializeCandlestickChart(candlestickCtx);
    }
});

// Export functions for use in main script
window.chartFunctions = {
    initializeCharts,
    updateCharts,
    updateCandlestickChart,
    createMiniChart,
    createPortfolioChart,
    createSentimentChart,
    createHeatmapChart
};

