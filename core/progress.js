/**
 * ProgressTracker - Manages checkbox state and progress calculation
 * Tracks all checkboxes across sections and persists state
 */

export class ProgressTracker {
    constructor(app) {
        this.app = app;
        this.checkboxStates = new Map();
        this.totalCheckboxes = 0;
        this.completedCheckboxes = 0;
        this.storageKey = 'checkbox_states';
        this.progressCallbacks = [];
        
        // Critical field IDs from Data Collection
        this.mustHaveFields = new Set([
            'field-1', // Transaction ID/Invoice Number
            'field-2', // Supplier Name and ID
            'field-3', // Spend Amount
            'field-4', // Transaction Date
            'field-6'  // Description (Product/Service)
        ]);
        
        // Categorization critical checkboxes (from categorization.json)
        this.categorizationCritical = new Set([
            'cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5' // Main categorization checkboxes
        ]);
        
        // Weight configuration for Smart Hybrid system
        this.weights = {
            dataCollectionMustHave: 0.25,  // 25% of total progress
            categorization: 0.20,           // 20% of total progress
            otherCheckboxes: 0.55           // 55% for all other checkboxes
        };
    }
    
    /**
     * Initialize progress tracker
     */
    init() {
        // Load saved states from storage
        this.loadStates();
        
        // Setup global checkbox listener
        this.setupGlobalListener();
        
        // Subscribe to section changes
        this.app.state.subscribe('currentSection', () => {
            // Delay to ensure DOM is ready
            setTimeout(() => this.scanCheckboxes(), 100);
        });
        
        console.log('✅ Progress tracker initialized');
    }
    
    /**
     * Load saved checkbox states from storage
     */
    loadStates() {
        const saved = this.app.storage.get(this.storageKey);
        if (saved && typeof saved === 'object') {
            // Convert object back to Map
            Object.entries(saved).forEach(([id, checked]) => {
                this.checkboxStates.set(id, checked);
                if (checked) this.completedCheckboxes++;
            });
            console.log(`📊 Loaded ${this.checkboxStates.size} checkbox states`);
        }
    }
    
    /**
     * Save checkbox states to storage
     */
    saveStates() {
        // Convert Map to object for storage
        const statesObj = {};
        this.checkboxStates.forEach((checked, id) => {
            statesObj[id] = checked;
        });
        
        this.app.storage.set(this.storageKey, statesObj);
    }
    
    /**
     * Setup global event listener for all checkboxes
     */
    setupGlobalListener() {
        // Use event delegation on document body
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.id) {
                this.handleCheckboxChange(e.target);
            }
        });
        
        // Also listen for click events on labels
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'LABEL' && e.target.getAttribute('for')) {
                // Let the change event handle this
                return;
            }
        });
    }
    
    /**
     * Scan current page for checkboxes and apply saved states
     */
    scanCheckboxes() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"][id]');
        let foundCount = 0;
        
        checkboxes.forEach(checkbox => {
            foundCount++;
            
            // Register checkbox if not already known
            if (!this.checkboxStates.has(checkbox.id)) {
                this.checkboxStates.set(checkbox.id, false);
            }
            
            // Apply saved state
            const savedState = this.checkboxStates.get(checkbox.id);
            if (savedState !== undefined) {
                checkbox.checked = savedState;
            }
            
            // Add visual feedback for checked items
            this.updateCheckboxVisuals(checkbox);
        });
        
        // Update total count
        this.totalCheckboxes = this.checkboxStates.size;
        
        // Trigger progress update
        this.updateProgress();
        
        console.log(`📋 Found ${foundCount} checkboxes on current page (${this.totalCheckboxes} total registered)`);
    }
    
    /**
     * Handle checkbox state change
     */
    handleCheckboxChange(checkbox) {
        const isChecked = checkbox.checked;
        const checkboxId = checkbox.id;
        
        // Update state
        const wasChecked = this.checkboxStates.get(checkboxId);
        this.checkboxStates.set(checkboxId, isChecked);
        
        // Update completed count
        if (isChecked && !wasChecked) {
            this.completedCheckboxes++;
        } else if (!isChecked && wasChecked) {
            this.completedCheckboxes = Math.max(0, this.completedCheckboxes - 1);
        }
        
        // Save to storage
        this.saveStates();
        
        // Update visual feedback
        this.updateCheckboxVisuals(checkbox);
        
        // Update progress
        this.updateProgress();
        
        // Emit event
        this.app.emit('checkbox:changed', {
            id: checkboxId,
            checked: isChecked,
            total: this.totalCheckboxes,
            completed: this.completedCheckboxes
        });
        
        // Show toast notification for milestones
        this.checkMilestones();
    }
    
    /**
     * Update checkbox visual feedback
     */
    updateCheckboxVisuals(checkbox) {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        const parent = checkbox.closest('li') || checkbox.parentElement;
        
        if (checkbox.checked) {
            // Add completed styling
            if (label) {
                label.style.textDecoration = 'line-through';
                label.style.opacity = '0.8';
            }
            if (parent) {
                parent.classList.add('completed');
            }
            
            // Add checkmark animation
            this.animateCheckmark(checkbox);
        } else {
            // Remove completed styling
            if (label) {
                label.style.textDecoration = 'none';
                label.style.opacity = '1';
            }
            if (parent) {
                parent.classList.remove('completed');
            }
        }
    }
    
    /**
     * Animate checkmark for better UX
     */
    animateCheckmark(checkbox) {
        checkbox.style.transform = 'scale(1.2)';
        setTimeout(() => {
            checkbox.style.transform = 'scale(1)';
        }, 200);
    }
    
    /**
     * Calculate weighted progress based on critical fields
     */
    calculateWeightedProgress() {
        // Calculate must-have fields completion
        let mustHaveCompleted = 0;
        let mustHaveTotal = this.mustHaveFields.size;
        
        this.mustHaveFields.forEach(fieldId => {
            if (this.checkboxStates.get(fieldId)) {
                mustHaveCompleted++;
            }
        });
        
        const mustHavePercentage = mustHaveTotal > 0 
            ? (mustHaveCompleted / mustHaveTotal) 
            : 0;
        
        // Calculate categorization completion
        let categorizationCompleted = 0;
        let categorizationTotal = this.categorizationCritical.size;
        
        this.categorizationCritical.forEach(catId => {
            if (this.checkboxStates.get(catId)) {
                categorizationCompleted++;
            }
        });
        
        const categorizationPercentage = categorizationTotal > 0
            ? (categorizationCompleted / categorizationTotal)
            : 0;
        
        // Calculate other checkboxes completion
        let otherCompleted = 0;
        let otherTotal = 0;
        
        this.checkboxStates.forEach((checked, id) => {
            if (!this.mustHaveFields.has(id) && !this.categorizationCritical.has(id)) {
                otherTotal++;
                if (checked) otherCompleted++;
            }
        });
        
        const otherPercentage = otherTotal > 0
            ? (otherCompleted / otherTotal)
            : 0;
        
        // Apply weights
        const weightedProgress = 
            (mustHavePercentage * this.weights.dataCollectionMustHave) +
            (categorizationPercentage * this.weights.categorization) +
            (otherPercentage * this.weights.otherCheckboxes);
        
        // Check critical gates
        const gateStatus = this.checkCriticalGates(mustHavePercentage, categorizationPercentage);
        
        // Apply gate restrictions
        let finalPercentage = Math.round(weightedProgress * 100);
        
        if (gateStatus.blocked) {
            // Cap progress based on gate restrictions
            finalPercentage = Math.min(finalPercentage, gateStatus.maxProgress);
            
            // Show warning if trying to progress beyond gates
            if (this.shouldShowGateWarning(finalPercentage, gateStatus)) {
                this.showGateWarning(gateStatus.message);
            }
        }
        
        // Store gate status for other components
        this.app.state.set('gateStatus', gateStatus);
        this.app.state.set('mustHaveProgress', Math.round(mustHavePercentage * 100));
        this.app.state.set('categorizationProgress', Math.round(categorizationPercentage * 100));
        
        return finalPercentage;
    }
    
    /**
     * Check critical gates for progress restrictions
     */
    checkCriticalGates(mustHavePercentage, categorizationPercentage) {
        const status = {
            blocked: false,
            maxProgress: 100,
            message: '',
            warnings: []
        };
        
        // Gate 1: Must-have fields must be ≥95% to allow full categorization
        if (mustHavePercentage < 0.95) {
            status.blocked = true;
            status.maxProgress = 40; // Cap at 40% if must-have fields incomplete
            status.message = `⚠️ Critical Gate: Must-have fields are only ${Math.round(mustHavePercentage * 100)}% complete. Complete all 5 must-have fields to unlock categorization.`;
            status.warnings.push('dataCollection');
        }
        
        // Gate 2: Both must-have fields and categorization must be complete for dashboard phase
        if (mustHavePercentage < 0.95 || categorizationPercentage < 0.8) {
            if (!status.blocked || status.maxProgress > 60) {
                status.blocked = true;
                status.maxProgress = Math.min(status.maxProgress, 60); // Cap at 60% if categorization incomplete
                
                if (categorizationPercentage < 0.8 && mustHavePercentage >= 0.95) {
                    status.message = `⚠️ Critical Gate: Categorization is only ${Math.round(categorizationPercentage * 100)}% complete. Complete categorization to unlock dashboard development.`;
                    status.warnings.push('categorization');
                }
            }
        }
        
        return status;
    }
    
    /**
     * Determine if gate warning should be shown
     */
    shouldShowGateWarning(currentProgress, gateStatus) {
        if (!gateStatus.blocked) return false;
        
        const lastWarningTime = this.app.state.get('lastGateWarning') || 0;
        const now = Date.now();
        
        // Show warning max once per minute
        if (now - lastWarningTime < 60000) return false;
        
        // Show if user is trying to progress beyond gate
        if (currentProgress >= gateStatus.maxProgress - 5) {
            this.app.state.set('lastGateWarning', now);
            return true;
        }
        
        return false;
    }
    
    /**
     * Show gate warning toast
     */
    showGateWarning(message) {
        // Create warning toast with special styling
        const existingToast = document.querySelector('.gate-warning-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'gate-warning-toast';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 1.2rem;"></i>
                <span>${message}</span>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10001;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            animation: slideDown 0.3s ease;
        `;
        
        // Add animation keyframes if not already present
        if (!document.querySelector('#gate-warning-styles')) {
            const style = document.createElement('style');
            style.id = 'gate-warning-styles';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        transform: translateX(-50%) translateY(-100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Remove after 5 seconds (longer than normal toasts)
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    /**
     * Update overall progress with weighted calculation
     */
    updateProgress() {
        // Recalculate completed count from states
        this.completedCheckboxes = 0;
        this.checkboxStates.forEach((checked) => {
            if (checked) this.completedCheckboxes++;
        });
        
        // Calculate weighted progress
        const percentage = this.calculateWeightedProgress();
        
        // Update progress bar in navigation
        const progressFill = document.getElementById('overall-progress');
        const progressPercent = document.getElementById('progress-percent');
        const progressLabel = document.querySelector('.progress-label');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
            progressFill.style.transition = 'width 0.5s ease';
            
            // Change color based on progress
            if (percentage >= 80) {
                progressFill.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
            } else if (percentage >= 50) {
                progressFill.style.background = 'linear-gradient(90deg, #06b6d4, #3b82f6)';
            } else if (percentage >= 25) {
                progressFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            } else {
                progressFill.style.background = 'linear-gradient(90deg, #6366f1, #8b5cf6)';
            }
        }
        
        if (progressPercent) {
            progressPercent.textContent = `${percentage}%`;
            progressPercent.style.fontWeight = '600';
        }
        
        if (progressLabel) {
            const gateStatus = this.app.state.get('gateStatus');
            const mustHaveProgress = this.app.state.get('mustHaveProgress') || 0;
            const categorizationProgress = this.app.state.get('categorizationProgress') || 0;
            
            // Update main label
            progressLabel.innerHTML = `
                <span style="font-weight: 700; font-size: 0.95rem;">Overall Progress</span>
                <span style="font-size: 0.75rem; opacity: 0.7; margin-left: 8px;">${this.completedCheckboxes}/${this.totalCheckboxes} tasks</span>
            `;
            
            // Always show gate status (not just when blocked)
            const existingGates = document.querySelector('.gate-status-cards');
            if (existingGates) existingGates.remove();
            
            const gatesContainer = document.createElement('div');
            gatesContainer.className = 'gate-status-cards';
            gatesContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 15px;
            `;
            
            // Must-Have Fields Card
            const mustHaveCard = document.createElement('div');
            mustHaveCard.className = 'gate-card';
            const mustHaveStatus = mustHaveProgress >= 95 ? 'complete' : 'incomplete';
            const mustHaveColor = mustHaveProgress >= 95 ? '#10b981' : '#ef4444';
            const mustHaveIcon = mustHaveProgress >= 95 ? '✅' : '🔴';
            
            mustHaveCard.style.cssText = `
                background: linear-gradient(135deg, 
                    rgba(${mustHaveProgress >= 95 ? '16,185,129' : '239,68,68'}, 0.1),
                    rgba(${mustHaveProgress >= 95 ? '16,185,129' : '239,68,68'}, 0.05));
                border: 1px solid ${mustHaveProgress >= 95 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};
                border-radius: 8px;
                padding: 10px;
                transition: all 0.3s ease;
            `;
            
            mustHaveCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem;">${mustHaveIcon}</span>
                        <div>
                            <div style="font-size: 0.8rem; font-weight: 600; color: ${mustHaveColor};">
                                Data Collection
                            </div>
                            <div style="font-size: 0.7rem; opacity: 0.8; margin-top: 2px;">
                                Must-Have Fields
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.1rem; font-weight: 700; color: ${mustHaveColor};">
                            ${mustHaveProgress}%
                        </div>
                        <div style="font-size: 0.65rem; opacity: 0.7;">
                            ${mustHaveProgress >= 95 ? 'Unlocked' : 'Required: 95%'}
                        </div>
                    </div>
                </div>
                <div style="margin-top: 8px;">
                    <div style="background: rgba(0,0,0,0.2); height: 4px; border-radius: 2px; overflow: hidden;">
                        <div style="
                            width: ${mustHaveProgress}%;
                            height: 100%;
                            background: ${mustHaveColor};
                            transition: width 0.5s ease;
                            box-shadow: 0 0 10px ${mustHaveColor}40;
                        "></div>
                    </div>
                </div>
            `;
            
            // Categorization Card
            const categorizationCard = document.createElement('div');
            categorizationCard.className = 'gate-card';
            const catStatus = categorizationProgress >= 80 ? 'complete' : 'incomplete';
            const catColor = categorizationProgress >= 80 ? '#10b981' : '#f59e0b';
            const catIcon = categorizationProgress >= 80 ? '✅' : '🟡';
            
            categorizationCard.style.cssText = `
                background: linear-gradient(135deg,
                    rgba(${categorizationProgress >= 80 ? '16,185,129' : '245,158,11'}, 0.1),
                    rgba(${categorizationProgress >= 80 ? '16,185,129' : '245,158,11'}, 0.05));
                border: 1px solid ${categorizationProgress >= 80 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'};
                border-radius: 8px;
                padding: 10px;
                transition: all 0.3s ease;
            `;
            
            categorizationCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem;">${catIcon}</span>
                        <div>
                            <div style="font-size: 0.8rem; font-weight: 600; color: ${catColor};">
                                Categorization
                            </div>
                            <div style="font-size: 0.7rem; opacity: 0.8; margin-top: 2px;">
                                Taxonomy Mapping
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.1rem; font-weight: 700; color: ${catColor};">
                            ${categorizationProgress}%
                        </div>
                        <div style="font-size: 0.65rem; opacity: 0.7;">
                            ${categorizationProgress >= 80 ? 'Unlocked' : 'Required: 80%'}
                        </div>
                    </div>
                </div>
                <div style="margin-top: 8px;">
                    <div style="background: rgba(0,0,0,0.2); height: 4px; border-radius: 2px; overflow: hidden;">
                        <div style="
                            width: ${categorizationProgress}%;
                            height: 100%;
                            background: ${catColor};
                            transition: width 0.5s ease;
                            box-shadow: 0 0 10px ${catColor}40;
                        "></div>
                    </div>
                </div>
            `;
            
            gatesContainer.appendChild(mustHaveCard);
            gatesContainer.appendChild(categorizationCard);
            
            // Add warning if gates are blocking
            if (gateStatus && gateStatus.blocked) {
                const warningDiv = document.createElement('div');
                warningDiv.style.cssText = `
                    background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1));
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: 6px;
                    padding: 8px;
                    margin-top: 8px;
                    font-size: 0.7rem;
                    color: #fca5a5;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                `;
                warningDiv.innerHTML = `
                    <i class="fas fa-lock" style="font-size: 0.8rem;"></i>
                    <span>Progress limited to ${gateStatus.maxProgress}%</span>
                `;
                gatesContainer.appendChild(warningDiv);
            }
            
            // Append to progress summary
            const progressSummary = document.querySelector('.progress-summary');
            if (progressSummary) {
                progressSummary.appendChild(gatesContainer);
            }
        }
        
        // Update app state
        this.app.state.set('progressPercentage', percentage);
        this.app.state.set('completedCount', this.completedCheckboxes);
        this.app.state.set('totalCount', this.totalCheckboxes);
        
        // Call progress callbacks
        this.progressCallbacks.forEach(callback => {
            callback({
                percentage,
                completed: this.completedCheckboxes,
                total: this.totalCheckboxes
            });
        });
    }
    
    /**
     * Check for milestone achievements
     */
    checkMilestones() {
        const percentage = this.totalCheckboxes > 0 
            ? Math.round((this.completedCheckboxes / this.totalCheckboxes) * 100)
            : 0;
        
        // Check for milestone percentages
        const milestones = [25, 50, 75, 100];
        const lastMilestone = this.app.state.get('lastMilestone') || 0;
        
        for (const milestone of milestones) {
            if (percentage >= milestone && lastMilestone < milestone) {
                this.showMilestoneToast(milestone);
                this.app.state.set('lastMilestone', milestone);
                break;
            }
        }
    }
    
    /**
     * Show milestone achievement toast
     */
    showMilestoneToast(milestone) {
        const messages = {
            25: '🎯 Great start! 25% complete!',
            50: '✨ Halfway there! 50% complete!',
            75: '🚀 Almost done! 75% complete!',
            100: '🎉 Congratulations! 100% complete!'
        };
        
        const colors = {
            25: '#f59e0b',
            50: '#3b82f6',
            75: '#10b981',
            100: '#10b981'
        };
        
        this.showToast(messages[milestone], colors[milestone]);
    }
    
    /**
     * Show toast notification
     */
    showToast(message, color = '#3b82f6') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.progress-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'progress-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: ${color};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Register progress callback
     */
    onProgress(callback) {
        this.progressCallbacks.push(callback);
    }
    
    /**
     * Get current progress stats with gate information
     */
    getStats() {
        const percentage = this.calculateWeightedProgress();
        const gateStatus = this.app.state.get('gateStatus');
        const mustHaveProgress = this.app.state.get('mustHaveProgress') || 0;
        const categorizationProgress = this.app.state.get('categorizationProgress') || 0;
        
        // Count must-have fields specifically
        let mustHaveCompleted = 0;
        this.mustHaveFields.forEach(fieldId => {
            if (this.checkboxStates.get(fieldId)) {
                mustHaveCompleted++;
            }
        });
        
        return {
            percentage,
            completed: this.completedCheckboxes,
            total: this.totalCheckboxes,
            remaining: this.totalCheckboxes - this.completedCheckboxes,
            weighted: true,
            gates: {
                mustHave: {
                    completed: mustHaveCompleted,
                    total: this.mustHaveFields.size,
                    percentage: mustHaveProgress,
                    passed: mustHaveProgress >= 95
                },
                categorization: {
                    percentage: categorizationProgress,
                    passed: categorizationProgress >= 80
                },
                status: gateStatus
            }
        };
    }
    
    /**
     * Reset all progress
     */
    reset() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            // Clear all states
            this.checkboxStates.clear();
            this.completedCheckboxes = 0;
            
            // Clear storage
            this.app.storage.remove(this.storageKey);
            this.app.state.set('lastMilestone', 0);
            
            // Uncheck all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][id]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                this.updateCheckboxVisuals(checkbox);
            });
            
            // Update progress
            this.updateProgress();
            
            // Show confirmation
            this.showToast('Progress reset successfully', '#6366f1');
        }
    }
    
    /**
     * Export progress data
     */
    exportProgress() {
        const data = {
            date: new Date().toISOString(),
            stats: this.getStats(),
            checkboxes: {}
        };
        
        this.checkboxStates.forEach((checked, id) => {
            data.checkboxes[id] = checked;
        });
        
        return data;
    }
    
    /**
     * Import progress data
     */
    importProgress(data) {
        if (data && data.checkboxes) {
            // Clear current states
            this.checkboxStates.clear();
            this.completedCheckboxes = 0;
            
            // Import new states
            Object.entries(data.checkboxes).forEach(([id, checked]) => {
                this.checkboxStates.set(id, checked);
                if (checked) this.completedCheckboxes++;
            });
            
            // Save and update
            this.saveStates();
            this.scanCheckboxes();
            this.updateProgress();
            
            this.showToast('Progress imported successfully', '#10b981');
        }
    }
}