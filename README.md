# MTBF Work Order Analyzer (Browser Extension)

Analyze CMMS work order tables directly in your web browser! This extension recognizes work order tables in web-based reports (e.g., BIRT from Maximo), performs quick reliability and cost analysis, and generates Pareto charts—all without sending data anywhere.

## Features
- ✅ **Automatic column mapping** for common CMMS table formats
- ✅ **MTBF calculation** based on time between failures (in hours)
- ✅ **Failure rate analysis** (failures per year)
- ✅ **Cost analysis** with average work order costs
- ✅ **Equipment ranking** by work order count and total cost
- ✅ **CM/PM/PdM breakdown** with warnings for PM-only data
- ✅ **Pareto charts** for top equipment failures
- ✅ **Manual column mapping** when automatic detection fails
- ✅ **Local processing** - no data leaves your computer

## How to Use
1. **Clone or download this folder** to your computer.
2. **Open Chrome or Edge** and go to `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `MTBF Browser Extension` folder.
5. Navigate to a web-based CMMS report (e.g., BIRT from Maximo).
6. Click the extension icon and use the popup to scan the page and view analysis.

## Supported Column Formats
The extension automatically recognizes these column patterns:

### Equipment Identifiers
- Equipment, Equipment ID, Equipment Number
- Asset, Asset ID, Asset Number
- Machine, Machine ID

### Date Columns
- Reported Date, Date, Work Order Date
- Completion Date, Created Date, Start Date

### Cost Columns
- Cost, Total Cost, Labor Cost
- Material Cost, Work Order Cost, Actual Cost

### Work Type Columns
- Work Type, Type, Maintenance Type
- WO Type, Order Type, Category

## Analysis Features

### MTBF Calculation
- Calculates Mean Time Between Failures in hours
- Uses first and last dates in the dataset
- Provides equipment-specific and overall MTBF

### Cost Analysis
- Total and average work order costs
- Equipment cost ranking
- Cost-based Pareto analysis

### Maintenance Type Analysis
- Corrective Maintenance (CM) count
- Preventative Maintenance (PM) count
- Predictive Maintenance (PdM) count
- Warning when only PM data is detected

### Pareto Charts
- Top 10 equipment by work order count
- Visual bar chart representation
- Equipment names truncated for display

## Testing
Use the included `test-data.html` file to test the extension with sample CMMS data.

## Project Structure
- `manifest.json` — Extension manifest (Manifest v3)
- `popup/` — Popup UI (HTML, JS, CSS)
- `content/` — Content scripts for table detection and analysis
- `background/` — Background service worker
- `test-data.html` — Sample data for testing
- `README.md` — This file

## Technical Details
- **Data Processing**: Handles up to 10,000 work orders efficiently
- **Date Formats**: Supports MM/DD/YYYY, YYYY-MM-DD, MM-DD-YYYY
- **Cost Parsing**: Handles currency symbols and commas
- **Browser Compatibility**: Chrome, Edge, and other Chromium-based browsers
- **Performance**: Runs on-demand to avoid slowing down web pages

## Roadmap
- [ ] Export functionality (CSV, PDF)
- [ ] Date range filtering
- [ ] Equipment type categorization
- [ ] Advanced charting options
- [ ] Historical trend analysis

---

*Developed for local, secure, and fast work order analysis.* 