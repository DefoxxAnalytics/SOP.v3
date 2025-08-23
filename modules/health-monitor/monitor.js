/**
 * Health Monitor Dashboard Module
 * Real-time project health tracking and status indicators
 * Version: 1.0.0
 */

class HealthMonitor {
    constructor() {
        this.name = 'Health Monitor Dashboard';
        this.version = '1.0.0';
        this.app = null;
        this.container = null;
        this.metrics = {
            overall: 0,
            dataQuality: 0,
            timeline: 0,
            resources: 0,
            deliverables: 0
        };
        this.updateInterval = null;
    }

    async init(app) {
        console.log('Health Monitor initializing...');
        this.app = app;
        this.calculateMetrics();
        this.render();
        this.startMonitoring();
        return this;
    }

    calculateMetrics() {
        // Simulate real metrics calculation based on project data
        const currentDay = this.getCurrentProjectDay();
        const totalDays = 22;
        
        // Timeline health (based on project progress)
        const expectedProgress = (currentDay / totalDays) * 100;
        const actualProgress = this.getActualProgress();
        this.metrics.timeline = Math.max(0, 100 - Math.abs(expectedProgress - actualProgress));
        
        // Data quality health
        this.metrics.dataQuality = this.calculateDataQualityScore();
        
        // Resource health
        this.metrics.resources = this.calculateResourceHealth();
        
        // Deliverables health
        this.metrics.deliverables = this.calculateDeliverablesHealth();
        
        // Overall health (weighted average)
        this.metrics.overall = Math.round(
            (this.metrics.dataQuality * 0.3) +
            (this.metrics.timeline * 0.25) +
            (this.metrics.resources * 0.25) +
            (this.metrics.deliverables * 0.2)
        );
    }

    getCurrentProjectDay() {
        // Simulate current project day (would come from actual project data)
        return 12; // Mid-project
    }

    getActualProgress() {
        // Simulate actual progress percentage
        return 55; // Slightly behind schedule
    }

    calculateDataQualityScore() {
        // Simulate data quality metrics
        const completeness = 92;
        const accuracy = 88;
        const consistency = 95;
        return Math.round((completeness + accuracy + consistency) / 3);
    }

    calculateResourceHealth() {
        // Simulate resource availability
        const allocated = 85;
        const utilized = 78;
        return Math.round((allocated + utilized) / 2);
    }

    calculateDeliverablesHealth() {
        // Simulate deliverables status
        const completed = 8;
        const total = 11;
        return Math.round((completed / total) * 100);
    }

    render() {
        const content = `
            <div class="health-monitor-module">
                <div class="monitor-header">
                    <h2>📊 Project Health Monitor</h2>
                    <p>Real-time tracking of project vital signs</p>
                </div>

                <div class="health-summary">
                    <div class="overall-health-card">
                        <h3>Overall Health Score</h3>
                        <div class="health-score-display ${this.getHealthClass(this.metrics.overall)}">
                            <svg viewBox="0 0 200 200" class="health-gauge">
                                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="20"/>
                                <circle cx="100" cy="100" r="90" fill="none" 
                                        stroke="${this.getHealthColor(this.metrics.overall)}" 
                                        stroke-width="20"
                                        stroke-dasharray="${this.metrics.overall * 5.65} 565"
                                        stroke-dashoffset="0"
                                        transform="rotate(-90 100 100)"
                                        class="health-gauge-fill"/>
                            </svg>
                            <div class="health-score-text">
                                <span class="score-number">${this.metrics.overall}%</span>
                                <span class="score-label">${this.getHealthLabel(this.metrics.overall)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="metrics-grid">
                    ${this.renderMetricCard('Data Quality', this.metrics.dataQuality, '📊')}
                    ${this.renderMetricCard('Timeline', this.metrics.timeline, '⏱️')}
                    ${this.renderMetricCard('Resources', this.metrics.resources, '👥')}
                    ${this.renderMetricCard('Deliverables', this.metrics.deliverables, '📦')}
                </div>

                <div class="health-alerts">
                    <h3>⚠️ Active Alerts</h3>
                    <div class="alerts-list">
                        ${this.renderAlerts()}
                    </div>
                </div>

                <div class="health-trends">
                    <h3>📈 Health Trends</h3>
                    <div class="trends-chart">
                        ${this.renderTrendsChart()}
                    </div>
                </div>

                <div class="health-recommendations">
                    <h3>💡 Recommendations</h3>
                    <div class="recommendations-list">
                        ${this.renderHealthRecommendations()}
                    </div>
                </div>

                <div class="monitor-footer">
                    <button class="btn-refresh" onclick="window.healthMonitor.refresh()">
                        🔄 Refresh Metrics
                    </button>
                    <button class="btn-export" onclick="window.healthMonitor.exportReport()">
                        📄 Export Health Report
                    </button>
                </div>
            </div>
        `;

        // Create container
        const container = document.createElement('div');
        container.className = 'health-monitor-wrapper';
        container.innerHTML = content;
        this.container = container;

        // Insert into main content area
        let targetSection = document.querySelector('.content-area');
        if (!targetSection) {
            targetSection = document.querySelector('#content');
            if (!targetSection) {
                targetSection = document.querySelector('main');
            }
        }
        
        if (targetSection) {
            this.container.style.display = 'none';
            targetSection.appendChild(this.container);
            console.log('Health Monitor rendered');
        }
    }

    renderMetricCard(title, value, icon) {
        const healthClass = this.getHealthClass(value);
        const trend = this.getTrend(title);
        
        return `
            <div class="metric-card ${healthClass}">
                <div class="metric-header">
                    <span class="metric-icon">${icon}</span>
                    <span class="metric-title">${title}</span>
                </div>
                <div class="metric-value">
                    <span class="value-number">${value}%</span>
                    <span class="value-trend ${trend.class}">${trend.icon}</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-bar-fill" style="width: ${value}%"></div>
                </div>
                <div class="metric-status">${this.getHealthLabel(value)}</div>
            </div>
        `;
    }

    renderAlerts() {
        const alerts = this.generateAlerts();
        
        if (alerts.length === 0) {
            return '<p class="no-alerts">✅ No critical issues detected</p>';
        }
        
        return alerts.map(alert => `
            <div class="alert-item alert-${alert.severity}">
                <span class="alert-icon">${alert.icon}</span>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
                <button class="alert-action" onclick="window.healthMonitor.handleAlert('${alert.id}')">
                    Take Action
                </button>
            </div>
        `).join('');
    }

    generateAlerts() {
        const alerts = [];
        
        // Check for critical issues
        if (this.metrics.timeline < 70) {
            alerts.push({
                id: 'timeline-risk',
                severity: 'high',
                icon: '🔴',
                title: 'Timeline at Risk',
                message: 'Project is behind schedule. Consider resource reallocation.'
            });
        }
        
        if (this.metrics.dataQuality < 80) {
            alerts.push({
                id: 'data-quality',
                severity: 'medium',
                icon: '🟡',
                title: 'Data Quality Issues',
                message: 'Data completeness below threshold. Review data sources.'
            });
        }
        
        if (this.metrics.resources < 75) {
            alerts.push({
                id: 'resource-shortage',
                severity: 'medium',
                icon: '🟡',
                title: 'Resource Constraints',
                message: 'Resource utilization suboptimal. Check team availability.'
            });
        }
        
        return alerts;
    }

    renderTrendsChart() {
        // Simple SVG trend visualization
        const days = 7;
        const data = this.generateTrendData(days);
        const width = 600;
        const height = 200;
        const padding = 20;
        
        let svg = `
            <svg viewBox="0 0 ${width} ${height}" class="trends-svg">
                <!-- Grid lines -->
                ${this.renderGridLines(width, height, padding)}
                
                <!-- Trend lines -->
                ${this.renderTrendLine(data.overall, width, height, padding, '#00d4ff', 'Overall')}
                ${this.renderTrendLine(data.dataQuality, width, height, padding, '#10b981', 'Data')}
                ${this.renderTrendLine(data.timeline, width, height, padding, '#f59e0b', 'Timeline')}
                
                <!-- Legend -->
                <g transform="translate(${width - 150}, 20)">
                    <rect x="0" y="0" width="10" height="10" fill="#00d4ff"/>
                    <text x="15" y="9" fill="white" font-size="12">Overall</text>
                    
                    <rect x="0" y="20" width="10" height="10" fill="#10b981"/>
                    <text x="15" y="29" fill="white" font-size="12">Data</text>
                    
                    <rect x="0" y="40" width="10" height="10" fill="#f59e0b"/>
                    <text x="15" y="49" fill="white" font-size="12">Timeline</text>
                </g>
            </svg>
        `;
        
        return svg;
    }

    renderGridLines(width, height, padding) {
        let lines = '';
        const gridLines = 5;
        
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (height - 2 * padding) * i / gridLines;
            lines += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" 
                            stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
        }
        
        return lines;
    }

    renderTrendLine(data, width, height, padding, color, label) {
        const points = data.map((value, index) => {
            const x = padding + (width - 2 * padding) * index / (data.length - 1);
            const y = height - padding - (height - 2 * padding) * value / 100;
            return `${x},${y}`;
        }).join(' ');
        
        return `
            <polyline points="${points}" 
                      fill="none" 
                      stroke="${color}" 
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>
        `;
    }

    generateTrendData(days) {
        // Generate simulated trend data
        const overall = [];
        const dataQuality = [];
        const timeline = [];
        
        for (let i = 0; i < days; i++) {
            overall.push(75 + Math.random() * 20);
            dataQuality.push(85 + Math.random() * 10);
            timeline.push(70 + Math.random() * 25);
        }
        
        // Add current values
        overall.push(this.metrics.overall);
        dataQuality.push(this.metrics.dataQuality);
        timeline.push(this.metrics.timeline);
        
        return { overall, dataQuality, timeline };
    }

    renderHealthRecommendations() {
        const recommendations = this.generateRecommendations();
        
        return recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="rec-priority priority-${rec.priority}">
                    ${rec.priority.toUpperCase()}
                </div>
                <div class="rec-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <div class="rec-impact">
                        <span class="impact-label">Impact:</span>
                        <span class="impact-value">${rec.impact}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    generateRecommendations() {
        const recs = [];
        
        if (this.metrics.timeline < 80) {
            recs.push({
                priority: 'high',
                title: 'Accelerate Critical Path',
                description: 'Focus resources on categorization (Days 10-20) to get back on track.',
                impact: '+15% timeline improvement'
            });
        }
        
        if (this.metrics.dataQuality < 90) {
            recs.push({
                priority: 'medium',
                title: 'Improve Data Validation',
                description: 'Implement automated validation rules to catch quality issues early.',
                impact: '+10% quality score'
            });
        }
        
        if (this.metrics.resources < 85) {
            recs.push({
                priority: 'medium',
                title: 'Optimize Resource Allocation',
                description: 'Reallocate team members from completed phases to critical tasks.',
                impact: '+20% efficiency'
            });
        }
        
        // Always include a proactive recommendation
        recs.push({
            priority: 'low',
            title: 'Prepare for Delivery Phase',
            description: 'Start preparing delivery documentation and presentation materials.',
            impact: 'Smoother transition'
        });
        
        return recs;
    }

    getHealthClass(value) {
        if (value >= 90) return 'health-excellent';
        if (value >= 75) return 'health-good';
        if (value >= 60) return 'health-warning';
        return 'health-critical';
    }

    getHealthColor(value) {
        if (value >= 90) return '#10b981';
        if (value >= 75) return '#06b6d4';
        if (value >= 60) return '#f59e0b';
        return '#ef4444';
    }

    getHealthLabel(value) {
        if (value >= 90) return 'Excellent';
        if (value >= 75) return 'Good';
        if (value >= 60) return 'Needs Attention';
        return 'Critical';
    }

    getTrend(metric) {
        // Simulate trend data
        const random = Math.random();
        if (random > 0.7) return { icon: '↑', class: 'trend-up' };
        if (random < 0.3) return { icon: '↓', class: 'trend-down' };
        return { icon: '→', class: 'trend-stable' };
    }

    startMonitoring() {
        // Update metrics every 30 seconds
        this.updateInterval = setInterval(() => {
            this.refresh();
        }, 30000);
    }

    refresh() {
        console.log('Refreshing health metrics...');
        this.calculateMetrics();
        
        // Update display
        if (this.container) {
            // Update overall score
            const scoreDisplay = this.container.querySelector('.score-number');
            if (scoreDisplay) {
                scoreDisplay.textContent = this.metrics.overall + '%';
            }
            
            // Update gauge
            const gauge = this.container.querySelector('.health-gauge-fill');
            if (gauge) {
                gauge.setAttribute('stroke', this.getHealthColor(this.metrics.overall));
                gauge.setAttribute('stroke-dasharray', `${this.metrics.overall * 5.65} 565`);
            }
            
            // Re-render components
            const metricsGrid = this.container.querySelector('.metrics-grid');
            if (metricsGrid) {
                metricsGrid.innerHTML = 
                    this.renderMetricCard('Data Quality', this.metrics.dataQuality, '📊') +
                    this.renderMetricCard('Timeline', this.metrics.timeline, '⏱️') +
                    this.renderMetricCard('Resources', this.metrics.resources, '👥') +
                    this.renderMetricCard('Deliverables', this.metrics.deliverables, '📦');
            }
            
            // Update alerts
            const alertsList = this.container.querySelector('.alerts-list');
            if (alertsList) {
                alertsList.innerHTML = this.renderAlerts();
            }
        }
        
        // Show toast notification
        this.showToast('Health metrics updated', 'success');
    }

    handleAlert(alertId) {
        console.log(`Handling alert: ${alertId}`);
        
        // Navigate to relevant section based on alert
        if (alertId === 'timeline-risk') {
            // Show timeline module
            this.app.loadModule('timeline');
        } else if (alertId === 'data-quality') {
            // Navigate to data quality section
            window.location.hash = '#quality-assessment';
        }
        
        this.showToast('Navigating to relevant section...', 'info');
    }

    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            alerts: this.generateAlerts(),
            recommendations: this.generateRecommendations(),
            trends: this.generateTrendData(7)
        };
        
        // Create downloadable JSON
        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `health-report-${new Date().toLocaleDateString()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showToast('Health report exported successfully', 'success');
    }

    showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.refresh(); // Refresh metrics when shown
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    unload() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.container) {
            this.container.remove();
        }
        console.log('Health Monitor unloaded');
    }
}

// Export singleton instance
const healthMonitor = new HealthMonitor();
window.healthMonitor = healthMonitor; // For button onclick handlers
export default healthMonitor;