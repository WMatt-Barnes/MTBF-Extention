// content.js - Content script for MTBF Work Order Analyzer

(function() {
  'use strict';
  
  // Prevent multiple injections
  if (window.MTBF_ANALYZER_LOADED) {
    return;
  }
  
  window.MTBF_ANALYZER_LOADED = true;

  // Column mapping patterns for automatic detection
  const COLUMN_PATTERNS = {
    equipment: ['equipment', 'equipment id', 'equipment number', 'asset', 'asset id', 'asset number', 'machine', 'machine id'],
    date: ['reported date', 'date', 'work order date', 'completion date', 'created date', 'start date'],
    cost: ['cost', 'total cost', 'labor cost', 'material cost', 'work order cost', 'actual cost'],
    workType: ['work type', 'type', 'maintenance type', 'wo type', 'order type', 'category']
  };

  // Automatic column mapping function
  function mapColumns(headers) {
    const mapping = {};
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    // Map equipment column
    for (const pattern of COLUMN_PATTERNS.equipment) {
      const index = lowerHeaders.findIndex(h => h.includes(pattern));
      if (index !== -1) {
        mapping.equipment = index;
        break;
      }
    }
    
    // Map date column
    for (const pattern of COLUMN_PATTERNS.date) {
      const index = lowerHeaders.findIndex(h => h.includes(pattern));
      if (index !== -1) {
        mapping.date = index;
        break;
      }
    }
    
    // Map cost column
    for (const pattern of COLUMN_PATTERNS.cost) {
      const index = lowerHeaders.findIndex(h => h.includes(pattern));
      if (index !== -1) {
        mapping.cost = index;
        break;
      }
    }
    
    // Map work type column
    for (const pattern of COLUMN_PATTERNS.workType) {
      const index = lowerHeaders.findIndex(h => h.includes(pattern));
      if (index !== -1) {
        mapping.workType = index;
        break;
      }
    }
    
    return mapping;
  }

  // Parse date string to Date object
  function parseDate(dateStr) {
    if (!dateStr) {
      return null;
    }
    
    // Try common date formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,   // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/,   // MM-DD-YYYY
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format.source.includes('YYYY')) {
          return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
        } else {
          return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
        }
      }
    }
    
    return new Date(dateStr); // Fallback
  }

  // Parse cost string to number
  function parseCost(costStr) {
    if (!costStr) return 0;
    return parseFloat(costStr.replace(/[$,]/g, '')) || 0;
  }

  // Analyze work order data
  function analyzeWorkOrders(tableData, mapping) {
    const workOrders = [];
    const equipmentStats = {};
    let totalCost = 0;
    let cmCount = 0;
    let pmCount = 0;
    let pdmCount = 0;
    
    // Process each row
    for (const row of tableData.rows) {
      if (row.length < Math.max(...Object.values(mapping))) continue;
      
      const equipment = row[mapping.equipment] || 'Unknown';
      const dateStr = row[mapping.date] || '';
      const cost = parseCost(row[mapping.cost] || '0');
      const workType = (row[mapping.workType] || '').toUpperCase();
      
      const date = parseDate(dateStr);
      if (!date) {
        continue;
      }
      
      workOrders.push({
        equipment,
        date: date.getTime(), // Store as timestamp number instead of Date object
        cost,
        workType
      });
      
      // Update equipment statistics
      if (!equipmentStats[equipment]) {
        equipmentStats[equipment] = {
          count: 0,
          totalCost: 0,
          firstDate: date,
          lastDate: date
        };
      }
      
      equipmentStats[equipment].count++;
      equipmentStats[equipment].totalCost += cost;
      equipmentStats[equipment].firstDate = new Date(Math.min(equipmentStats[equipment].firstDate, date));
      equipmentStats[equipment].lastDate = new Date(Math.max(equipmentStats[equipment].lastDate, date));
      
      // Count work types
      if (workType.includes('CM')) cmCount++;
      else if (workType.includes('PM')) pmCount++;
      else if (workType.includes('PDM')) pdmCount++;
      
      totalCost += cost;
    }
    
    // Calculate MTBF for each equipment
    for (const equipment in equipmentStats) {
      const stats = equipmentStats[equipment];
      
      // Get CM work orders for this equipment
      const equipmentCMWorkOrders = workOrders.filter(wo => 
        wo.equipment === equipment && wo.workType.includes('CM')
      );
      
      if (equipmentCMWorkOrders.length > 1) {
        const sortedCMWorkOrders = equipmentCMWorkOrders.sort((a, b) => a.date - b.date);
        const timeSpan = (sortedCMWorkOrders[sortedCMWorkOrders.length - 1].date - sortedCMWorkOrders[0].date) / (1000 * 60 * 60);
        stats.mtbf = timeSpan / (equipmentCMWorkOrders.length - 1);
      } else {
        stats.mtbf = 0; // No CM work orders or insufficient data
      }
    }
    
    // Calculate overall statistics
    const sortedWorkOrders = workOrders.sort((a, b) => a.date - b.date);
    
    // Calculate MTBF using only CM work orders
    const cmWorkOrders = workOrders.filter(wo => wo.workType.includes('CM'));
    let overallMTBF = 0;
    let failureRate = 0;
    let totalTimeSpan = 0;
    
    if (cmWorkOrders.length > 1) {
      const sortedCMWorkOrders = cmWorkOrders.sort((a, b) => a.date - b.date);
      totalTimeSpan = (sortedCMWorkOrders[sortedCMWorkOrders.length - 1].date - sortedCMWorkOrders[0].date) / (1000 * 60 * 60);
      overallMTBF = totalTimeSpan / (cmWorkOrders.length - 1);
      failureRate = cmWorkOrders.length / (totalTimeSpan / 8760); // failures per year (8760 hours)
    }
    
    return {
      workOrders,
      equipmentStats,
      summary: {
        totalWorkOrders: workOrders.length,
        totalCost,
        averageCost: workOrders.length > 0 ? totalCost / workOrders.length : 0,
        mtbf: overallMTBF,
        failureRate,
        cmCount,
        pmCount,
        pdmCount,
        timeSpan: totalTimeSpan
      }
    };
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.action === 'scanTables') {
      try {
        const tables = Array.from(document.querySelectorAll('table'));
        
        const tableData = tables.map(table => {
          const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
          const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
          );
          return { headers, rows };
        });
        
        // Process all tables and combine work orders
        let allWorkOrders = [];
        let allEquipmentStats = {};
        let totalCost = 0;
        let cmCount = 0;
        let pmCount = 0;
        let pdmCount = 0;
        let processedTables = [];
        
        for (let i = 0; i < tableData.length; i++) {
          const table = tableData[i];
          if (table.headers.length >= 3) { // Minimum columns needed
            const mapping = mapColumns(table.headers);
            if (mapping.equipment !== undefined && mapping.date !== undefined) {
              const tableAnalysis = analyzeWorkOrders(table, mapping);
              if (tableAnalysis && tableAnalysis.workOrders.length > 0) {
                // Combine work orders
                allWorkOrders = allWorkOrders.concat(tableAnalysis.workOrders);
                
                // Combine equipment stats
                for (const [equipment, stats] of Object.entries(tableAnalysis.equipmentStats)) {
                  if (!allEquipmentStats[equipment]) {
                    allEquipmentStats[equipment] = {
                      count: 0,
                      totalCost: 0,
                      firstDate: stats.firstDate,
                      lastDate: stats.lastDate
                    };
                  }
                  allEquipmentStats[equipment].count += stats.count;
                  allEquipmentStats[equipment].totalCost += stats.totalCost;
                  allEquipmentStats[equipment].firstDate = new Date(Math.min(allEquipmentStats[equipment].firstDate, stats.firstDate));
                  allEquipmentStats[equipment].lastDate = new Date(Math.max(allEquipmentStats[equipment].lastDate, stats.lastDate));
                }
                
                // Update counts
                cmCount += tableAnalysis.summary.cmCount;
                pmCount += tableAnalysis.summary.pmCount;
                pdmCount += tableAnalysis.summary.pdmCount;
                totalCost += tableAnalysis.summary.totalCost;
                
                processedTables.push({
                  index: i,
                  mapping: mapping,
                  workOrderCount: tableAnalysis.workOrders.length
                });
              }
            }
          }
        }
        
        // Calculate overall statistics from combined data
        let analysis = null;
        if (allWorkOrders.length > 0) {
          const sortedWorkOrders = allWorkOrders.sort((a, b) => a.date - b.date);
          const totalTimeSpan = sortedWorkOrders.length > 1 ? 
            (sortedWorkOrders[sortedWorkOrders.length - 1].date - sortedWorkOrders[0].date) / (1000 * 60 * 60) : 0;
          const overallMTBF = totalTimeSpan / Math.max(allWorkOrders.length - 1, 1);
          const failureRate = allWorkOrders.length / (totalTimeSpan / 8760); // failures per year (8760 hours)
          
          // Recalculate MTBF for each equipment
          for (const equipment in allEquipmentStats) {
            const stats = allEquipmentStats[equipment];
            const timeSpan = (stats.lastDate - stats.firstDate) / (1000 * 60 * 60); // hours
            stats.mtbf = timeSpan / Math.max(stats.count - 1, 1); // MTBF in hours
          }
          
          analysis = {
            workOrders: allWorkOrders,
            equipmentStats: allEquipmentStats,
            summary: {
              totalWorkOrders: allWorkOrders.length,
              totalCost,
              averageCost: allWorkOrders.length > 0 ? totalCost / allWorkOrders.length : 0,
              mtbf: overallMTBF,
              failureRate,
              cmCount,
              pmCount,
              pdmCount,
              timeSpan: totalTimeSpan,
              processedTables: processedTables.length
            }
          };
        }
        
        sendResponse({ 
          tables: tableData,
          analysis,
          mapping: processedTables.length > 0 ? processedTables[0].mapping : null,
          success: analysis !== null
        });
      } catch (error) {
        sendResponse({ 
          error: error.message,
          success: false 
        });
      }
    }
    
    if (request.action === 'analyzeWithMapping') {
      try {
        const { tableIndex, customMapping } = request;
        const tables = Array.from(document.querySelectorAll('table'));
        const tableData = tables.map(table => {
          const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
          const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
          );
          return { headers, rows };
        });
        
        const table = tableData[tableIndex];
        const analysis = analyzeWorkOrders(table, customMapping);
        sendResponse({ analysis, success: true });
      } catch (error) {
        sendResponse({ 
          error: error.message,
          success: false 
        });
      }
    }
    
    return true;
  });
})(); 