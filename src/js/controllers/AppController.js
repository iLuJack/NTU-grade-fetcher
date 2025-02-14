import { UIController } from './UIController.js';
import { DataController } from './DataController.js';

export class AppController {
    constructor() {
        this.ui = new UIController();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.ui.elements.fetchButton.addEventListener('click', () => this.handleFetchGrades());
        this.ui.elements.downloadButton.addEventListener('click', () => this.handleDownload());
        this.ui.elements.manualUploadButton.addEventListener('click', () => { this.handleManualUpload(); });
    }

    async handleFetchGrades() {
        try {
            this.ui.showStatus('fetching');
            const grades = await DataController.fetchGrades();
            this.ui.currentGrades = grades;
            this.ui.displayGrades(grades);
            this.ui.showStatus('success');
        } catch (error) {
            console.error('Fetch error:', error);
            this.ui.showStatus('error');
        }
    }

    handleDownload() {
        if (!this.ui.currentGrades) return;
        DataController.downloadGradesCSV(this.ui.currentGrades);
    }

    handleManualUpload() {
        window.open('https://forms.gle/QKUrS5xXAgDUTJDt7', '_blank');
    }
} 