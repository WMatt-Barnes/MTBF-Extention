# MTBF Work Order Analyzer - Installation Guide

## 🚀 **Quick Installation (No Developer Mode Required)**

### **Option 1: Chrome Web Store (Recommended)**
1. Visit the Chrome Web Store (when published)
2. Click "Add to Chrome"
3. Confirm installation

### **Option 2: Manual Installation**

#### **Step 1: Download the Extension**
1. Download `MTBF-Extension-Distribution.zip` from this repository
2. Extract the ZIP file to a folder on your computer

#### **Step 2: Install in Chrome**
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the extracted folder containing the extension
5. The extension will appear in your extensions list

#### **Step 3: Use the Extension**
1. Navigate to any CMMS page with work order tables
2. Click the MTBF Work Order Analyzer extension icon
3. Click "Scan Page for Work Orders"
4. View the analysis results

## 📋 **System Requirements**
- Google Chrome (version 88 or later)
- Access to CMMS pages with work order tables
- JavaScript enabled

## 🔧 **Troubleshooting**

### **Extension Not Loading**
- Ensure all files are extracted properly
- Check that `manifest.json` is in the root folder
- Verify Chrome version compatibility

### **No Tables Found**
- Make sure the page contains HTML tables
- Check that tables have proper headers
- Verify the page has loaded completely

### **Permission Issues**
- The extension only reads table data from web pages
- No personal data is collected or transmitted
- All analysis is performed locally in your browser

## 📞 **Support**
For issues or questions, please create an issue on the GitHub repository.

## 🔒 **Privacy & Security**
- **Local Analysis Only:** All calculations happen in your browser
- **No Data Collection:** No work order data is sent to external servers
- **Open Source:** Full transparency of code and functionality 