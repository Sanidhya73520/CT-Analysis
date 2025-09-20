// Medical Findings Data
const MEDICAL_FINDINGS = [
    'Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema', 'Effusion',
    'Emphysema', 'Fibrosis', 'Hernia', 'Infiltration', 'Mass', 'Nodule',
    'Pleural_Thickening', 'Pneumonia', 'Pneumothorax', 'No Finding'
];

// Analysis modes configuration
const ANALYSIS_MODES = {
    quick: { name: 'Quick Scan', duration: 3000, steps: 4 },
    deep: { name: 'Deep Analysis', duration: 5000, steps: 4 },
    research: { name: 'Research Mode', duration: 7000, steps: 4 }
};

// Sample analysis results for different scenarios
const SAMPLE_RESULTS = {
    normal: {
        findings: [
            {
                condition: 'No Finding',
                confidence: 0.94,
                severity: 'normal',
                explanation: 'No pathological abnormalities detected in the chest region. Lung fields appear clear with normal cardiac silhouette.'
            }
        ],
        riskLevel: 'Low',
        summary: 'Normal chest X-ray with no concerning findings. Routine follow-up as clinically indicated.'
    },
    abnormal_mild: {
        findings: [
            {
                condition: 'Infiltration',
                confidence: 0.67,
                severity: 'mild',
                explanation: 'Subtle areas of increased opacity in the right lower lobe suggesting possible inflammatory changes or early consolidation.'
            },
            {
                condition: 'Consolidation',
                confidence: 0.43,
                severity: 'mild',
                explanation: 'Minor areas of increased density in lung tissue, possibly representing resolving pneumonia or atelectasis.'
            }
        ],
        riskLevel: 'Moderate',
        summary: 'Mild inflammatory changes detected. Clinical correlation recommended to determine if treatment is needed.'
    },
    abnormal_severe: {
        findings: [
            {
                condition: 'Pneumonia',
                confidence: 0.89,
                severity: 'high',
                explanation: 'Significant consolidation pattern in bilateral lower lobes consistent with pneumonia. Dense opacity with air bronchograms visible.'
            },
            {
                condition: 'Effusion',
                confidence: 0.72,
                severity: 'moderate',
                explanation: 'Pleural effusion detected in the right costophrenic angle with blunting of the lateral recess.'
            },
            {
                condition: 'Cardiomegaly',
                confidence: 0.58,
                severity: 'mild',
                explanation: 'Cardiac silhouette appears mildly enlarged. Cardiothoracic ratio may exceed normal limits.'
            }
        ],
        riskLevel: 'High',
        summary: 'Significant pathological findings requiring immediate medical attention and antibiotic therapy.'
    }
};

// Main Application Class
class MedXAnalyzer {
    constructor() {
        this.state = {
            currentStep: 'upload', // upload, modeSelection, analysis, results
            selectedMode: null,
            analysisProgress: 0,
            currentImage: null,
            analysisResults: null,
            analysisStartTime: null,
            heatmapVisible: false,
            imageZoom: 1,
            imagePosition: { x: 0, y: 0 }
        };

        this.analysisTimer = null;
        this.progressTimer = null;
        
        // Wait for DOM to be ready then initialize
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeParticles();
        this.showInitialState();
        
        console.log('MedX Pro initialized successfully');
    }

    initializeElements() {
        // Upload elements
        this.uploadSection = document.getElementById('uploadSection');
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadContent = document.getElementById('uploadContent');
        this.loadingState = document.getElementById('loadingState');
        this.fileInput = document.getElementById('fileInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressPercentage = document.getElementById('progressPercentage');
        this.progressETA = document.getElementById('progressETA');

        // Mode selection elements
        this.modeSelection = document.getElementById('modeSelection');
        this.modeOptions = document.querySelectorAll('.mode-option');
        this.startAnalysisBtn = document.getElementById('startAnalysis');
        this.backToUploadBtn = document.getElementById('backToUpload');

        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.welcomeSection = document.getElementById('welcomeSection');
        this.analysisImage = document.getElementById('analysisImage');
        this.heatmapOverlay = document.getElementById('heatmapOverlay');
        this.heatmapCanvas = document.getElementById('heatmapCanvas');
        this.findingsList = document.getElementById('findingsList');
        this.riskLevel = document.getElementById('riskLevel');
        this.riskSummary = document.getElementById('riskSummary');
        this.analysisDetails = document.getElementById('analysisDetails');

        // Control elements
        this.newAnalysisBtn = document.getElementById('newAnalysisBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.toggleHeatmapBtn = document.getElementById('toggleHeatmap');
        this.historyBtn = document.getElementById('historyBtn');

        // Modal elements
        this.exportModal = document.getElementById('exportModal');
        this.historyModal = document.getElementById('historyModal');
        this.closeExportModal = document.getElementById('closeExportModal');
        this.closeHistoryModal = document.getElementById('closeHistoryModal');

        // Analysis steps
        this.analysisSteps = document.querySelectorAll('.step');
        this.loadingTitle = document.getElementById('loadingTitle');
        this.loadingSubtitle = document.getElementById('loadingSubtitle');

        // Image controls
        this.imageContainer = document.getElementById('imageContainer');
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.resetZoomBtn = document.getElementById('resetZoom');
    }

    showInitialState() {
        // Ensure proper initial visibility
        if (this.welcomeSection) this.welcomeSection.classList.remove('hidden');
        if (this.uploadSection) this.uploadSection.classList.remove('hidden');
        if (this.modeSelection) this.modeSelection.classList.add('hidden');
        if (this.resultsSection) this.resultsSection.classList.add('hidden');
        
        if (this.uploadContent) this.uploadContent.classList.remove('hidden');
        if (this.loadingState) this.loadingState.classList.add('hidden');
        
        if (this.progressBar) this.progressBar.style.width = '0%';
        if (this.progressPercentage) this.progressPercentage.textContent = '0%';
    }

    attachEventListeners() {
        // File upload events - Add defensive checks
        if (this.selectFileBtn && this.fileInput) {
            this.selectFileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Select file button clicked');
                this.fileInput.click();
            });
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                console.log('File input changed', e.target.files);
                if (e.target.files && e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files);
                }
            });
        }

        // Upload area click
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', (e) => {
                if (this.state.currentStep !== 'upload') return;
                if (e.target.closest('button')) return; // Don't trigger if clicking a button
                console.log('Upload area clicked');
                if (this.fileInput) this.fileInput.click();
            });
        }

        // Drag and drop events
        if (this.uploadArea) {
            this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // Mode selection events
        if (this.modeOptions) {
            this.modeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const mode = option.dataset.mode;
                    console.log('Mode selected:', mode);
                    this.selectMode(mode);
                });
            });
        }
        
        if (this.startAnalysisBtn) {
            this.startAnalysisBtn.addEventListener('click', () => {
                console.log('Start analysis clicked');
                this.startAnalysis();
            });
        }
        
        if (this.backToUploadBtn) {
            this.backToUploadBtn.addEventListener('click', () => {
                console.log('Back to upload clicked');
                this.goBackToUpload();
            });
        }

        // Control events
        if (this.newAnalysisBtn) {
            this.newAnalysisBtn.addEventListener('click', () => this.startNewAnalysis());
        }
        
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.openExportModal());
        }
        
        if (this.historyBtn) {
            this.historyBtn.addEventListener('click', () => this.openHistoryModal());
        }
        
        if (this.toggleHeatmapBtn) {
            this.toggleHeatmapBtn.addEventListener('click', () => this.toggleHeatmap());
        }

        // Modal events
        if (this.closeExportModal) {
            this.closeExportModal.addEventListener('click', () => this.closeModal('exportModal'));
        }
        
        if (this.closeHistoryModal) {
            this.closeHistoryModal.addEventListener('click', () => this.closeModal('historyModal'));
        }
        
        // Export options
        document.querySelectorAll('.export-option button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.closest('.export-option').dataset.format;
                this.exportReport(format);
            });
        });

        // Image controls
        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener('click', () => this.zoomImage(1.2));
        }
        
        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener('click', () => this.zoomImage(0.8));
        }
        
        if (this.resetZoomBtn) {
            this.resetZoomBtn.addEventListener('click', () => this.resetImageView());
        }

        // Image pan functionality
        this.setupImagePanning();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Modal backdrop clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal__backdrop')) {
                this.closeModal(e.target.closest('.modal').id);
            }
        });
    }

    initializeParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 10 + 5) + 's';
            particle.style.animationDelay = Math.random() * 5 + 's';
            particlesContainer.appendChild(particle);

            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 15000);
        };

        // Create initial particles
        for (let i = 0; i < 15; i++) {
            setTimeout(createParticle, i * 300);
        }

        // Continue creating particles
        setInterval(createParticle, 3000);
    }

    handleFileSelect(files) {
        if (!files || files.length === 0) return;

        const file = files[0];
        console.log('Processing file:', file.name, file.type, file.size);
        
        if (!this.isValidImageFile(file)) {
            this.showNotification('Please select a valid image file (JPEG, PNG, or DICOM)', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File size must be less than 10MB', 'error');
            return;
        }

        this.processImageFile(file);
    }

    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const validExtensions = ['.jpg', '.jpeg', '.png', '.dcm'];
        
        const isValidType = validTypes.includes(file.type);
        const hasValidExtension = validExtensions.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );
        
        return isValidType || hasValidExtension;
    }

    processImageFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            console.log('File processed successfully');
            this.state.currentImage = e.target.result;
            this.state.currentStep = 'modeSelection';
            this.updateUI();
        };

        reader.onerror = () => {
            this.showNotification('Error reading the file. Please try again.', 'error');
        };

        reader.readAsDataURL(file);
    }

    selectMode(mode) {
        console.log('Selecting mode:', mode);
        
        // Remove previous selection
        if (this.modeOptions) {
            this.modeOptions.forEach(option => option.classList.remove('selected'));
        }
        
        // Add selection to clicked option
        const selectedOption = document.querySelector(`[data-mode="${mode}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        this.state.selectedMode = mode;
        
        // Enable start analysis button
        if (this.startAnalysisBtn) {
            this.startAnalysisBtn.disabled = false;
        }
    }

    startAnalysis() {
        if (!this.state.selectedMode || !this.state.currentImage) {
            console.log('Cannot start analysis - missing requirements');
            return;
        }

        console.log('Starting analysis with mode:', this.state.selectedMode);
        
        this.state.currentStep = 'analysis';
        this.state.analysisProgress = 0;
        this.state.analysisStartTime = Date.now();
        this.updateUI();

        this.runAnalysisSimulation();
    }

    runAnalysisSimulation() {
        const mode = ANALYSIS_MODES[this.state.selectedMode];
        const totalSteps = mode.steps;
        const stepDuration = mode.duration / totalSteps;
        
        let currentStep = 0;
        let progress = 0;
        
        // Clear any existing timers
        if (this.analysisTimer) clearInterval(this.analysisTimer);
        if (this.progressTimer) clearInterval(this.progressTimer);

        console.log(`Starting ${mode.name} analysis - ${mode.duration}ms total`);

        // Update analysis steps
        this.updateAnalysisStep(0);
        
        // Progress animation - more frequent updates for smoother progress
        this.progressTimer = setInterval(() => {
            progress += 1; // Increment by 1% each time
            
            // Move to next step when we reach the step threshold
            const stepThreshold = ((currentStep + 1) / totalSteps) * 100;
            if (progress >= stepThreshold && currentStep < totalSteps - 1) {
                currentStep++;
                this.updateAnalysisStep(currentStep);
                console.log(`Advanced to step ${currentStep}`);
            }
            
            // Update progress
            this.state.analysisProgress = Math.min(progress, 100);
            this.updateProgress();
            
            // Complete analysis when we reach 100%
            if (progress >= 100) {
                clearInterval(this.progressTimer);
                console.log('Analysis simulation completed');
                setTimeout(() => this.completeAnalysis(), 500);
                return;
            }
        }, mode.duration / 100); // Update every 1% of total duration
    }

    updateAnalysisStep(stepIndex) {
        const steps = [
            { title: 'Preprocessing image...', subtitle: 'Enhancing image quality and normalizing data' },
            { title: 'Running AI inference...', subtitle: 'Deep learning model analyzing anatomical structures' },
            { title: 'Processing results...', subtitle: 'Calculating confidence scores and risk assessment' },
            { title: 'Generating report...', subtitle: 'Compiling findings and creating visualizations' }
        ];

        if (steps[stepIndex]) {
            if (this.loadingTitle) this.loadingTitle.textContent = steps[stepIndex].title;
            if (this.loadingSubtitle) this.loadingSubtitle.textContent = steps[stepIndex].subtitle;
        }

        // Update step indicators
        if (this.analysisSteps) {
            this.analysisSteps.forEach((step, index) => {
                const icon = step.querySelector('i');
                if (index < stepIndex) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                    if (icon) {
                        icon.className = 'fas fa-check-circle';
                    }
                } else if (index === stepIndex) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                    if (icon) {
                        icon.className = 'fas fa-spinner fa-spin';
                    }
                } else {
                    step.classList.remove('active', 'completed');
                    if (icon) {
                        icon.className = 'fas fa-clock';
                    }
                }
            });
        }
    }

    updateProgress() {
        // Update progress bar
        if (this.progressBar) {
            this.progressBar.style.width = `${this.state.analysisProgress}%`;
        }
        
        // Update percentage text
        if (this.progressPercentage) {
            this.progressPercentage.textContent = `${Math.round(this.state.analysisProgress)}%`;
        }

        // Update ETA
        if (this.state.analysisStartTime && this.state.analysisProgress > 0 && this.state.analysisProgress < 100) {
            const elapsed = Date.now() - this.state.analysisStartTime;
            const estimated = (elapsed / this.state.analysisProgress) * (100 - this.state.analysisProgress);
            if (this.progressETA) {
                this.progressETA.textContent = `ETA: ${Math.ceil(estimated / 1000)}s`;
            }
        } else if (this.progressETA) {
            this.progressETA.textContent = this.state.analysisProgress >= 100 ? 'Complete!' : 'Calculating...';
        }
    }

    completeAnalysis() {
        const analysisTime = ((Date.now() - this.state.analysisStartTime) / 1000).toFixed(1);
        
        // Generate analysis results
        const results = this.generateAnalysisResults();
        
        this.state.analysisResults = results;
        this.state.currentStep = 'results';
        this.state.analysisProgress = 100;
        this.updateUI();

        // Update analysis details
        if (this.analysisDetails) {
            const mode = ANALYSIS_MODES[this.state.selectedMode];
            this.analysisDetails.textContent = `Mode: ${mode.name} • Time: ${analysisTime}s • Model: v2.1`;
        }

        // Generate heatmap
        setTimeout(() => this.generateHeatmap(), 500);
        
        this.showNotification('Analysis completed successfully!', 'success');
        
        // Scroll to results
        setTimeout(() => {
            if (this.resultsSection) {
                this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }

    generateAnalysisResults() {
        const randomNum = Math.random();
        
        if (randomNum < 0.4) {
            return SAMPLE_RESULTS.normal;
        } else if (randomNum < 0.8) {
            return SAMPLE_RESULTS.abnormal_mild;
        } else {
            return SAMPLE_RESULTS.abnormal_severe;
        }
    }

    generateHeatmap() {
        const canvas = this.heatmapCanvas;
        const img = this.analysisImage;
        
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth || 512;
        canvas.height = img.naturalHeight || 512;

        // Create gradient-based heatmap
        const gradient = ctx.createRadialGradient(
            canvas.width * 0.6, canvas.height * 0.4, 0,
            canvas.width * 0.6, canvas.height * 0.4, canvas.width * 0.3
        );
        
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add secondary attention areas based on findings
        if (this.state.analysisResults && this.state.analysisResults.findings.length > 1) {
            const gradient2 = ctx.createRadialGradient(
                canvas.width * 0.3, canvas.height * 0.7, 0,
                canvas.width * 0.3, canvas.height * 0.7, canvas.width * 0.2
            );
            
            gradient2.addColorStop(0, 'rgba(255, 100, 0, 0.7)');
            gradient2.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    updateUI() {
        this.updateSectionVisibility();
        
        // Update image if available
        if (this.state.currentImage && this.analysisImage) {
            this.analysisImage.src = this.state.currentImage;
        }

        // Update results if available
        if (this.state.analysisResults) {
            this.displayResults();
        }

        // Update heatmap visibility
        if (this.heatmapOverlay) {
            this.heatmapOverlay.classList.toggle('hidden', !this.state.heatmapVisible);
        }
    }

    updateSectionVisibility() {
        // Hide all sections first
        const sections = [this.welcomeSection, this.uploadSection, this.modeSelection, this.resultsSection];
        sections.forEach(section => {
            if (section) section.classList.add('hidden');
        });

        // Show appropriate sections based on step
        switch (this.state.currentStep) {
            case 'upload':
                if (this.welcomeSection) this.welcomeSection.classList.remove('hidden');
                if (this.uploadSection) this.uploadSection.classList.remove('hidden');
                // Reset upload state
                if (this.uploadContent) this.uploadContent.classList.remove('hidden');
                if (this.loadingState) this.loadingState.classList.add('hidden');
                break;
                
            case 'modeSelection':
                if (this.modeSelection) this.modeSelection.classList.remove('hidden');
                break;
                
            case 'analysis':
                if (this.uploadSection) this.uploadSection.classList.remove('hidden');
                if (this.uploadContent) this.uploadContent.classList.add('hidden');
                if (this.loadingState) this.loadingState.classList.remove('hidden');
                break;
                
            case 'results':
                if (this.resultsSection) this.resultsSection.classList.remove('hidden');
                break;
        }
    }

    displayResults() {
        if (!this.state.analysisResults) return;
        
        // Update risk assessment
        this.updateRiskAssessment();
        
        // Update findings list
        this.updateFindingsList();
    }

    updateRiskAssessment() {
        const results = this.state.analysisResults;
        if (!this.riskLevel || !this.riskSummary) return;

        const riskClass = `risk-${results.riskLevel.toLowerCase()}`;
        this.riskLevel.className = `risk-level ${riskClass}`;
        
        this.riskLevel.innerHTML = `
            <span class="risk-indicator"></span>
            <span class="risk-text">${results.riskLevel} Risk</span>
        `;
        
        this.riskSummary.textContent = results.summary;
    }

    updateFindingsList() {
        const results = this.state.analysisResults;
        if (!this.findingsList) return;

        this.findingsList.innerHTML = '';
        
        results.findings.forEach(finding => {
            const findingElement = this.createFindingElement(finding);
            this.findingsList.appendChild(findingElement);
        });
    }

    createFindingElement(finding) {
        const element = document.createElement('div');
        element.className = `finding-item severity-${finding.severity}`;
        
        const confidencePercent = Math.round(finding.confidence * 100);
        const confidenceClass = this.getConfidenceClass(finding.confidence);
        
        element.innerHTML = `
            <div class="finding-header">
                <div class="finding-name">${finding.condition.replace('_', ' ')}</div>
                <div class="finding-confidence">
                    <div class="confidence-bar">
                        <div class="confidence-fill ${confidenceClass}" 
                             style="width: ${confidencePercent}%"></div>
                    </div>
                    <span class="confidence-text">${confidencePercent}%</span>
                </div>
            </div>
            <div class="finding-explanation">${finding.explanation}</div>
        `;
        
        return element;
    }

    getConfidenceClass(confidence) {
        if (confidence >= 0.7) return 'confidence-high';
        if (confidence >= 0.5) return 'confidence-moderate';
        return 'confidence-low';
    }

    // Image manipulation methods
    toggleHeatmap() {
        this.state.heatmapVisible = !this.state.heatmapVisible;
        this.updateUI();
        
        if (this.toggleHeatmapBtn) {
            const icon = this.toggleHeatmapBtn.querySelector('i');
            if (icon) {
                icon.className = this.state.heatmapVisible ? 'fas fa-eye-slash' : 'fas fa-layer-group';
            }
        }
    }

    zoomImage(factor) {
        const newZoom = Math.max(0.5, Math.min(3, this.state.imageZoom * factor));
        this.state.imageZoom = newZoom;
        this.applyImageTransform();
    }

    resetImageView() {
        this.state.imageZoom = 1;
        this.state.imagePosition = { x: 0, y: 0 };
        this.applyImageTransform();
    }

    applyImageTransform() {
        const { imageZoom, imagePosition } = this.state;
        
        if (this.analysisImage) {
            this.analysisImage.style.transform = 
                `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`;
        }
    }

    setupImagePanning() {
        if (!this.imageContainer) return;

        let isPanning = false;
        let startX, startY;

        this.imageContainer.addEventListener('mousedown', (e) => {
            if (this.state.imageZoom <= 1) return;
            
            isPanning = true;
            startX = e.clientX;
            startY = e.clientY;
            this.imageContainer.classList.add('panning');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            this.state.imagePosition = {
                x: this.state.imagePosition.x + deltaX,
                y: this.state.imagePosition.y + deltaY
            };
            
            this.applyImageTransform();
            startX = e.clientX;
            startY = e.clientY;
        });

        document.addEventListener('mouseup', () => {
            isPanning = false;
            if (this.imageContainer) {
                this.imageContainer.classList.remove('panning');
            }
        });
    }

    // Modal methods
    openExportModal() {
        if (this.exportModal) {
            this.exportModal.classList.remove('hidden');
        }
    }

    openHistoryModal() {
        if (this.historyModal) {
            this.historyModal.classList.remove('hidden');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    exportReport(format) {
        if (!this.state.analysisResults) return;

        // Simulate export process
        this.showNotification(`Exporting report as ${format.toUpperCase()}...`, 'info');
        
        setTimeout(() => {
            const filename = `medx-analysis-${Date.now()}.${format}`;
            this.showNotification(`Report exported as ${filename}`, 'success');
            this.closeModal('exportModal');
        }, 1500);
    }

    // Navigation methods
    goBackToUpload() {
        this.state.currentStep = 'upload';
        this.state.selectedMode = null;
        this.updateUI();
        
        // Reset mode selection
        if (this.modeOptions) {
            this.modeOptions.forEach(option => option.classList.remove('selected'));
        }
        if (this.startAnalysisBtn) {
            this.startAnalysisBtn.disabled = true;
        }
    }

    startNewAnalysis() {
        // Reset all state
        this.state = {
            currentStep: 'upload',
            selectedMode: null,
            analysisProgress: 0,
            currentImage: null,
            analysisResults: null,
            analysisStartTime: null,
            heatmapVisible: false,
            imageZoom: 1,
            imagePosition: { x: 0, y: 0 }
        };

        // Clear timers
        if (this.analysisTimer) clearInterval(this.analysisTimer);
        if (this.progressTimer) clearInterval(this.progressTimer);

        // Reset file input
        if (this.fileInput) this.fileInput.value = '';
        
        // Reset mode selection
        if (this.modeOptions) {
            this.modeOptions.forEach(option => option.classList.remove('selected'));
        }
        if (this.startAnalysisBtn) {
            this.startAnalysisBtn.disabled = true;
        }

        // Update UI and scroll to top
        this.updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Event handlers
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.uploadArea && this.state.currentStep === 'upload') {
            this.uploadArea.classList.add('dragover');
        }
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.uploadArea && !this.uploadArea.contains(e.relatedTarget)) {
            this.uploadArea.classList.remove('dragover');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.uploadArea) {
            this.uploadArea.classList.remove('dragover');
        }
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            this.handleFileSelect(files);
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: New analysis
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.startNewAnalysis();
        }
        
        // Ctrl/Cmd + E: Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            if (this.state.currentStep === 'results') {
                this.openExportModal();
            }
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            this.closeModal('exportModal');
            this.closeModal('historyModal');
        }
        
        // H: Toggle heatmap
        if (e.key === 'h' || e.key === 'H') {
            if (this.state.currentStep === 'results') {
                this.toggleHeatmap();
            }
        }
    }

    // Utility methods
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button type="button" class="notification-close">×</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            color: var(--color-text);
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 1001;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Type-specific styling
        const typeColors = {
            success: 'var(--color-success)',
            error: 'var(--color-error)',
            warning: 'var(--color-warning)',
            info: 'var(--color-info)'
        };
        
        const icon = notification.querySelector('i');
        if (icon) {
            icon.style.color = typeColors[type] || typeColors.info;
        }
        
        // Close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
            color: var(--color-text-secondary);
        `;
        
        closeBtn.addEventListener('click', () => notification.remove());
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize application
window.medxAnalyzer = new MedXAnalyzer();