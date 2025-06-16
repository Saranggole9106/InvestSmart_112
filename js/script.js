// Dashboard JavaScript for InvestSmart

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!authManager.getCurrentUser()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize user interface
    initializeUI();
    
    // Load initial data
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();

    animatePortfolioCards();

    setTimeout(cyclePortfolioData, 25000); // Start after 25s

    updateQuickStats();

    // Enhanced Mock Trading Center logic
    const mockPrices = { AAPL: 180, MSFT: 250, GOOGL: 1400, TSLA: 700 };
    let mockTradeHistory = JSON.parse(localStorage.getItem('mockTradeHistory') || '[]');

    function updateTradeSummary() {
        const symbol = document.getElementById('mock-stock-symbol').value;
        const qty = parseInt(document.getElementById('mock-trade-quantity').value, 10) || 1;
        const price = mockPrices[symbol] || 0;
        document.getElementById('mock-trade-price').textContent = `Price: $${price.toFixed(2)}`;
        document.getElementById('mock-trade-total').textContent = `Total: $${(price * qty).toFixed(2)}`;
    }

    function showLightning() {
        const lightning = document.getElementById('mock-trade-lightning');
        const tradingBox = document.getElementById('mock-trading-center');
        if (lightning) {
            lightning.innerHTML = `
                <svg viewBox="0 0 40 40">
                  <polygon points="20,2 25,18 15,18 22,38 18,22 25,22" fill="#fff700" />
                </svg>
            `;
            lightning.style.display = 'block';
            setTimeout(() => { lightning.style.display = 'none'; }, 500);
        }
        // Flash the trading box background
        if (tradingBox) {
            tradingBox.classList.add('lightning-flash-bg');
            setTimeout(() => tradingBox.classList.remove('lightning-flash-bg'), 500);
        }
    }

    function updateTradeHistory() {
        const historyDiv = document.getElementById('mock-trade-history');
        if (!historyDiv) return;
        if (mockTradeHistory.length === 0) {
            historyDiv.innerHTML = '<p style="color:#bbb;text-align:center;">No trades yet.</p>';
            return;
        }
        let html = '<h4>Trade History</h4><ul style="padding-left:1em;">';
        mockTradeHistory.slice(-5).reverse().forEach(trade => {
            html += `<li>${trade.time}: ${trade.action === 'buy' ? '🟢 Bought' : '🔴 Sold'} ${trade.qty} ${trade.symbol} @ $${trade.price.toFixed(2)} (${trade.total > 0 ? '+' : ''}$${trade.total.toFixed(2)})</li>`;
        });
        html += '</ul>';
        historyDiv.innerHTML = html;
    }

    function saveTrade(trade) {
        mockTradeHistory.push(trade);
        localStorage.setItem('mockTradeHistory', JSON.stringify(mockTradeHistory));
        updateTradeHistory();
    }

    const stockSel = document.getElementById('mock-stock-symbol');
    const qtyInput = document.getElementById('mock-trade-quantity');
    if (stockSel && qtyInput) {
        stockSel.addEventListener('change', updateTradeSummary);
        qtyInput.addEventListener('input', updateTradeSummary);
    }
    // Also update on page load
    updateTradeSummary();

    const tradeForm = document.getElementById('mock-trade-form');
    if (tradeForm) {
        tradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const symbol = document.getElementById('mock-stock-symbol').value;
            const action = document.getElementById('mock-trade-action').value;
            const qty = parseInt(document.getElementById('mock-trade-quantity').value, 10) || 1;
            const price = mockPrices[symbol] || 0;
            const total = price * qty * (action === 'buy' ? -1 : 1);
            const trade = {
                symbol,
                action,
                qty,
                price,
                total,
                time: new Date().toLocaleTimeString()
            };
            document.getElementById('mock-trade-result').textContent =
                `Mock ${action === 'buy' ? 'bought' : 'sold'} ${qty} ${symbol} at $${price.toFixed(2)} for $${Math.abs(total).toFixed(2)}.`;
            saveTrade(trade);
            showLightning();
        });
    }
    updateTradeHistory();
});

// Initialize UI elements
function initializeUI() {
    const user = authManager.getCurrentUser();
    if (user) {
        document.getElementById('user-name-header').textContent = `Welcome, ${user.name}!`;
        document.getElementById('user-initials').textContent = user.name.charAt(0).toUpperCase();
    }
}

// Load dashboard data
function loadDashboardData() {
    // Load portfolio data
    loadPortfolioData();
    
    // Load market indices
    loadMarketIndices();
    
    // Load stock list
    loadStockList();
    
    // Load AI recommendations
    loadAIRecommendations();
    
    // Load social trading data
    loadSocialTradingData();
    
    // Load market news
    loadMarketNews();
    
    // Initialize charts
    initializeCharts();
}

// Load portfolio data
function loadPortfolioData() {
    const user = authManager.getCurrentUser();
    if (user && user.portfolio) {
        let holdings = user.portfolio.holdings || [];
        // Normalize holdings to support both new and old structures
        holdings = holdings.map(h => {
            // If already in old format, return as is
            if (typeof h.shares === 'number' && typeof h.avgPrice === 'number') return h;
            // Convert new format to old format for dashboard
            const shares = h.quantity || h.shares || 0;
            const avgPrice = h.buyPrice || h.avgPrice || 0;
            const currentPrice = h.currentPrice || (typeof h.value === 'number' && shares > 0 ? h.value / shares : 0);
            const value = shares * currentPrice;
            const pnl = (currentPrice - avgPrice) * shares;
            return {
                ...h,
                shares,
                avgPrice,
                currentPrice,
                value,
                pnl
            };
        });
        // Calculate totals dynamically
        const totalValue = holdings.reduce((sum, h) => sum + (typeof h.value === 'number' ? h.value : 0), 0);
        const totalInvested = holdings.reduce((sum, h) => sum + (typeof h.avgPrice === 'number' && typeof h.shares === 'number' ? h.avgPrice * h.shares : 0), 0);
        const totalPnL = holdings.reduce((sum, h) => sum + (typeof h.pnl === 'number' ? h.pnl : 0), 0);
        const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

        document.getElementById('total-value').textContent = formatCurrency(totalValue);
        document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
        document.getElementById('total-pnl').textContent = formatCurrency(totalPnL);
        // Optionally update the percent change display if you have an element for it
        const changeEls = document.querySelectorAll('.change');
        if (changeEls && changeEls.length > 0) {
            changeEls.forEach(el => {
                el.textContent = `${totalPnLPercent >= 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}%`;
                el.className = 'change ' + (totalPnLPercent >= 0 ? 'positive' : 'negative');
            });
        }
        // Update holdings table
        updateHoldingsTable(holdings);

        updateQuickStats();
    }
}

// Load market indices
function loadMarketIndices() {
    // Mock data - replace with real API call
    const indices = [
        { name: 'S&P 500', value: 4783.45, change: 1.23 },
        { name: 'NASDAQ', value: 16742.38, change: 1.45 },
        { name: 'DOW', value: 37305.16, change: -0.12 }
    ];
    
    const indicesGrid = document.querySelector('.indices-grid');
    indicesGrid.innerHTML = indices.map(index => `
                    <div class="index-card">
                        <h3>${index.name}</h3>
            <p class="index-value">${formatNumber(index.value)}</p>
            <span class="change ${index.change >= 0 ? 'positive' : 'negative'}">
                ${index.change >= 0 ? '+' : ''}${index.change}%
            </span>
                        </div>
    `).join('');
}

// Load stock list
function loadStockList() {
    // Mock data - replace with real API call
    const stocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.23, volume: '52.3M', marketCap: '2.9T' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 0.85, volume: '22.1M', marketCap: '2.8T' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: -0.45, volume: '18.7M', marketCap: '1.8T' }
    ];
    
    const stockListBody = document.getElementById('stock-list-body');
    stockListBody.innerHTML = stocks.map(stock => `
        <tr>
            <td>${stock.symbol}</td>
            <td>${stock.name}</td>
            <td>${formatCurrency(stock.price)}</td>
            <td class="${stock.change >= 0 ? 'positive' : 'negative'}">
                ${stock.change >= 0 ? '+' : ''}${stock.change}%
            </td>
            <td>${stock.volume}</td>
            <td>${stock.marketCap}</td>
        </tr>
    `).join('');
}

// Load AI recommendations
function loadAIRecommendations() {
    // Mock data - replace with real API call
    const recommendations = [
        {
            type: 'Top Buy',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            reason: 'Strong earnings growth and positive market sentiment',
            confidence: 85
        },
        {
            type: 'Top Buy',
            symbol: 'MSFT',
            name: 'Microsoft Corp.',
            reason: 'Consistent cloud revenue and strong fundamentals',
            confidence: 80
        },
        {
            type: 'Top Watch',
            symbol: 'TSLA',
            name: 'Tesla Inc.',
            reason: 'Volatile but high growth potential in EV sector',
            confidence: 70
        },
        {
            type: 'Top Sell',
            symbol: 'NFLX',
            name: 'Netflix Inc.',
            reason: 'Subscriber growth slowing, increased competition',
            confidence: 60
        },
        {
            type: 'Top Buy',
            symbol: 'NVDA',
            name: 'NVIDIA Corp.',
            reason: 'AI chip demand and strong earnings',
            confidence: 90
        },
        {
            type: 'Top Watch',
            symbol: 'GOOGL',
            name: 'Alphabet Inc.',
            reason: 'Solid ad revenue, but regulatory risks',
            confidence: 75
        }
    ];
    
    const recommendationsGrid = document.querySelector('.recommendations-grid');
    recommendationsGrid.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card">
            <h3>${rec.type}</h3>
            <div class="stock-info">
                <span class="symbol">${rec.symbol}</span>
                <span class="name">${rec.name}</span>
                </div>
            <p class="recommendation-reason">${rec.reason}</p>
            <div class="confidence-meter">
                <div class="confidence-bar" style="width: ${rec.confidence}%"></div>
                <span>${rec.confidence}% Confidence</span>
                    </div>
                    </div>
    `).join('');
}

// Load social trading data
function loadSocialTradingData() {
    // Updated mock data with famous Indian investors and their current stock
    const leaderboard = [
        { name: 'Rakesh Jhunjhunwala (Big Bull)', portfolio: '₹2,500 Cr', return: '+22.5%', cs: { symbol: 'TITAN', price: '₹3,200' } },
        { name: 'Radhakishan Damani (DMart founder)', portfolio: '₹1,800 Cr', return: '+18.2%', cs: { symbol: 'DMART', price: '₹4,000' } },
        { name: 'Vijay Kedia (Small-Cap King)', portfolio: '₹950 Cr', return: '+15.7%', cs: { symbol: 'CERA', price: '₹7,800' } },
        { name: 'Raamdeo Agrawal (Motilal Oswal co-founder)', portfolio: '₹700 Cr', return: '+13.4%', cs: { symbol: 'MOFS', price: '₹1,200' } }
    ];
    
    const leaderboardList = document.querySelector('.leaderboard-list');
    leaderboardList.innerHTML = leaderboard.map((trader, index) => `
        <div class="leaderboard-item">
            <span class="rank">#${index + 1}</span>
            <span class="name">${trader.name}</span>
            <span class="portfolio">${trader.portfolio}</span>
            <span class="stock">${trader.cs.symbol} <span class="stock-price">(${trader.cs.price})</span></span>
            <span class="return positive">${trader.return}</span>
                    </div>
    `).join('');
}

// Load market news
function loadMarketNews() {
    // Mock data - replace with real API call
    const news = [
        {
            title: 'Fed Signals Potential Rate Cut',
            source: 'Bloomberg',
            time: '2 hours ago',
            sentiment: 'positive'
        },
        {
            title: 'Tech Stocks Rally on Strong Earnings',
            source: 'CNBC',
            time: '4 hours ago',
            sentiment: 'positive'
        }
    ];
    
    const newsFeed = document.querySelector('.news-feed');
    newsFeed.innerHTML = news.map(item => `
        <div class="news-item ${item.sentiment}">
            <h3>${item.title}</h3>
            <div class="news-meta">
                <span class="source">${item.source}</span>
                <span class="time">${item.time}</span>
                        </div>
                    </div>
    `).join('');
}

// Initialize charts
function initializeCharts() {
    // Portfolio chart
    const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
    new Chart(portfolioCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Portfolio Value',
                data: [10000, 10500, 10200, 10800, 11200, 11500],
                borderColor: '#667eea',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Price chart
    const priceCtx = document.getElementById('priceChart').getContext('2d');
    new Chart(priceCtx, {
        type: 'line',
        data: {
            labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00'],
            datasets: [{
                label: 'Price',
                data: [150, 152, 151, 153, 155, 154],
                borderColor: '#10b981',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Volume chart
    const volumeCtx = document.getElementById('volumeChart').getContext('2d');
    new Chart(volumeCtx, {
        type: 'bar',
        data: {
            labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00'],
            datasets: [{
                label: 'Volume',
                data: [1000, 1200, 900, 1500, 1100, 1300],
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Quick search
    document.getElementById('quick-search').addEventListener('input', handleQuickSearch);
    
    // Stock search
    document.getElementById('stock-search').addEventListener('input', handleStockSearch);
    
    // Sector filter
    document.getElementById('sector-filter').addEventListener('change', handleSectorFilter);
    
    // Chart controls
    document.getElementById('chart-symbol').addEventListener('change', updateCharts);
    document.getElementById('chart-timeframe').addEventListener('change', updateCharts);
    
    // Refresh data
    document.getElementById('refresh-data').addEventListener('click', loadDashboardData);

    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', showRefreshToast);
    }
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Handle quick search
function handleQuickSearch(event) {
    const query = event.target.value.toLowerCase();
    // Implement search functionality
}

// Handle stock search
function handleStockSearch(event) {
    const query = event.target.value.toLowerCase();
    // Implement stock search functionality
}

// Handle sector filter
function handleSectorFilter(event) {
    const sector = event.target.value;
    // Implement sector filtering
}

// Update charts
function updateCharts() {
    const symbol = document.getElementById('chart-symbol').value;
    const timeframe = document.getElementById('chart-timeframe').value;
    // Implement chart updates
}

// Update holdings table
function updateHoldingsTable(holdings) {
    const holdingsBody = document.getElementById('holdings-body');
    holdingsBody.innerHTML = holdings.map(holding => `
        <tr class="holding-row">
            <td>${holding.symbol || '-'}</td>
            <td>${typeof holding.shares === 'number' && !isNaN(holding.shares) ? holding.shares : 0}</td>
            <td>${typeof holding.avgPrice === 'number' && !isNaN(holding.avgPrice) ? formatCurrency(holding.avgPrice) : '$0.00'}</td>
            <td>${typeof holding.currentPrice === 'number' && !isNaN(holding.currentPrice) ? formatCurrency(holding.currentPrice) : '$0.00'}</td>
            <td>${typeof holding.value === 'number' && !isNaN(holding.value) ? formatCurrency(holding.value) : '$0.00'}</td>
            <td class="${typeof holding.pnl === 'number' && holding.pnl >= 0 ? 'positive' : 'negative'}">
                ${typeof holding.pnl === 'number' && !isNaN(holding.pnl) ? formatCurrency(holding.pnl) : '$0.00'}
            </td>
        </tr>
    `).join('');

    // Add interactive row highlight
    document.querySelectorAll('.holding-row').forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(74,107,255,0.08)';
            row.style.transition = 'background 0.2s';
        });
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
}

// Animate portfolio cards on load
function animatePortfolioCards() {
    const cards = document.querySelectorAll('.summary-card');
    cards.forEach((card, i) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(.68,-0.55,.27,1.55)';
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }, 200 + i * 150);
    });
}

// Show toast when data is refreshed
function showRefreshToast() {
    if (window.authManager && typeof window.authManager.showToast === 'function') {
        window.authManager.showToast('Dashboard data refreshed!', 'success');
    }
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

// Format number
function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
}

// Show selected section and hide others
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    // Update active state in navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick').includes(sectionId)) {
            link.classList.add('active');
        }
    });
}

// Toggle user menu
    function toggleUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('show');
    }

    // Show account modal
    function showAccountModal() {
        const modal = document.getElementById('account-modal');
    modal.style.display = 'flex';
    
    // Populate user data
        const user = authManager.getCurrentUser();
    if (user) {
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('currency-preference').value = user.preferences.currency;
    }
    }

    // Close account modal
    function closeAccountModal() {
    document.getElementById('account-modal').style.display = 'none';
    }
// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.matches('.user-btn')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (const dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
});

// === MOCK PORTFOLIO DATA FOR LIVE UPDATES ===
const mockPortfolioSnapshots = [
  [
    { symbol: 'AAPL', shares: 10, avgPrice: 150, currentPrice: 180, value: 1800, pnl: 300 },
    { symbol: 'MSFT', shares: 5, avgPrice: 200, currentPrice: 250, value: 1250, pnl: 250 },
    { symbol: 'GOOGL', shares: 2, avgPrice: 1200, currentPrice: 1400, value: 2800, pnl: 400 },
    { symbol: 'TSLA', shares: 3, avgPrice: 600, currentPrice: 700, value: 2100, pnl: 300 }
  ],
  [
    { symbol: 'AAPL', shares: 10, avgPrice: 150, currentPrice: 185, value: 1850, pnl: 350 },
    { symbol: 'MSFT', shares: 5, avgPrice: 200, currentPrice: 245, value: 1225, pnl: 225 },
    { symbol: 'GOOGL', shares: 2, avgPrice: 1200, currentPrice: 1420, value: 2840, pnl: 440 },
    { symbol: 'TSLA', shares: 3, avgPrice: 600, currentPrice: 690, value: 2070, pnl: 270 }
  ],
  [
    { symbol: 'AAPL', shares: 10, avgPrice: 150, currentPrice: 175, value: 1750, pnl: 250 },
    { symbol: 'MSFT', shares: 5, avgPrice: 200, currentPrice: 255, value: 1275, pnl: 275 },
    { symbol: 'GOOGL', shares: 2, avgPrice: 1200, currentPrice: 1390, value: 2780, pnl: 380 },
    { symbol: 'TSLA', shares: 3, avgPrice: 600, currentPrice: 720, value: 2160, pnl: 360 }
  ]
];
let currentSnapshot = 0;

function cyclePortfolioData() {
  const user = authManager.getCurrentUser();
  if (user && user.portfolio) {
    // Cycle through snapshots
    currentSnapshot = (currentSnapshot + 1) % mockPortfolioSnapshots.length;
    user.portfolio.holdings = JSON.parse(JSON.stringify(mockPortfolioSnapshots[currentSnapshot]));
    // Optionally update localStorage/sessionStorage
    authManager.updateUser(user);
    // Refresh dashboard
    loadPortfolioData();
    animatePortfolioCards();
    if (window.authManager && typeof window.authManager.showToast === 'function') {
      window.authManager.showToast('Portfolio updated with new data!', 'info');
    }
  }
  // Schedule next update (random between 25-30 seconds)
  const nextDelay = 25000 + Math.floor(Math.random() * 5000);
  setTimeout(cyclePortfolioData, nextDelay);
}

