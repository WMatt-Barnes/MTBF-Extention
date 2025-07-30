// popup.js - Popup logic for MTBF Work Order Analyzer

let currentAnalysis = null;
let allWorkOrders = null;

// Initialize popup when DOM is ready
function initializePopup() {
  // Scan button
  const scanBtn = document.getElementById('scan-btn');
  
  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'injectContentScript' }, (injectionResponse) => {
        if (injectionResponse && injectionResponse.success) {
          setTimeout(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (!tabs[0] || !tabs[0].id) {
                return;
              }
              
              chrome.tabs.sendMessage(tabs[0].id, { action: 'scanTables' }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error('Could not scan tables:', chrome.runtime.lastError.message);
                  return;
                }
                
                if (response && response.success && response.analysis) {
                  currentAnalysis = response.analysis;
                  allWorkOrders = response.analysis.workOrders;
                  
                  updateSummary(response.analysis);
                  createParetoChart(response.analysis);
                  
                  document.getElementById('summary-section').style.display = 'block';
                  document.getElementById('pareto-section').style.display = 'block';
                  
                  updateEquipmentFilter(response.analysis);
                  
                  document.getElementById('column-mapping-section').style.display = 'none';
                  
                  // Show table processing info
                  if (response.analysis.summary.processedTables) {
                    console.log(`Processed ${response.analysis.summary.processedTables} tables with work order data`);
                  }
                  
                } else if (response && response.tables && response.tables.length > 0) {
                  showColumnMapping(response.tables, response.mapping || {});
                } else {
                  console.log('No work order tables found on this page.');
                }
              });
            });
          }, 100);
        } else {
          console.error('Failed to inject content script:', injectionResponse?.error || 'Unknown error');
        }
      });
    });
  }
}

// Format number with commas
function formatNumber(num) {
  return num.toLocaleString();
}

// Format hours to readable format
function formatHours(hours) {
  if (hours < 24) {
    return `${hours.toFixed(1)} hours`;
  } else if (hours < 8760) {
    return `${(hours / 24).toFixed(1)} days`;
  } else {
    return `${(hours / 8760).toFixed(1)} years`;
  }
}

// Update summary section with analysis results
function updateSummary(analysis) {
  const summary = analysis.summary;
  
  // Update main metrics
  document.getElementById('mtbf-value').textContent = formatHours(summary.mtbf);
  document.getElementById('failure-rate-value').textContent = summary.failureRate.toFixed(2);
  document.getElementById('avg-cost-value').textContent = formatNumber(summary.averageCost);
  document.getElementById('total-wo-value').textContent = summary.totalWorkOrders;
  
  // Update CM/PM breakdown
  document.getElementById('cm-count').textContent = summary.cmCount;
  document.getElementById('pm-count').textContent = summary.pmCount;
  
  // Show warning if only PM work orders found
  if (summary.cmCount === 0 && summary.pmCount > 0) {
    const warning = document.createElement('div');
    warning.style.color = 'orange';
    warning.style.fontWeight = 'bold';
    warning.textContent = '⚠️ Only preventative work orders found. MTBF calculation may not be accurate.';
    document.getElementById('summary-section').insertBefore(warning, document.getElementById('summary-section').firstChild);
  }
  
  // Update top equipment lists
  const equipmentByCount = Object.entries(analysis.equipmentStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
    
  const equipmentByCost = Object.entries(analysis.equipmentStats)
    .sort((a, b) => b[1].totalCost - a[1].totalCost)
    .slice(0, 10);
  
  const countList = document.getElementById('top-equipment-list');
  const costList = document.getElementById('top-cost-equipment-list');
  
  countList.innerHTML = '';
  costList.innerHTML = '';
  
  equipmentByCount.forEach(([equipment, stats]) => {
    const li = document.createElement('li');
    li.textContent = `${equipment} (${stats.count} work orders)`;
    countList.appendChild(li);
  });
  
  equipmentByCost.forEach(([equipment, stats]) => {
    const li = document.createElement('li');
    li.textContent = `${equipment} ($${formatNumber(stats.totalCost)})`;
    costList.appendChild(li);
  });
}

// Create simple Pareto chart
function createParetoChart(analysis) {
  const canvas = document.getElementById('pareto-canvas');
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Get top 10 equipment by count
  const topEquipment = Object.entries(analysis.equipmentStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  
  if (topEquipment.length === 0) return;
  
  const maxCount = Math.max(...topEquipment.map(([_, stats]) => stats.count));
  const chartWidth = canvas.width - 80; // More padding for labels
  const chartHeight = canvas.height - 80;
  const barWidth = chartWidth / topEquipment.length;
  
  // Draw bars
  ctx.fillStyle = '#4CAF50';
  topEquipment.forEach(([equipment, stats], index) => {
    const barHeight = (stats.count / maxCount) * chartHeight;
    const x = 40 + (index * barWidth);
    const y = canvas.height - 40 - barHeight;
    
    ctx.fillRect(x, y, barWidth - 4, barHeight);
    
    // Draw count on top of bar
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(stats.count.toString(), x + barWidth/2, y - 5);
    
    // Draw equipment name (truncated)
    ctx.font = '10px Arial';
    const displayName = equipment.length > 12 ? equipment.substring(0, 12) + '...' : equipment;
    ctx.fillText(displayName, x + barWidth/2, canvas.height - 15);
    ctx.fillStyle = '#4CAF50';
  });
  
  // Draw Y-axis label
  ctx.save();
  ctx.translate(20, canvas.height/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Work Order Count', 0, 0);
  ctx.restore();
}

// Show column mapping interface
function showColumnMapping(tables, mapping) {
  document.getElementById('column-mapping-section').style.display = 'block';
  document.getElementById('summary-section').style.display = 'none';
  document.getElementById('pareto-section').style.display = 'none';
  
  const form = document.getElementById('column-mapping-form');
  form.innerHTML = '';
  
  // Create mapping inputs
  const fields = ['equipment', 'date', 'cost', 'workType'];
  const fieldLabels = ['Equipment', 'Date', 'Cost', 'Work Type'];
  
  fields.forEach((field, index) => {
    const div = document.createElement('div');
    div.className = 'form-group';
    
    const label = document.createElement('label');
    label.textContent = fieldLabels[index] + ' Column:';
    
    const select = document.createElement('select');
    select.id = `mapping-${field}`;
    
    // Add options for each table column
    if (tables[0] && tables[0].headers) {
      tables[0].headers.forEach((header, colIndex) => {
        const option = document.createElement('option');
        option.value = colIndex;
        option.textContent = header;
        if (mapping[field] === colIndex) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    }
    
    div.appendChild(label);
    div.appendChild(select);
    form.appendChild(div);
  });
  
  // Add apply button
  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.textContent = 'Apply Mapping';
  applyBtn.addEventListener('click', () => {
    const newMapping = {};
    fields.forEach(field => {
      const select = document.getElementById(`mapping-${field}`);
      newMapping[field] = parseInt(select.value);
    });
    
    // Re-analyze with new mapping
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'analyzeWithMapping', 
        mapping: newMapping 
      }, (response) => {
        if (response && response.success && response.analysis) {
          currentAnalysis = response.analysis;
          allWorkOrders = response.analysis.workOrders;
          
          updateSummary(response.analysis);
          createParetoChart(response.analysis);
          
          document.getElementById('summary-section').style.display = 'block';
          document.getElementById('pareto-section').style.display = 'block';
          document.getElementById('column-mapping-section').style.display = 'none';
          
          updateEquipmentFilter(response.analysis);
        }
      });
    });
  });
  
  form.appendChild(applyBtn);
}

// Update equipment filter dropdown
function updateEquipmentFilter(analysis) {
  const filter = document.getElementById('equipment-filter');
  const equipment = [...new Set(analysis.workOrders.map(wo => wo.equipment))].sort();
  
  filter.innerHTML = '<option value="">Select Equipment</option>';
  equipment.forEach(eq => {
    const option = document.createElement('option');
    option.value = eq;
    option.textContent = eq;
    filter.appendChild(option);
  });
  
  // Add event listeners for filter buttons
  const applyFilterBtn = document.getElementById('apply-filter-btn');
  const clearFilterBtn = document.getElementById('clear-filter-btn');
  
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', applyEquipmentFilter);
  }
  
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', clearEquipmentFilter);
  }
}

// Filter work orders by equipment
function filterByEquipment(equipment) {
  if (!allWorkOrders || !equipment) {
    return allWorkOrders;
  }
  return allWorkOrders.filter(wo => wo.equipment === equipment);
}

// Calculate filtered statistics
function calculateFilteredStats(filteredWorkOrders) {
  if (!filteredWorkOrders || filteredWorkOrders.length === 0) {
    return null;
  }
  
  // Separate CM and PM work orders
  const cmWorkOrders = filteredWorkOrders.filter(wo => wo.workType.includes('CM'));
  const pmWorkOrders = filteredWorkOrders.filter(wo => wo.workType.includes('PM'));
  
  // Calculate MTBF using only CM work orders
  let mtbf = 0;
  let failureRate = 0;
  let note = null;
  
  if (cmWorkOrders.length === 0) {
    note = "No corrective maintenance work orders found. MTBF cannot be calculated.";
  } else if (cmWorkOrders.length === 1) {
    note = "Single CM work order - insufficient data for MTBF calculation";
  } else {
    const sortedCMWorkOrders = cmWorkOrders.sort((a, b) => a.date - b.date);
    const firstDate = sortedCMWorkOrders[0].date;
    const lastDate = sortedCMWorkOrders[sortedCMWorkOrders.length - 1].date;
    
    const totalTimeSpan = (lastDate - firstDate) / (1000 * 60 * 60);
    
    if (totalTimeSpan <= 0) {
      note = "Invalid date range for CM work orders";
    } else {
      mtbf = totalTimeSpan / (sortedCMWorkOrders.length - 1);
      failureRate = sortedCMWorkOrders.length / (totalTimeSpan / 8760);
    }
  }
  
  return {
    mtbf,
    failureRate,
    totalWorkOrders: filteredWorkOrders.length,
    cmCount: cmWorkOrders.length,
    pmCount: pmWorkOrders.length,
    note,
    isPMOnly: cmWorkOrders.length === 0 && pmWorkOrders.length > 0
  };
}

// Apply equipment filter
function applyEquipmentFilter() {
  const selectedEquipment = document.getElementById('equipment-filter').value;
  const filteredResults = document.getElementById('filtered-results');
  
  if (!selectedEquipment) {
    filteredResults.style.display = 'none';
    return;
  }
  
  const filteredWorkOrders = filterByEquipment(selectedEquipment);
  const filteredStats = calculateFilteredStats(filteredWorkOrders);
  
  if (filteredStats) {
    // Update work order count
    document.getElementById('filtered-total-wo').textContent = filteredStats.totalWorkOrders;
    
    // Update CM/PM breakdown
    document.getElementById('filtered-cm-count').textContent = filteredStats.cmCount;
    document.getElementById('filtered-pm-count').textContent = filteredStats.pmCount;
    
    // Show/hide PM-only warning
    const warningElement = document.getElementById('filtered-warning');
    if (filteredStats.isPMOnly) {
      warningElement.style.display = 'block';
    } else {
      warningElement.style.display = 'none';
    }
    
    if (filteredStats.note) {
      document.getElementById('filtered-mtbf-value').textContent = 'Insufficient Data';
      document.getElementById('filtered-failure-rate-value').textContent = 'Insufficient Data';
      
      let noteElement = document.getElementById('filtered-note');
      if (!noteElement) {
        noteElement = document.createElement('div');
        noteElement.id = 'filtered-note';
        noteElement.style.color = '#e74c3c';
        noteElement.style.fontSize = '12px';
        noteElement.style.marginTop = '8px';
        document.getElementById('filtered-results').appendChild(noteElement);
      }
      noteElement.textContent = filteredStats.note;
    } else {
      document.getElementById('filtered-mtbf-value').textContent = formatHours(filteredStats.mtbf);
      document.getElementById('filtered-failure-rate-value').textContent = filteredStats.failureRate.toFixed(2);
      
      const noteElement = document.getElementById('filtered-note');
      if (noteElement) {
        noteElement.remove();
      }
    }
    
    filteredResults.style.display = 'block';
  } else {
    filteredResults.style.display = 'none';
  }
}

// Clear equipment filter
function clearEquipmentFilter() {
  document.getElementById('equipment-filter').value = '';
  document.getElementById('filtered-results').style.display = 'none';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  initializePopup();
} 