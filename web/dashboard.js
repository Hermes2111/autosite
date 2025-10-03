import { apiClient } from './apiClient.js';

export function setupDashboard(auth) {
  const dashboard = document.getElementById('sales-dashboard');
  const adminPanel = document.getElementById('admin-panel');
  
  if (!dashboard) return;

  let charts = {
    salesPerMonth: null,
    salesChannels: null,
    profitLoss: null
  };

  async function loadDashboard() {
    if (!auth.user || !auth.user.roles.includes('admin')) {
      dashboard.hidden = true;
      return;
    }

    try {
      const { items } = await apiClient.get('/diecast-models');
      const soldItems = items.filter(item => item.isSold);
      
      updateStatistics(soldItems);
      renderCharts(soldItems);
      renderSalesTable(soldItems);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  function updateStatistics(soldItems) {
    const totalSold = soldItems.length;
    const totalRevenue = soldItems.reduce((sum, item) => sum + (parseFloat(item.soldPrice) || 0), 0);
    const totalShipping = soldItems.reduce((sum, item) => sum + (parseFloat(item.shippingCost) || 0), 0);
    const totalOriginal = soldItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const totalProfit = totalRevenue - totalOriginal;

    document.getElementById('total-sold').textContent = totalSold;
    document.getElementById('total-revenue').textContent = totalRevenue.toFixed(2);
    document.getElementById('total-shipping').textContent = totalShipping.toFixed(2);
    
    const profitElement = document.getElementById('total-profit');
    profitElement.textContent = `€${totalProfit.toFixed(2)}`;
    profitElement.className = `stat-value profit-loss ${totalProfit >= 0 ? 'positive' : 'negative'}`;
  }

  function renderCharts(soldItems) {
    destroyCharts();
    
    // Sales per Month Chart
    renderSalesPerMonthChart(soldItems);
    
    // Sales Channels Chart
    renderSalesChannelsChart(soldItems);
    
    // Profit/Loss Chart
    renderProfitLossChart(soldItems);
    
    // Top Profitable List
    renderTopProfitable(soldItems);
  }

  function renderSalesPerMonthChart(soldItems) {
    const monthlyData = {};
    
    soldItems.forEach(item => {
      if (!item.soldDate) return;
      const date = new Date(item.soldDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, revenue: 0 };
      }
      
      monthlyData[monthKey].count++;
      monthlyData[monthKey].revenue += parseFloat(item.soldPrice) || 0;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(key => {
      const [year, month] = key.split('-');
      return new Date(year, month - 1).toLocaleDateString('nl-NL', { year: 'numeric', month: 'short' });
    });
    const counts = sortedMonths.map(key => monthlyData[key].count);
    const revenues = sortedMonths.map(key => monthlyData[key].revenue);

    const ctx = document.getElementById('sales-per-month-chart');
    if (!ctx) return;

    charts.salesPerMonth = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Aantal Verkopen',
            data: counts,
            backgroundColor: 'rgba(255, 221, 0, 0.6)',
            borderColor: 'rgba(255, 221, 0, 1)',
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Omzet (€)',
            data: revenues,
            backgroundColor: 'rgba(0, 151, 57, 0.6)',
            borderColor: 'rgba(0, 151, 57, 1)',
            borderWidth: 2,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: '#A0A0A0' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: '#A0A0A0' },
            grid: { drawOnChartArea: false }
          },
          x: {
            ticks: { color: '#A0A0A0' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#FFFFFF' }
          }
        }
      }
    });
  }

  function renderSalesChannelsChart(soldItems) {
    const channelData = {};
    
    soldItems.forEach(item => {
      const channel = item.salesChannel || 'Onbekend';
      channelData[channel] = (channelData[channel] || 0) + 1;
    });

    const labels = Object.keys(channelData);
    const data = Object.values(channelData);
    const colors = [
      'rgba(255, 221, 0, 0.8)',
      'rgba(0, 151, 57, 0.8)',
      'rgba(0, 61, 142, 0.8)',
      'rgba(231, 76, 60, 0.8)',
      'rgba(155, 89, 182, 0.8)',
      'rgba(52, 152, 219, 0.8)',
      'rgba(230, 126, 34, 0.8)'
    ];

    const ctx = document.getElementById('sales-channels-chart');
    if (!ctx) return;

    charts.salesChannels = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#121212',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#FFFFFF', padding: 15 }
          }
        }
      }
    });
  }

  function renderProfitLossChart(soldItems) {
    const profitData = soldItems.map(item => {
      const soldPrice = parseFloat(item.soldPrice) || 0;
      const originalPrice = parseFloat(item.price) || 0;
      const profit = soldPrice - originalPrice;
      return {
        name: item.what.substring(0, 20) + (item.what.length > 20 ? '...' : ''),
        profit: profit,
        soldPrice: soldPrice,
        originalPrice: originalPrice
      };
    }).sort((a, b) => a.profit - b.profit); // Sort from loss to profit

    const labels = profitData.map(d => d.name);
    const profits = profitData.map(d => d.profit);
    const colors = profits.map(p => p >= 0 ? 'rgba(0, 151, 57, 0.8)' : 'rgba(231, 76, 60, 0.8)');

    const ctx = document.getElementById('profit-loss-chart');
    if (!ctx) return;

    charts.profitLoss = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Winst/Verlies (€)',
          data: profits,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 2
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#A0A0A0' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            ticks: { color: '#A0A0A0' },
            grid: { display: false }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  function renderTopProfitable(soldItems) {
    const profitData = soldItems.map(item => {
      const soldPrice = parseFloat(item.soldPrice) || 0;
      const originalPrice = parseFloat(item.price) || 0;
      const profit = soldPrice - originalPrice;
      return {
        name: item.what,
        year: item.year,
        profit: profit,
        soldPrice: soldPrice,
        originalPrice: originalPrice
      };
    }).sort((a, b) => b.profit - a.profit).slice(0, 5);

    const container = document.getElementById('top-profitable-list');
    if (!container) return;

    if (profitData.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">Geen data beschikbaar</p>';
      return;
    }

    container.innerHTML = profitData.map((item, index) => `
      <div class="top-item">
        <div class="top-item-rank">#${index + 1}</div>
        <div class="top-item-info">
          <div class="top-item-name">${item.name}</div>
          <div class="top-item-year">${item.year}</div>
        </div>
        <div class="top-item-profit ${item.profit >= 0 ? 'positive' : 'negative'}">
          €${item.profit.toFixed(2)}
        </div>
      </div>
    `).join('');
  }

  function renderSalesTable(soldItems) {
    const tbody = document.getElementById('sales-table-body');
    if (!tbody) return;

    if (soldItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 40px;">Geen verkochte items gevonden</td></tr>';
      return;
    }

    const sortedItems = soldItems.sort((a, b) => {
      const dateA = a.soldDate ? new Date(a.soldDate) : new Date(0);
      const dateB = b.soldDate ? new Date(b.soldDate) : new Date(0);
      return dateB - dateA;
    });

    tbody.innerHTML = sortedItems.map(item => {
      const soldPrice = parseFloat(item.soldPrice) || 0;
      const originalPrice = parseFloat(item.price) || 0;
      const shipping = parseFloat(item.shippingCost) || 0;
      const profit = soldPrice - originalPrice;
      const soldDate = item.soldDate ? new Date(item.soldDate).toLocaleDateString('nl-NL') : '-';
      const channel = item.salesChannel || '-';
      
      return `
        <tr>
          <td>${soldDate}</td>
          <td><strong>${item.what}</strong></td>
          <td>${item.year}</td>
          <td>${item.soldTo || '-'}</td>
          <td>${item.soldLocation || '-'}</td>
          <td><span class="channel-badge ${channel.toLowerCase()}">${channel}</span></td>
          <td>€${originalPrice.toFixed(2)}</td>
          <td>€${soldPrice.toFixed(2)}</td>
          <td>€${shipping.toFixed(2)}</td>
          <td class="profit-cell ${profit >= 0 ? 'positive' : 'negative'}">€${profit.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  }

  function destroyCharts() {
    Object.values(charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    charts = {
      salesPerMonth: null,
      salesChannels: null,
      profitLoss: null
    };
  }

  function toggleDashboard() {
    const isDashboardVisible = !dashboard.hidden;
    dashboard.hidden = !isDashboardVisible;
    adminPanel.hidden = isDashboardVisible;
    
    if (isDashboardVisible) {
      loadDashboard();
    }
  }

  return {
    load: loadDashboard,
    toggle: toggleDashboard
  };
}

