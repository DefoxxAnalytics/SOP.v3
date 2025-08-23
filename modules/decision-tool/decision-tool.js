/**
 * Decision Support Tool Module
 * AI-powered recommendations for vendor spend analysis decisions
 * Version: 1.0.0
 */

class DecisionSupportTool {
    constructor() {
        this.name = 'Decision Support Tool';
        this.version = '1.0.0';
        this.app = null;
        this.container = null;
        this.currentScenario = null;
        this.decisions = [];
        this.recommendations = {};
    }

    async init(app) {
        console.log('Decision Support Tool initializing...');
        this.app = app;
        this.loadDecisionTree();
        this.render();
        this.attachEventListeners();
        return this;
    }

    loadDecisionTree() {
        // Decision tree for common vendor spend analysis scenarios
        this.decisionTree = {
            dataQuality: {
                title: 'Data Quality Assessment',
                description: 'Evaluate data completeness and determine next steps',
                questions: [
                    {
                        id: 'completeness',
                        text: 'What is your data completeness percentage?',
                        type: 'range',
                        min: 0,
                        max: 100,
                        threshold: 95,
                        recommendations: {
                            low: 'Request additional data from source systems. Do not proceed to cleansing.',
                            medium: 'Proceed with caution. Document gaps and get client approval.',
                            high: 'Data quality sufficient. Proceed to cleansing phase.'
                        }
                    },
                    {
                        id: 'vendorMatch',
                        text: 'What percentage of vendors match to master data?',
                        type: 'range',
                        min: 0,
                        max: 100,
                        threshold: 80,
                        recommendations: {
                            low: 'Implement fuzzy matching algorithm. Manual review required.',
                            medium: 'Use automated matching with manual verification for outliers.',
                            high: 'Automated matching sufficient. Spot-check only.'
                        }
                    }
                ]
            },
            categorization: {
                title: 'Categorization Strategy',
                description: 'Determine optimal categorization approach',
                questions: [
                    {
                        id: 'spendConcentration',
                        text: 'What percentage of spend is with top 20% of vendors?',
                        type: 'range',
                        min: 0,
                        max: 100,
                        threshold: 80,
                        recommendations: {
                            low: 'Focus on automated rules-based categorization.',
                            medium: 'Hybrid approach: Manual for top vendors, automated for tail.',
                            high: 'Prioritize manual categorization for top vendors (80/20 rule).'
                        }
                    },
                    {
                        id: 'categoryComplexity',
                        text: 'How many unique categories are expected?',
                        type: 'select',
                        options: ['< 50', '50-200', '> 200'],
                        recommendations: {
                            '< 50': 'Simple taxonomy sufficient. Use 3-level hierarchy.',
                            '50-200': 'Standard 5-level taxonomy recommended.',
                            '> 200': 'Complex taxonomy needed. Consider ML-assisted categorization.'
                        }
                    }
                ]
            },
            timeline: {
                title: 'Timeline Risk Assessment',
                description: 'Evaluate project timeline and resource allocation',
                questions: [
                    {
                        id: 'currentDay',
                        text: 'What day of the project are you on?',
                        type: 'number',
                        min: 1,
                        max: 22,
                        recommendations: {
                            early: 'On track. Maintain current pace.',
                            mid: 'Critical phase. Ensure categorization resources are allocated.',
                            late: 'Final push. Focus on delivery and documentation.'
                        }
                    },
                    {
                        id: 'resourceAvailability',
                        text: 'What percentage of planned resources are available?',
                        type: 'range',
                        min: 0,
                        max: 100,
                        threshold: 90,
                        recommendations: {
                            low: 'Critical: Escalate to management. Consider scope reduction.',
                            medium: 'Warning: Reallocate resources from non-critical tasks.',
                            high: 'Resources adequate. Continue as planned.'
                        }
                    }
                ]
            },
            savings: {
                title: 'Savings Opportunity Identification',
                description: 'Identify and prioritize cost savings opportunities',
                questions: [
                    {
                        id: 'vendorFragmentation',
                        text: 'How many vendors provide similar products/services?',
                        type: 'select',
                        options: ['< 5', '5-20', '> 20'],
                        recommendations: {
                            '< 5': 'Limited consolidation opportunity. Focus on contract optimization.',
                            '5-20': 'Moderate opportunity. Analyze for consolidation potential.',
                            '> 20': 'High consolidation opportunity. Prioritize vendor rationalization.'
                        }
                    },
                    {
                        id: 'contractCoverage',
                        text: 'What percentage of spend is under contract?',
                        type: 'range',
                        min: 0,
                        max: 100,
                        threshold: 70,
                        recommendations: {
                            low: 'Major opportunity: Implement strategic sourcing for uncovered spend.',
                            medium: 'Review non-contract spend for quick wins.',
                            high: 'Focus on contract compliance and renegotiation opportunities.'
                        }
                    }
                ]
            }
        };
    }

    render() {
        const content = `
            <div class="decision-tool-module">
                <div class="decision-header">
                    <h2>🤖 Intelligent Decision Support</h2>
                    <p>AI-powered recommendations for your vendor spend analysis</p>
                </div>

                <div class="scenario-selector">
                    <h3>Select Decision Scenario</h3>
                    <div class="scenario-cards">
                        ${this.renderScenarioCards()}
                    </div>
                </div>

                <div class="decision-workspace" id="decisionWorkspace" style="display: none;">
                    <div class="questions-panel" id="questionsPanel">
                        <!-- Questions will be inserted here -->
                    </div>
                    
                    <div class="recommendations-panel" id="recommendationsPanel">
                        <h3>📋 Recommendations</h3>
                        <div id="recommendationsList">
                            <p class="placeholder">Answer the questions to receive personalized recommendations</p>
                        </div>
                    </div>
                </div>

                <div class="decision-history">
                    <h3>📊 Decision History</h3>
                    <div id="decisionHistory">
                        ${this.renderDecisionHistory()}
                    </div>
                </div>

                <div class="best-practices">
                    <h3>💡 Best Practices</h3>
                    <div class="practice-grid">
                        <div class="practice-card">
                            <h4>Data Quality</h4>
                            <p>Never proceed with <95% completeness without client approval</p>
                        </div>
                        <div class="practice-card">
                            <h4>Categorization</h4>
                            <p>Focus 80% effort on top 20% of spend for maximum impact</p>
                        </div>
                        <div class="practice-card">
                            <h4>Timeline</h4>
                            <p>Days 10-20 are critical - ensure full resource allocation</p>
                        </div>
                        <div class="practice-card">
                            <h4>Savings</h4>
                            <p>Quick wins: Payment terms, volume discounts, contract compliance</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create container and insert into page
        const container = document.createElement('div');
        container.className = 'decision-tool-wrapper';
        container.innerHTML = content;
        this.container = container;

        // Insert into main content area
        let targetSection = document.querySelector('.content-area');
        if (!targetSection) {
            targetSection = document.querySelector('main');
        }
        
        if (targetSection) {
            // Hide by default, show when activated
            this.container.style.display = 'none';
            targetSection.appendChild(this.container);
            console.log('Decision Support Tool rendered');
        }
    }

    renderScenarioCards() {
        let html = '';
        for (const [key, scenario] of Object.entries(this.decisionTree)) {
            const icon = this.getScenarioIcon(key);
            html += `
                <div class="scenario-card" data-scenario="${key}">
                    <div class="scenario-icon">${icon}</div>
                    <h4>${scenario.title}</h4>
                    <p>${scenario.description}</p>
                    <button class="btn-select-scenario">Analyze</button>
                </div>
            `;
        }
        return html;
    }

    getScenarioIcon(key) {
        const icons = {
            dataQuality: '📊',
            categorization: '🏷️',
            timeline: '⏱️',
            savings: '💰'
        };
        return icons[key] || '📈';
    }

    renderDecisionHistory() {
        if (this.decisions.length === 0) {
            return '<p class="placeholder">No decisions recorded yet</p>';
        }

        let html = '<div class="history-list">';
        this.decisions.forEach((decision, index) => {
            html += `
                <div class="history-item">
                    <span class="history-time">${decision.timestamp}</span>
                    <span class="history-scenario">${decision.scenario}</span>
                    <span class="history-score">${decision.score}%</span>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    attachEventListeners() {
        if (!this.container) return;

        // Scenario selection
        this.container.querySelectorAll('.scenario-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const scenario = card.dataset.scenario;
                this.loadScenario(scenario);
            });
        });
    }

    loadScenario(scenarioKey) {
        this.currentScenario = this.decisionTree[scenarioKey];
        if (!this.currentScenario) return;

        // Show workspace
        const workspace = this.container.querySelector('#decisionWorkspace');
        workspace.style.display = 'grid';

        // Render questions
        this.renderQuestions();

        // Scroll to workspace
        workspace.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    renderQuestions() {
        const panel = this.container.querySelector('#questionsPanel');
        let html = `<h3>${this.currentScenario.title}</h3>`;

        this.currentScenario.questions.forEach((question, index) => {
            html += this.renderQuestion(question, index);
        });

        html += `
            <button class="btn-analyze" onclick="window.decisionTool.analyzeAnswers()">Generate Recommendations</button>
            <button class="btn-reset" onclick="window.decisionTool.resetAnalysis()">🔄 Reset Analysis</button>
        `;
        panel.innerHTML = html;

        // Attach input listeners
        panel.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => this.updateRecommendations());
        });
    }

    renderQuestion(question, index) {
        let inputHtml = '';

        switch (question.type) {
            case 'range':
                inputHtml = `
                    <input type="range" 
                           id="${question.id}" 
                           min="${question.min}" 
                           max="${question.max}" 
                           value="${(question.min + question.max) / 2}"
                           class="question-input">
                    <span class="range-value">${(question.min + question.max) / 2}%</span>
                `;
                break;
            case 'select':
                inputHtml = `
                    <select id="${question.id}" class="question-input">
                        <option value="">Select...</option>
                        ${question.options.map(opt => 
                            `<option value="${opt}">${opt}</option>`
                        ).join('')}
                    </select>
                `;
                break;
            case 'number':
                inputHtml = `
                    <input type="number" 
                           id="${question.id}" 
                           min="${question.min}" 
                           max="${question.max}" 
                           value="${question.min}"
                           class="question-input">
                `;
                break;
        }

        return `
            <div class="question-block">
                <label class="question-label">${question.text}</label>
                ${inputHtml}
            </div>
        `;
    }

    updateRecommendations() {
        // Update range value displays
        this.container.querySelectorAll('input[type="range"]').forEach(input => {
            const valueDisplay = input.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('range-value')) {
                valueDisplay.textContent = input.value + '%';
            }
        });
    }

    analyzeAnswers() {
        const recommendations = [];
        let totalScore = 0;
        let questionCount = 0;

        this.currentScenario.questions.forEach(question => {
            const input = this.container.querySelector(`#${question.id}`);
            if (!input) return;

            const value = input.value;
            let recommendation = '';
            let score = 0;

            if (question.type === 'range') {
                const numValue = parseInt(value);
                if (numValue < question.threshold * 0.6) {
                    recommendation = question.recommendations.low;
                    score = 40;
                } else if (numValue < question.threshold) {
                    recommendation = question.recommendations.medium;
                    score = 70;
                } else {
                    recommendation = question.recommendations.high;
                    score = 100;
                }
                totalScore += score;
                questionCount++;
            } else if (question.type === 'select' && value) {
                recommendation = question.recommendations[value];
                score = 80; // Default score for select
                totalScore += score;
                questionCount++;
            } else if (question.type === 'number') {
                const numValue = parseInt(value);
                if (numValue <= 7) {
                    recommendation = question.recommendations.early;
                } else if (numValue <= 17) {
                    recommendation = question.recommendations.mid;
                } else {
                    recommendation = question.recommendations.late;
                }
                score = 80;
                totalScore += score;
                questionCount++;
            }

            if (recommendation) {
                recommendations.push({
                    question: question.text,
                    answer: value,
                    recommendation: recommendation,
                    score: score
                });
            }
        });

        // Display recommendations
        this.displayRecommendations(recommendations, totalScore / questionCount);

        // Save to history
        this.saveDecision(totalScore / questionCount);
    }

    displayRecommendations(recommendations, overallScore) {
        const panel = this.container.querySelector('#recommendationsList');
        
        let html = `
            <div class="overall-score">
                <h4>Overall Assessment Score</h4>
                <div class="score-display ${this.getScoreClass(overallScore)}">
                    ${Math.round(overallScore)}%
                </div>
            </div>
        `;

        html += '<div class="recommendations-list">';
        recommendations.forEach(rec => {
            html += `
                <div class="recommendation-item">
                    <div class="rec-question">${rec.question}</div>
                    <div class="rec-answer">Your answer: ${rec.answer}</div>
                    <div class="rec-advice ${this.getScoreClass(rec.score)}">
                        <span class="rec-icon">${this.getRecommendationIcon(rec.score)}</span>
                        ${rec.recommendation}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        html += this.generateActionPlan(recommendations, overallScore);

        panel.innerHTML = html;
    }

    getScoreClass(score) {
        if (score >= 80) return 'score-high';
        if (score >= 60) return 'score-medium';
        return 'score-low';
    }

    getRecommendationIcon(score) {
        if (score >= 80) return '✅';
        if (score >= 60) return '⚠️';
        return '🔴';
    }

    generateActionPlan(recommendations, score) {
        let plan = '<div class="action-plan"><h4>🎯 Recommended Action Plan</h4><ol>';
        
        // Prioritize actions based on score
        const criticalActions = recommendations.filter(r => r.score < 60);
        const warningActions = recommendations.filter(r => r.score >= 60 && r.score < 80);
        const goodActions = recommendations.filter(r => r.score >= 80);

        if (criticalActions.length > 0) {
            plan += '<li class="action-critical">Address critical issues immediately:<ul>';
            criticalActions.forEach(action => {
                plan += `<li>${action.recommendation}</li>`;
            });
            plan += '</ul></li>';
        }

        if (warningActions.length > 0) {
            plan += '<li class="action-warning">Review and improve:<ul>';
            warningActions.forEach(action => {
                plan += `<li>${action.recommendation}</li>`;
            });
            plan += '</ul></li>';
        }

        if (goodActions.length > 0) {
            plan += '<li class="action-good">Maintain current approach for:<ul>';
            goodActions.forEach(action => {
                plan += `<li>${action.recommendation}</li>`;
            });
            plan += '</ul></li>';
        }

        plan += '</ol></div>';
        return plan;
    }

    saveDecision(score) {
        const decision = {
            timestamp: new Date().toLocaleString(),
            scenario: this.currentScenario.title,
            score: Math.round(score),
            answers: this.captureAnswers()
        };

        this.decisions.push(decision);
        
        // Save to localStorage
        if (this.app && this.app.storage) {
            this.app.storage.set('decision_history', this.decisions);
        }

        // Update history display
        const historyEl = this.container.querySelector('#decisionHistory');
        historyEl.innerHTML = this.renderDecisionHistory();
    }

    captureAnswers() {
        const answers = {};
        this.currentScenario.questions.forEach(question => {
            const input = this.container.querySelector(`#${question.id}`);
            if (input) {
                answers[question.id] = input.value;
            }
        });
        return answers;
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    resetAnalysis() {
        // Reset current scenario
        this.currentScenario = null;
        
        // Clear workspace
        const workspace = this.container.querySelector('#decisionWorkspace');
        if (workspace) {
            workspace.style.display = 'none';
        }
        
        // Clear recommendations
        const recommendationsPanel = this.container.querySelector('#recommendationsList');
        if (recommendationsPanel) {
            recommendationsPanel.innerHTML = '<p class="placeholder">Answer the questions to receive personalized recommendations</p>';
        }
        
        // Clear questions panel
        const questionsPanel = this.container.querySelector('#questionsPanel');
        if (questionsPanel) {
            questionsPanel.innerHTML = '';
        }
        
        // Scroll back to scenario selector
        const scenarioSelector = this.container.querySelector('.scenario-selector');
        if (scenarioSelector) {
            scenarioSelector.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        console.log('Analysis reset - ready for new scenario');
    }

    unload() {
        if (this.container) {
            this.container.remove();
        }
        console.log('Decision Support Tool unloaded');
    }
}

// Export singleton instance
const decisionTool = new DecisionSupportTool();
window.decisionTool = decisionTool; // For analyzeAnswers button
export default decisionTool;