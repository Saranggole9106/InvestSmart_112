// Add Stock JavaScript for InvestSmart
class StockManager {
    constructor() {
        this.stockData = {};
        this.init();
    }

    init() {
        // Check authentication
        const user = authManager.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Update user info in header
        document.getElementById('user-name').textContent = `Welcome, ${user.name}!`;

        // Set default date to today
        document.getElementById('buy-date').value = new Date().toISOString().split('T')[0];

        // Load recent stocks
        this.loadRecentStocks();

        // Setup event listeners
        this.setupEventListeners();

        // Load stock suggestions
        this.loadStockSuggestions();
    }

    setupEventListeners() {
        const symbolInput = document.getElementById('stock-symbol');
        const quantityInput = document.getElementById('quantity');
        const buyPriceInput = document.getElementById('buy-price');

        // Stock symbol input with suggestions
        symbolInput.addEventListener('input', (e) => {
            this.handleSymbolInput(e.target.value);
            this.updateSummary();
        });

        symbolInput.addEventListener('blur', () => {
            setTimeout(() => {
                document.getElementById('stock-suggestions').style.display = 'none';
            }, 200);
        });

        // Update summary on input changes
        quantityInput.addEventListener('input', () => this.updateSummary());
        buyPriceInput.addEventListener('input', () => this.updateSummary());

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme);
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('investsmart_theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    // Stock suggestions data
    loadStockSuggestions() {
        this.stockSuggestions = [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 196.45 },
            { symbol: 'MSFT', name: 'Microsoft Corporation', price: 474.96 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 174.67 },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 212.10 },
            { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 141.97 },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 325.31 },
            { symbol: 'META', name: 'Meta Platforms Inc.', price: 682.87 },
            { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 264.95 },
            { symbol: 'V', name: 'Visa Inc.', price: 312.45 },
            { symbol: 'JNJ', name: 'Johnson & Johnson', price: 158.23 },
            { symbol: 'WMT', name: 'Walmart Inc.', price: 95.67 },
            { symbol: 'PG', name: 'Procter & Gamble Co.', price: 178.90 },
            { symbol: 'UNH', name: 'UnitedHealth Group Inc.', price: 623.45 },
            { symbol: 'HD', name: 'Home Depot Inc.', price: 445.78 },
            { symbol: 'MA', name: 'Mastercard Inc.', price: 523.12 }
        ];
    }

    handleSymbolInput(value) {
        const suggestions = document.getElementById('stock-suggestions');
        
        if (value.length < 1) {
            suggestions.style.display = 'none';
            return;
        }

        const filtered = this.stockSuggestions.filter(stock => 
            stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
            stock.name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);

        if (filtered.length > 0) {
            suggestions.innerHTML = filtered.map(stock => `
                <div class="suggestion-item" onclick="selectStock('${stock.symbol}', '${stock.name}', ${stock.price})">
                    <strong>${stock.symbol}</strong> - ${stock.name}
                    <div style="font-size: 0.9em; color: #666;">$${stock.price.toFixed(2)}</div>
                </div>
            `).join('');
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
    }

    selectStock(symbol, name, price) {
        document.getElementById('stock-symbol').value = symbol;
        document.getElementById('company-name').value = name;
        document.getElementById('current-price').value = price.toFixed(2);
        document.getElementById('stock-suggestions').style.display = 'none';
        this.updateSummary();
    }

    updateSummary() {
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const buyPrice = parseFloat(document.getElementById('buy-price').value) || 0;
        const currentPrice = parseFloat(document.getElementById('current-price').value) || 0;

        const totalInvestment = quantity * buyPrice;
        const currentValue = quantity * currentPrice;
        const profitLoss = currentValue - totalInvestment;
        const profitLossPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

        // Update summary display
        document.getElementById('total-investment').textContent = `$${totalInvestment.toFixed(2)}`;
        document.getElementById('current-value').textContent = `$${currentValue.toFixed(2)}`;
        
        const profitLossElement = document.getElementById('profit-loss');
        profitLossElement.textContent = `${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)} (${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%)`;
        
        // Update color based on profit/loss
        profitLossElement.className = profitLoss > 0 ? 'price-positive' : profitLoss < 0 ? 'price-negative' : 'price-neutral';
    }

    addStock(stockData) {
        const user = authManager.getCurrentUser();
        if (!user) return false;

        // Create new holding
        const newHolding = {
            id: Date.now().toString(),
            symbol: stockData.symbol.toUpperCase(),
            companyName: stockData.companyName,
            quantity: parseInt(stockData.quantity),
            buyPrice: parseFloat(stockData.buyPrice),
            currentPrice: parseFloat(stockData.currentPrice),
            buyDate: stockData.buyDate,
            notes: stockData.notes || '',
            addedAt: new Date().toISOString()
        };

        // Add to user's portfolio
        if (!user.portfolio.holdings) {
            user.portfolio.holdings = [];
        }

        // Check if stock already exists
        const existingIndex = user.portfolio.holdings.findIndex(h => h.symbol === newHolding.symbol);
        
        if (existingIndex !== -1) {
            // Update existing holding (average price calculation)
            const existing = user.portfolio.holdings[existingIndex];
            const totalShares = existing.quantity + newHolding.quantity;
            const totalCost = (existing.quantity * existing.buyPrice) + (newHolding.quantity * newHolding.buyPrice);
            
            user.portfolio.holdings[existingIndex] = {
                ...existing,
                quantity: totalShares,
                buyPrice: totalCost / totalShares,
                currentPrice: newHolding.currentPrice,
                notes: existing.notes + (newHolding.notes ? `\n${newHolding.notes}` : '')
            };
        } else {
            user.portfolio.holdings.push(newHolding);
        }

        // Update portfolio totals
        this.updatePortfolioTotals(user);

        // Save updated user data
        authManager.updateUser(user);

        return true;
    }

    updatePortfolioTotals(user) {
        let totalInvested = 0;
        let totalValue = 0;

        user.portfolio.holdings.forEach(holding => {
            totalInvested += holding.quantity * holding.buyPrice;
            totalValue += holding.quantity * holding.currentPrice;
        });

        user.portfolio.totalInvested = totalInvested;
        user.portfolio.totalValue = totalValue;
        user.portfolio.totalPnL = totalValue - totalInvested;
        user.portfolio.totalPnLPercent = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
    }

    loadRecentStocks() {
        const user = authManager.getCurrentUser();
        if (!user || !user.portfolio.holdings) return;

        const recentStocks = user.portfolio.holdings
            .sort((a, b) => new Date(b.addedAt || b.date || 0) - new Date(a.addedAt || a.date || 0))
            .slice(0, 5);

        const container = document.getElementById('recent-stocks-list');
        
        if (recentStocks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No stocks added yet</p>';
            return;
        }

        container.innerHTML = recentStocks.map(stock => {
            // Support both new and old data structures
            const quantity = stock.quantity || stock.shares || 0;
            const buyPrice = stock.buyPrice || stock.avgPrice || 0;
            const currentPrice = stock.currentPrice || (typeof stock.value === 'number' && quantity > 0 ? stock.value / quantity : 0);

            const pnl = (currentPrice - buyPrice) * quantity;
            const pnlClass = pnl > 0 ? 'price-positive' : pnl < 0 ? 'price-negative' : 'price-neutral';

            return `
                <div class="recent-stock-item">
                    <div class="recent-stock-info">
                        <div class="recent-stock-symbol">${stock.symbol}</div>
                        <div class="recent-stock-details">${quantity} shares @ $${buyPrice.toFixed(2)}</div>
                    </div>
                    <div class="recent-stock-pnl ${pnlClass}">
                        ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('investsmart_theme', isDark ? 'dark' : 'light');
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}

// Initialize stock manager
const stockManager = new StockManager();

// Global functions
function selectStock(symbol, name, price) {
    stockManager.selectStock(symbol, name, price);
}

function handleAddStock(event) {
    event.preventDefault();

    const formData = {
        symbol: document.getElementById('stock-symbol').value.trim(),
        companyName: document.getElementById('company-name').value.trim(),
        quantity: document.getElementById('quantity').value,
        buyPrice: document.getElementById('buy-price').value,
        currentPrice: document.getElementById('current-price').value,
        buyDate: document.getElementById('buy-date').value,
        notes: document.getElementById('notes').value.trim()
    };

    // Validation
    if (!formData.symbol) {
        stockManager.showToast('Please enter a stock symbol', 'error');
        return;
    }

    if (!formData.quantity || formData.quantity <= 0) {
        stockManager.showToast('Please enter a valid quantity', 'error');
        return;
    }

    if (!formData.buyPrice || formData.buyPrice <= 0) {
        stockManager.showToast('Please enter a valid buy price', 'error');
        return;
    }

    if (!formData.buyDate) {
        stockManager.showToast('Please select a purchase date', 'error');
        return;
    }

    // Add stock to portfolio
    if (stockManager.addStock(formData)) {
        stockManager.showToast(`${formData.symbol} added to portfolio successfully!`, 'success');
        
        // Reset form
        document.getElementById('add-stock-form').reset();
        document.getElementById('buy-date').value = new Date().toISOString().split('T')[0];
        stockManager.updateSummary();
        stockManager.loadRecentStocks();
    } else {
        stockManager.showToast('Failed to add stock to portfolio', 'error');
    }
}

// Make functions globally accessible (after stockManager is defined)
window.selectStock = selectStock;
window.handleAddStock = handleAddStock;


    // Enhanced stock input functionality
    function enhanceStockInput() {
        const symbolInput = document.getElementById('stock-symbol');
        const quantityInput = document.getElementById('quantity');
        const buyPriceInput = document.getElementById('buy-price');
        const currentPriceInput = document.getElementById('current-price');

        // Real-time price fetching simulation
        symbolInput.addEventListener('input', debounce((e) => {
            const symbol = e.target.value.toUpperCase();
            if (symbol.length >= 2) {
                fetchRealTimePrice(symbol);
            }
        }, 500));

        // Enhanced validation
        [quantityInput, buyPriceInput].forEach(input => {
            input.addEventListener('input', (e) => {
                validateNumericInput(e.target);
                updateSummaryWithAnimation();
            });
        });

        // Auto-calculate profit/loss
        [quantityInput, buyPriceInput, currentPriceInput].forEach(input => {
            input.addEventListener('input', () => {
                calculateProfitLoss();
            });
        });
    }

    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Simulate real-time price fetching
    function fetchRealTimePrice(symbol) {
        const currentPriceInput = document.getElementById('current-price');
        const companyNameInput = document.getElementById('company-name');
        
        // Add loading state
        currentPriceInput.classList.add('calculating');
        
        // Simulate API call delay
        setTimeout(() => {
            const stock = stockManager.stockSuggestions.find(s => s.symbol === symbol);
            if (stock) {
                // Simulate price fluctuation
                const fluctuation = (Math.random() - 0.5) * 0.02; // ±1%
                const newPrice = stock.price * (1 + fluctuation);
                
                currentPriceInput.value = newPrice.toFixed(2);
                companyNameInput.value = stock.name;
                
                // Add flash effect
                currentPriceInput.classList.add('price-flash');
                setTimeout(() => {
                    currentPriceInput.classList.remove('price-flash');
                }, 500);
                
                updateSummaryWithAnimation();
            }
            
            currentPriceInput.classList.remove('calculating');
        }, 1000);
    }

    // Enhanced numeric input validation
    function validateNumericInput(input) {
        const value = parseFloat(input.value);
        const isValid = !isNaN(value) && value > 0;
        
        input.classList.remove('valid', 'invalid');
        
        if (input.value.trim() === '') {
            return;
        }
        
        if (isValid) {
            input.classList.add('valid');
            hideValidationMessage(input);
        } else {
            input.classList.add('invalid');
            showValidationMessage(input, 'Please enter a valid positive number');
        }
    }

    // Show validation message
    function showValidationMessage(input, message) {
        let messageEl = input.parentNode.querySelector('.validation-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'validation-message';
            input.parentNode.appendChild(messageEl);
        }
        messageEl.textContent = message;
    }

    // Hide validation message
    function hideValidationMessage(input) {
        const messageEl = input.parentNode.querySelector('.validation-message');
        if (messageEl) {
            messageEl.remove();
        }
    }

    // Enhanced summary update with animations
    function updateSummaryWithAnimation() {
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const buyPrice = parseFloat(document.getElementById('buy-price').value) || 0;
        const currentPrice = parseFloat(document.getElementById('current-price').value) || 0;

        const totalInvestment = quantity * buyPrice;
        const currentValue = quantity * currentPrice;
        const profitLoss = currentValue - totalInvestment;
        const profitLossPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

        // Animate value changes
        animateValue('total-investment', totalInvestment, '$');
        animateValue('current-value', currentValue, '$');
        animateProfitLoss('profit-loss', profitLoss, profitLossPercent);

        // Update summary highlighting
        updateSummaryHighlighting(profitLoss);
    }

    // Animate value changes
    function animateValue(elementId, targetValue, prefix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
        const duration = 500;
        const startTime = performance.now();

        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
            
            element.textContent = `${prefix}${currentValue.toFixed(2)}`;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }
        
        requestAnimationFrame(updateValue);
    }

    // Animate profit/loss with color changes
    function animateProfitLoss(elementId, profitLoss, profitLossPercent) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const sign = profitLoss >= 0 ? '+' : '';
        const percentSign = profitLossPercent >= 0 ? '+' : '';
        
        element.textContent = `${sign}$${profitLoss.toFixed(2)} (${percentSign}${profitLossPercent.toFixed(2)}%)`;
        
        // Update color classes
        element.className = profitLoss > 0 ? 'price-positive' : profitLoss < 0 ? 'price-negative' : 'price-neutral';
        
        // Add bounce animation for significant changes
        if (Math.abs(profitLoss) > 100) {
            element.classList.add('bounce-in');
            setTimeout(() => {
                element.classList.remove('bounce-in');
            }, 600);
        }
    }

    // Update summary highlighting based on profit/loss
    function updateSummaryHighlighting(profitLoss) {
        const summaryItems = document.querySelectorAll('.summary-item');
        summaryItems.forEach(item => {
            item.classList.remove('highlight');
            if (Math.abs(profitLoss) > 50) {
                item.classList.add('highlight');
            }
        });
    }

    // Enhanced profit/loss calculation
    function calculateProfitLoss() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        const symbol = document.getElementById('stock-symbol').value.toUpperCase();
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const buyPrice = parseFloat(document.getElementById('buy-price').value) || 0;
        const currentPrice = parseFloat(document.getElementById('current-price').value) || 0;

        if (symbol && quantity > 0 && buyPrice > 0 && currentPrice > 0) {
            const totalInvestment = quantity * buyPrice;
            const currentValue = quantity * currentPrice;
            const profitLoss = currentValue - totalInvestment;
            const profitLossPercent = (profitLoss / totalInvestment) * 100;

            // Create detailed P&L breakdown
            const breakdown = {
                symbol,
                quantity,
                buyPrice,
                currentPrice,
                totalInvestment,
                currentValue,
                profitLoss,
                profitLossPercent,
                dailyChange: calculateDailyChange(currentPrice),
                marketValue: currentValue,
                unrealizedGains: profitLoss
            };

            displayProfitLossBreakdown(breakdown);
        }
    }

    // Calculate daily change (simulated)
    function calculateDailyChange(currentPrice) {
        // Simulate daily change based on current price
        const dailyChangePercent = (Math.random() - 0.5) * 0.04; // ±2%
        const dailyChange = currentPrice * dailyChangePercent;
        return {
            amount: dailyChange,
            percent: dailyChangePercent * 100
        };
    }

    // Display detailed profit/loss breakdown
    function displayProfitLossBreakdown(breakdown) {
        const summaryContainer = document.querySelector('.investment-summary');
        
        // Add detailed breakdown if not exists
        let detailsContainer = summaryContainer.querySelector('.pnl-details');
        if (!detailsContainer) {
            detailsContainer = document.createElement('div');
            detailsContainer.className = 'pnl-details';
            summaryContainer.appendChild(detailsContainer);
        }

        detailsContainer.innerHTML = `
            <h4>Detailed Analysis</h4>
            <div class="pnl-grid">
                <div class="pnl-item">
                    <span>Market Value:</span>
                    <span class="pnl-indicator ${breakdown.profitLoss >= 0 ? 'positive' : 'negative'}">
                        $${breakdown.marketValue.toFixed(2)}
                    </span>
                </div>
                <div class="pnl-item">
                    <span>Unrealized Gains:</span>
                    <span class="pnl-indicator ${breakdown.unrealizedGains >= 0 ? 'positive' : 'negative'}">
                        ${breakdown.unrealizedGains >= 0 ? '+' : ''}$${breakdown.unrealizedGains.toFixed(2)}
                    </span>
                </div>
                <div class="pnl-item">
                    <span>Daily Change:</span>
                    <span class="pnl-indicator ${breakdown.dailyChange.amount >= 0 ? 'positive' : 'negative'}">
                        ${breakdown.dailyChange.amount >= 0 ? '+' : ''}$${breakdown.dailyChange.amount.toFixed(2)}
                        (${breakdown.dailyChange.percent >= 0 ? '+' : ''}${breakdown.dailyChange.percent.toFixed(2)}%)
                    </span>
                </div>
                <div class="pnl-item">
                    <span>Return on Investment:</span>
                    <span class="pnl-indicator ${breakdown.profitLossPercent >= 0 ? 'positive' : 'negative'}">
                        ${breakdown.profitLossPercent >= 0 ? '+' : ''}${breakdown.profitLossPercent.toFixed(2)}%
                    </span>
                </div>
            </div>
        `;

        // Add fade-in animation
        detailsContainer.classList.add('fade-in');
    }

    // Enhanced stock suggestions with real-time data
    function enhanceStockSuggestions() {
        const suggestionsContainer = document.getElementById('stock-suggestions');
        
        // Add price indicators to suggestions
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
                    suggestions.forEach(suggestion => {
                        if (!suggestion.querySelector('.suggestion-price')) {
                            const priceElement = document.createElement('div');
                            priceElement.className = 'suggestion-price';
                            suggestion.appendChild(priceElement);
                        }
                    });
                }
            });
        });

        observer.observe(suggestionsContainer, { childList: true });
    }

    // Initialize enhanced features
    document.addEventListener('DOMContentLoaded', () => {
        enhanceStockInput();
        enhanceStockSuggestions();
        
        // Add tooltips to form elements
        addTooltips();
        
        // Initialize accessibility features
        initializeAccessibility();
    });

    // Add helpful tooltips
    function addTooltips() {
        const tooltips = [
            { id: 'stock-symbol', text: 'Enter the stock ticker symbol (e.g., AAPL for Apple)' },
            { id: 'quantity', text: 'Number of shares you want to purchase' },
            { id: 'buy-price', text: 'Price per share at which you bought or plan to buy' },
            { id: 'current-price', text: 'Current market price per share (auto-updated)' }
        ];

        tooltips.forEach(tooltip => {
            const element = document.getElementById(tooltip.id);
            if (element) {
                element.setAttribute('data-tooltip', tooltip.text);
                element.classList.add('tooltip');
            }
        });
    }

    // Initialize accessibility features
    function initializeAccessibility() {
        // Add ARIA labels
        const formElements = document.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            const label = element.parentNode.querySelector('label');
            if (label && !element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', label.textContent);
            }
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open dropdowns
                document.getElementById('stock-suggestions').style.display = 'none';
            }
        });

        // Add focus management
        const focusableElements = document.querySelectorAll('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focus-visible');
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('focus-visible');
            });
        });
    }

    // Export enhanced functions
    window.enhancedStockFunctions = {
        enhanceStockInput,
        calculateProfitLoss,
        updateSummaryWithAnimation,
        fetchRealTimePrice
    };

