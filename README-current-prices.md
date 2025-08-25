# Current Market Prices Page

## Overview
The Current Market Prices page provides real-time agricultural commodity prices from Indian markets, helping farmers make informed selling decisions.

## Features

### 🔍 Advanced Filtering
- **State Filter**: Filter prices by specific Indian states (Karnataka, Punjab, Maharashtra, etc.)
- **Commodity Filter**: Search for specific crops (Onion, Wheat, Rice, Tomato, etc.)
- **Market Filter**: Filter by specific market locations (Bangalore, Ludhiana, Mumbai, etc.)
- **Real-time Search**: Search across all commodity names, markets, and states

### 📊 Data Visualization
- **Comprehensive Table**: View State, Market, Commodity, Min Price, Max Price, Modal Price, and Arrival Date
- **Price Trend Indicators**: Visual indicators showing price trends (up, down, or neutral)
- **Color-coded Pricing**: Green for minimum prices, red for maximum prices, bold for modal prices
- **Mobile-Responsive**: Optimized display for all device sizes

### ⚡ Interactive Features
- **Sortable Columns**: Click column headers to sort by State, Commodity, or Modal Price
- **Export to CSV**: Download filtered data for offline analysis
- **Refresh Data**: Get the latest market prices with one click
- **Debounced Search**: Efficient search that doesn't overwhelm the API

### 🛡️ Technical Features
- **Error Handling**: Graceful handling of API failures and network issues
- **Loading States**: Clear loading indicators during data fetching
- **Caching**: Optimized API calls to reduce server load
- **Accessibility**: Full ARIA support and keyboard navigation
- **SEO Optimized**: Meta tags and structured data for search engines

## API Integration

### Data Source
- **API Endpoint**: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
- **API Key**: 579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b
- **Update Frequency**: Real-time market data from government sources

### Sample API Response Structure
```typescript
interface CommodityRecord {
  state: string;
  market: string;
  commodity: string;
  modal_price: string;
  min_price: string;
  max_price: string;
  arrival_date: string;
}
```

## Usage Guide

### For Farmers
1. **Check Local Prices**: Use the State and Market filters to find prices in your area
2. **Compare Commodities**: Search for specific crops you're growing
3. **Track Price Trends**: Look at the trend indicators to understand market direction
4. **Plan Sales**: Use the price data to decide when to sell your produce

### For Traders
1. **Market Analysis**: Export CSV data for detailed analysis
2. **Price Monitoring**: Set up regular checks for commodities of interest
3. **Trend Analysis**: Use sorting to identify price patterns across markets

## Sample Filter Examples

### Popular Agricultural Commodities
- **Onion prices in Karnataka** - Essential vegetable crop
- **Wheat prices in Punjab** - Major cereal crop
- **Rice prices across states** - Staple food grain
- **Tomato prices in specific markets** - Perishable vegetable
- **Cotton prices in Maharashtra** - Major cash crop

### State-wise Focus
- **Karnataka**: Bangalore, Mysore, Hubli markets
- **Punjab**: Ludhiana, Amritsar, Jalandhar markets
- **Maharashtra**: Mumbai, Pune, Nagpur markets
- **Uttar Pradesh**: Delhi, Agra, Kanpur markets

## Technical Implementation

### React Hooks Used
- `useState`: State management for filters, data, and UI states
- `useEffect`: Data fetching and debounced search implementation
- `useCallback`: Memoized API calls and event handlers

### UI Components
- **shadcn/ui**: Card, Input, Button, Select, Badge, Alert components
- **Lucide React**: Icons for visual indicators and actions
- **Tailwind CSS**: Responsive styling and design system

### Performance Optimizations
- **Debounced Search**: 500ms delay to prevent excessive API calls
- **Memoized Filtering**: Efficient data filtering and sorting
- **Lazy Loading**: Components load only when needed

## Accessibility Features

### Screen Reader Support
- ARIA labels for all interactive elements
- Table headers with proper roles and descriptions
- Form inputs with descriptive labels
- Status announcements for loading and error states

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space key support for buttons
- Arrow key navigation for dropdowns
- Escape key to close modals

### Visual Accessibility
- High contrast colors for better readability
- Large touch targets for mobile users
- Clear focus indicators
- Alternative text for all icons

## Error Handling

### Network Issues
- Automatic retry mechanism for failed API calls
- Offline detection and appropriate messaging
- Graceful degradation when API is unavailable

### Data Issues
- Validation of API response structure
- Fallback displays for missing data
- Clear error messages for invalid filters

### User Experience
- Loading skeletons during data fetch
- Progress indicators for long operations
- Toast notifications for user actions

## Future Enhancements

### Planned Features
- **Price Alerts**: Set up notifications for price thresholds
- **Historical Data**: View price trends over time
- **Market Comparison**: Side-by-side market comparisons
- **Mobile App**: Dedicated mobile application
- **Multi-language**: Support for regional languages

### API Improvements
- **WebSocket Integration**: Real-time price updates
- **Bulk Data Export**: Larger dataset downloads
- **Advanced Filtering**: Date range and price range filters
- **Geolocation**: Automatic location-based filtering

## Support and Feedback

For issues or feature requests:
- Create an issue in the project repository
- Contact the development team
- Provide feedback through the application interface

## Data Attribution

All market price data is sourced from the Government of India's open data portal (data.gov.in). The application provides access to publicly available agricultural commodity prices for informational purposes only.
