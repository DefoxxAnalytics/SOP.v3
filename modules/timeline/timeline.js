/**
 * Interactive Timeline Module
 * Visual Gantt chart for vendor spend analysis project phases
 * Version: 3.0.0
 */

class TimelineModule {
    constructor() {
        this.name = 'Timeline';
        this.version = '1.0.0';
        this.app = null;
        this.container = null;
        this.isSimulating = false;
        this.simulationDay = 1;
        this.simulationInterval = null;
        this.phases = null;
    }

    async init(app) {
        console.log('Timeline module initializing...');
        this.app = app;
        this.phases = this.getPhaseData();
        this.render();
        this.attachEventListeners();
        return this;
    }

    getPhaseData() {
        return [
            {
                id: 'initiation',
                name: 'Project Initiation',
                stream: 'A',
                start: 1,
                end: 2,
                color: '#2563eb',
                tasks: ['Team assembly', 'Tool setup', 'Kickoff meeting']
            },
            {
                id: 'data-collection',
                name: 'Data Collection',
                stream: 'A',
                start: 2,
                end: 7,
                color: '#3b82f6',
                tasks: ['Template distribution', 'Data gathering', 'Initial validation']
            },
            {
                id: 'quality-assessment',
                name: 'Quality Assessment',
                stream: 'A',
                start: 6,
                end: 9,
                color: '#f59e0b',
                tasks: ['Completeness analysis', 'Integrity validation', 'Gap identification']
            },
            {
                id: 'data-cleansing',
                name: 'Data Cleansing',
                stream: 'A',
                start: 8,
                end: 12,
                color: '#10b981',
                tasks: ['Vendor normalization', 'Standardization', 'Deduplication']
            },
            {
                id: 'categorization',
                name: 'Categorization',
                stream: 'A',
                start: 10,
                end: 20,
                color: '#ef4444',
                critical: true,
                tasks: ['5-level taxonomy', 'Vendor classification', 'Validation']
            },
            {
                id: 'dashboard-dev',
                name: '📊 Dashboard Development',
                stream: 'B1',
                start: 8,
                end: 20,
                color: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                pattern: 'none',
                tasks: ['Power BI development', 'Testing', 'Optimization']
            },
            {
                id: 'powerpoint',
                name: '📑 PowerPoint Creation',
                stream: 'B2',
                start: 8,
                end: 20,
                color: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                pattern: 'diagonal',
                tasks: ['Slide design', 'Data visualization', 'Narrative development']
            },
            {
                id: 'quality-monitoring',
                name: 'Quality Monitoring',
                stream: 'C',
                start: 1,
                end: 22,
                color: '#06b6d4',
                tasks: ['Continuous monitoring', 'Quality gates', 'Issue resolution']
            },
            {
                id: 'delivery',
                name: 'Delivery & Handover',
                stream: 'A',
                start: 21,
                end: 22,
                color: '#22c55e',
                tasks: ['Publishing', 'Training', 'Documentation']
            }
        ];
    }

    render() {
        const content = `
            <div class="timeline-module">
                <div class="timeline-header">
                    <h2>Interactive Project Timeline</h2>
                    <p>22-Day Vendor Spend Analysis Project with Parallel Processing</p>
                </div>
                
                <div class="timeline-controls">
                    <button id="simulateBtn" class="btn btn-primary">
                        <i class="fas fa-play"></i> Start Simulation
                    </button>
                    <button id="resetBtn" class="btn btn-secondary">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                    <div class="simulation-info">
                        <span class="day-label">Day: <span id="currentDay">1</span>/22</span>
                        <span class="status-label">Status: <span id="currentStatus">Ready</span></span>
                    </div>
                </div>

                <div class="timeline-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background: #3b82f6;"></span>
                        <span>Stream A: Data Pipeline</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: linear-gradient(135deg, #8b5cf6, #a78bfa);"></span>
                        <span>📊 Dashboard (B1)</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color diagonal-pattern" style="background: linear-gradient(135deg, #6366f1, #818cf8);"></span>
                        <span>📑 PowerPoint (B2)</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #06b6d4;"></span>
                        <span>Stream C: Quality</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color critical" style="background: #ef4444;"></span>
                        <span>Critical Path</span>
                    </div>
                </div>

                <div class="timeline-container">
                    <div class="timeline-chart">
                        <div class="timeline-grid">
                            ${this.renderGrid()}
                        </div>
                        <div class="timeline-phases">
                            ${this.renderPhases()}
                        </div>
                        <div class="timeline-progress" id="progressLine" style="left: 0;"></div>
                    </div>
                </div>

                <div class="phase-details" id="phaseDetails">
                    <h3>Phase Information</h3>
                    <p>Click on any phase to see details</p>
                </div>

                <div class="timeline-metrics">
                    <div class="metric-card">
                        <div class="metric-value">3</div>
                        <div class="metric-label">Parallel Streams</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">40%</div>
                        <div class="metric-label">Time Savings</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">6</div>
                        <div class="metric-label">Quality Gates</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">22</div>
                        <div class="metric-label">Total Days</div>
                    </div>
                </div>
            </div>
        `;

        // Create container div
        const timelineDiv = document.createElement('div');
        timelineDiv.className = 'timeline-wrapper';
        timelineDiv.innerHTML = content;
        this.container = timelineDiv;
        
        // Try to insert into overview section first
        let targetSection = document.querySelector('#overview .section-body');
        
        // If overview doesn't exist, create a fallback container
        if (!targetSection) {
            targetSection = document.querySelector('.content-area');
            if (!targetSection) {
                targetSection = document.querySelector('main');
                if (!targetSection) {
                    // Create a main element if nothing exists
                    const main = document.createElement('main');
                    main.className = 'content-area';
                    document.body.appendChild(main);
                    targetSection = main;
                }
            }
        }
        
        if (targetSection) {
            targetSection.appendChild(this.container);
            console.log('Timeline rendered successfully');
        } else {
            console.error('Could not find target section for timeline');
        }
    }

    renderGrid() {
        let grid = '<div class="grid-days">';
        for (let day = 1; day <= 22; day++) {
            grid += `<div class="grid-day">${day}</div>`;
        }
        grid += '</div>';
        return grid;
    }

    renderPhases() {
        const streams = { A: [], B1: [], B2: [], C: [] };
        
        this.phases.forEach(phase => {
            streams[phase.stream].push(phase);
        });

        let html = '';
        
        // Stream A
        html += `<div class="timeline-stream" data-stream="A">`;
        html += `<div class="stream-label">Stream A</div>`;
        html += '<div class="stream-phases">';
        streams.A.forEach(phase => {
            html += this.renderPhaseBar(phase);
        });
        html += '</div></div>';
        
        // Stream B (split into B1 and B2 sub-streams)
        html += `<div class="timeline-stream stream-b-container" data-stream="B">`;
        html += `<div class="stream-label">Stream B</div>`;
        html += '<div class="stream-phases-split">';
        
        // B1 sub-stream (Dashboard)
        html += '<div class="sub-stream sub-stream-b1">';
        streams.B1.forEach(phase => {
            html += this.renderPhaseBar(phase, 'sub-stream-bar');
        });
        html += '</div>';
        
        // B2 sub-stream (PowerPoint)
        html += '<div class="sub-stream sub-stream-b2">';
        streams.B2.forEach(phase => {
            html += this.renderPhaseBar(phase, 'sub-stream-bar with-pattern');
        });
        html += '</div>';
        
        // Add sync indicator
        html += '<div class="sync-indicator" style="left: calc(8/22 * 100% - 1%);">⚡ Synchronized Development</div>';
        
        html += '</div></div>';
        
        // Stream C
        html += `<div class="timeline-stream" data-stream="C">`;
        html += `<div class="stream-label">Stream C</div>`;
        html += '<div class="stream-phases">';
        streams.C.forEach(phase => {
            html += this.renderPhaseBar(phase);
        });
        html += '</div></div>';
        
        return html;
    }
    
    renderPhaseBar(phase, additionalClass = '') {
        const width = ((phase.end - phase.start + 1) / 22) * 100;
        const left = ((phase.start - 1) / 22) * 100;
        const criticalClass = phase.critical ? 'critical' : '';
        const patternClass = phase.pattern === 'diagonal' ? 'diagonal-pattern' : '';
        
        // Handle gradient or solid color
        const backgroundStyle = phase.color.includes('gradient') 
            ? `background: ${phase.color};` 
            : `background-color: ${phase.color};`;
        
        return `
            <div class="phase-bar ${criticalClass} ${additionalClass} ${patternClass}" 
                 data-phase="${phase.id}"
                 style="left: ${left}%; width: ${width}%; ${backgroundStyle}"
                 title="${phase.name} (Days ${phase.start}-${phase.end})">
                <span class="phase-name">${phase.name}</span>
            </div>
        `;
    }

    attachEventListeners() {
        if (!this.container) {
            console.error('Timeline container not initialized');
            return;
        }
        
        // Simulation controls
        const simulateBtn = this.container.querySelector('#simulateBtn');
        const resetBtn = this.container.querySelector('#resetBtn');
        
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => this.toggleSimulation());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSimulation());
        }

        // Phase click handlers
        const phaseBars = this.container.querySelectorAll('.phase-bar');
        if (phaseBars) {
            phaseBars.forEach(bar => {
                bar.addEventListener('click', (e) => {
                    const phaseId = e.currentTarget.dataset.phase;
                    if (phaseId) {
                        this.showPhaseDetails(phaseId);
                    }
                });
            });
        }
    }

    toggleSimulation() {
        if (this.isSimulating) {
            this.pauseSimulation();
        } else {
            this.startSimulation();
        }
    }

    startSimulation() {
        this.isSimulating = true;
        const btn = this.container.querySelector('#simulateBtn');
        btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        this.simulationInterval = setInterval(() => {
            this.simulationDay++;
            if (this.simulationDay > 22) {
                this.simulationDay = 22;
                this.completeSimulation();
            } else {
                this.updateSimulation();
            }
        }, 500); // Update every 500ms
        
        this.updateSimulation();
    }

    pauseSimulation() {
        this.isSimulating = false;
        clearInterval(this.simulationInterval);
        const btn = this.container.querySelector('#simulateBtn');
        btn.innerHTML = '<i class="fas fa-play"></i> Resume';
    }

    resetSimulation() {
        this.isSimulating = false;
        clearInterval(this.simulationInterval);
        this.simulationDay = 1;
        
        const btn = this.container.querySelector('#simulateBtn');
        btn.innerHTML = '<i class="fas fa-play"></i> Start Simulation';
        
        this.updateSimulation();
    }

    updateSimulation() {
        // Update day counter
        this.container.querySelector('#currentDay').textContent = this.simulationDay;
        
        // Update progress line
        const progressLine = this.container.querySelector('#progressLine');
        const position = (this.simulationDay / 22) * 100;
        progressLine.style.left = `${position}%`;
        
        // Update status
        const status = this.getStatusForDay(this.simulationDay);
        const statusEl = this.container.querySelector('#currentStatus');
        statusEl.textContent = status.text;
        statusEl.className = `status-${status.type}`;
        
        // Highlight active phases
        this.highlightActivePhases();
    }

    completeSimulation() {
        this.pauseSimulation();
        const statusEl = this.container.querySelector('#currentStatus');
        statusEl.textContent = 'Complete! 🎉';
        statusEl.className = 'status-complete';
        
        // Show completion message
        this.app.eventBus.emit('notification', {
            type: 'success',
            message: 'Project simulation complete! All phases delivered successfully.'
        });
    }

    getStatusForDay(day) {
        if (day >= 1 && day <= 20) {
            return { text: 'On Track', type: 'success' };
        } else if (day === 21) {
            return { text: 'Finalizing', type: 'warning' };
        } else if (day === 22) {
            return { text: 'Complete!', type: 'complete' };
        }
        return { text: 'Ready', type: 'default' };
    }

    highlightActivePhases() {
        // Remove all active classes
        this.container.querySelectorAll('.phase-bar').forEach(bar => {
            bar.classList.remove('active', 'completed');
        });
        
        // Add appropriate classes based on current day
        this.phases.forEach(phase => {
            const phaseEl = this.container.querySelector(`[data-phase="${phase.id}"]`);
            if (phaseEl) {
                if (this.simulationDay >= phase.start && this.simulationDay <= phase.end) {
                    phaseEl.classList.add('active');
                } else if (this.simulationDay > phase.end) {
                    phaseEl.classList.add('completed');
                }
            }
        });
    }

    showPhaseDetails(phaseId) {
        const phase = this.phases.find(p => p.id === phaseId);
        if (!phase) return;
        
        const detailsEl = this.container.querySelector('#phaseDetails');
        detailsEl.innerHTML = `
            <h3>${phase.name}</h3>
            <div class="phase-info">
                <p><strong>Duration:</strong> Days ${phase.start}-${phase.end} (${phase.end - phase.start + 1} days)</p>
                <p><strong>Stream:</strong> ${phase.stream}</p>
                ${phase.critical ? '<p class="critical-flag">⚠️ <strong>Critical Path Phase</strong></p>' : ''}
                <p><strong>Key Activities:</strong></p>
                <ul>
                    ${phase.tasks.map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    unload() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
        if (this.container) {
            this.container.remove();
        }
        console.log('Timeline module unloaded');
    }
    
    destroy() {
        // Alias for unload
        this.unload();
    }
}

// Export an instance (singleton pattern)
export default new TimelineModule();