# Self-Hosting Guide for MTBF Work Order Analyzer

## 🚀 **Option 3: Self-Hosting Distribution**

This guide shows how to distribute your browser extension without using the Chrome Web Store, perfect for internal company use or small-scale distribution.

## 📦 **Step 1: Prepare Distribution Package**

### **Create Distribution ZIP**
```bash
# In your project directory
zip -r MTBF-Extension-Distribution.zip . -x "*.git*" "*.DS_Store*" "node_modules/*"
```

### **Package Contents**
Your distribution ZIP should contain:
```
MTBF-Extension-Distribution.zip
├── manifest.json
├── background/
│   └── background.js
├── content/
│   └── content.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── assets/
│   └── icons/
│       ├── app_icon_16x16.png
│       ├── app_icon_32x32.png
│       ├── app_icon_48x48.png
│       ├── app_icon_64x64.png
│       ├── app_icon_128x128.png
│       └── app_icon_256x256.png
├── test-data.html
├── README.md
└── INSTALLATION.md
```

## 🌐 **Step 2: Host the Extension**

### **Option A: GitHub Pages (Free)**
1. **Create a new repository** for hosting
2. **Upload the ZIP file** to the repository
3. **Enable GitHub Pages** in repository settings
4. **Create a download page** with installation instructions

### **Option B: Your Own Web Server**
1. **Upload the ZIP file** to your web server
2. **Create a download page** with installation instructions
3. **Provide direct download links**

### **Option C: Company Intranet**
1. **Host on internal file server**
2. **Share via company network**
3. **Include in IT software catalog**

## 📋 **Step 3: Create Installation Instructions**

### **For End Users:**

#### **Method 1: Load Unpacked (Recommended)**
1. **Download** the `MTBF-Extension-Distribution.zip` file
2. **Extract** the ZIP file to a permanent folder (e.g., `C:\Extensions\MTBF-Analyzer\`)
3. **Open Chrome** and navigate to `chrome://extensions/`
4. **Enable "Developer mode"** (toggle in top-right corner)
5. **Click "Load unpacked"**
6. **Select the extracted folder** containing the extension
7. **Pin the extension** to your toolbar for easy access

#### **Method 2: Drag and Drop (Alternative)**
1. **Download and extract** the ZIP file
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable "Developer mode"**
4. **Drag the extracted folder** directly onto the extensions page
5. **Confirm installation** when prompted

## 🔧 **Step 4: Enterprise Deployment (Optional)**

### **For IT Administrators:**

#### **Group Policy Deployment**
1. **Package the extension** as a .crx file (requires Chrome Web Store)
2. **Configure Group Policy** to install the extension
3. **Deploy to all company computers**

#### **Chrome Enterprise Bundle**
1. **Create an enterprise bundle** with the extension
2. **Distribute via company software management**
3. **Automatic installation** for new computers

## 📝 **Step 5: Create Distribution Page**

### **Sample HTML Page:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>MTBF Work Order Analyzer - Download</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .download-btn { background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .instructions { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>MTBF Work Order Analyzer</h1>
    <p>Browser extension for analyzing CMMS work order data and calculating MTBF.</p>
    
    <a href="MTBF-Extension-Distribution.zip" class="download-btn">Download Extension</a>
    
    <div class="instructions">
        <h2>Installation Instructions</h2>
        <ol>
            <li>Download and extract the ZIP file</li>
            <li>Open Chrome and go to chrome://extensions/</li>
            <li>Enable "Developer mode"</li>
            <li>Click "Load unpacked" and select the extracted folder</li>
            <li>Pin the extension to your toolbar</li>
        </ol>
    </div>
    
    <h2>Features</h2>
    <ul>
        <li>Automatic work order table detection</li>
        <li>MTBF calculation using CM work orders</li>
        <li>Equipment filtering and analysis</li>
        <li>Pareto charts for equipment ranking</li>
        <li>Local analysis - no data sent to servers</li>
    </ul>
</body>
</html>
```

## 🔒 **Security Considerations**

### **For Enterprise Use:**
- **Code Review:** Have IT review the extension code
- **Virus Scanning:** Scan the ZIP file before distribution
- **Digital Signing:** Consider code signing for enterprise deployment
- **Version Control:** Track extension versions and updates

### **For Public Distribution:**
- **Open Source:** Code is available on GitHub for transparency
- **No Data Collection:** Extension doesn't send data anywhere
- **Local Processing:** All analysis happens in the user's browser

## 📞 **Support and Updates**

### **Version Management:**
1. **Update the extension** with new features
2. **Increment version** in `manifest.json`
3. **Create new distribution ZIP**
4. **Notify users** of updates
5. **Provide migration instructions**

### **User Support:**
- **Create documentation** for common issues
- **Provide contact information** for support
- **Maintain FAQ** section
- **Offer training** for new users

## 🎯 **Benefits of Self-Hosting**

### **Advantages:**
- ✅ **No Chrome Web Store fees** ($5 one-time fee)
- ✅ **No review process** (immediate distribution)
- ✅ **Full control** over distribution
- ✅ **Custom branding** and modifications
- ✅ **Internal company use** without public listing
- ✅ **Version control** and rollback capability

### **Considerations:**
- ⚠️ **Manual updates** required
- ⚠️ **No automatic installation** for new users
- ⚠️ **Limited discoverability** (no store listing)
- ⚠️ **User education** required for installation

## 🚀 **Quick Start Checklist**

- [ ] Create distribution ZIP file
- [ ] Host on web server or file sharing
- [ ] Create download page with instructions
- [ ] Test installation process
- [ ] Distribute to users
- [ ] Provide support contact information
- [ ] Plan update distribution process

This self-hosting approach gives you complete control over your extension's distribution while avoiding the Chrome Web Store's requirements and fees. 