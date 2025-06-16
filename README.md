<<<<<<< HEAD
# InvestSmart_112
=======
# InvestSmart - Stock Market Investment Tracking Application

## Overview
InvestSmart is a comprehensive stock market investment tracking and analysis web application built with HTML, CSS, and JavaScript. It features real-time data integration, interactive charts, portfolio management, AI recommendations, and social trading capabilities.

## Features

### Core Features
- **Real-time Stock Tracking**: Live price updates for stocks and market indices
- **Portfolio Management**: Track holdings, P&L, and performance with visual heatmaps
- **Interactive Charts**: Price and volume charts with multiple timeframes
- **Market Indices**: Track major indices like S&P 500, NASDAQ, Dow Jones
- **Dark/Light Theme**: Toggle between themes with persistent preferences

### Advanced Features
- **AI-Powered Recommendations**: Smart investment suggestions with confidence scores
- **Social Trading**: Leaderboards, trending stocks, and social sentiment analysis
- **Price Alerts**: Set custom price alerts with local storage persistence
- **Market News**: Latest market news with sentiment analysis
- **Quick Search**: Real-time stock search and filtering
- **Responsive Design**: Mobile-friendly interface

### Technical Features
- **API Integration**: Real-time data from Yahoo Finance API via Manus API Hub
- **Mock Data Fallback**: Comprehensive mock data system for offline testing
- **Chart.js Integration**: Professional interactive charts
- **Local Storage**: Persistent user preferences and alerts
- **Toast Notifications**: User-friendly feedback system

## File Structure
```
InvestSmart/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Complete styling with themes and animations
├── js/
│   ├── script.js           # Main JavaScript functionality
│   └── charts.js           # Chart.js integration and chart functions
├── data/
│   ├── mock_data.json      # Comprehensive mock data
│   └── live_data.json      # Real-time API data (generated)
├── images/                 # Image assets directory
└── api_integration.py      # Python script for API data fetching
```

## Setup Instructions

### Local Development
1. Extract the ZIP file to your desired location
2. Open a terminal in the InvestSmart directory
3. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and navigate to `http://localhost:8000`

### API Integration
1. The application includes real-time API integration using Manus API Hub
2. To fetch fresh data, run:
   ```bash
   python3 api_integration.py
   ```
3. This will update `live_data.json` with real market data

### Deployment
The application is ready for deployment as a static website on any web hosting platform.

## Usage Guide

### Navigation
- Use the sidebar navigation to switch between different sections
- Portfolio: View your holdings and performance
- Stock List: Browse available stocks with real-time data
- Charts: Interactive price and volume charts
- AI Recommendations: Get smart investment suggestions
- Social Trading: See trending stocks and top traders
- Market News: Latest market updates

### Features
- **Theme Toggle**: Click the moon icon to switch between light and dark themes
- **Search**: Use the search bar to find specific stocks
- **Price Alerts**: Click "Set Alert" on any stock to create price notifications
- **Copy Symbol**: Quickly copy stock symbols to clipboard
- **Refresh**: Manual data refresh with the refresh button

## Technical Details

### APIs Used
- Yahoo Finance API (via Manus API Hub) for real-time stock data
- Chart.js for interactive visualizations
- Local Storage API for user preferences

### Browser Compatibility
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (responsive design)

### Performance
- Lazy loading for charts
- Efficient data caching
- 5-second auto-refresh intervals
- Optimized CSS animations

## Customization

### Adding New Stocks
Edit the `stocks` array in `api_integration.py` to include additional stock symbols.

### Modifying Themes
Update the CSS variables in `style.css` to customize colors and styling.

### Chart Configuration
Modify chart settings in `charts.js` to change appearance and behavior.

## Security Notes
- All data is fetched from authorized APIs
- No sensitive user data is stored
- Local storage used only for preferences
- CORS-enabled for API requests

## Future Enhancements
- Real-time WebSocket connections
- Advanced technical indicators
- Portfolio optimization algorithms
- Mobile app development
- User authentication system

## Support
For technical support or feature requests, refer to the code comments and documentation within the files.

---
© 2025 InvestSmart - Real-time Stock Market Tracking

>>>>>>> 458ca9a (add)
