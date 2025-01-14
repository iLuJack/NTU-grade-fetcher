import { UIController } from './UIController.js';
import { DataController } from './DataController.js';

export class AppController {
    constructor() {
        this.ui = new UIController();
        this.initializeEventListeners();
        this.checkPreviousUploads();
        this.initializePreviewLink();
    }

    initializeEventListeners() {
        this.ui.elements.fetchButton.addEventListener('click', () => this.handleFetchGrades());
        this.ui.elements.downloadButton.addEventListener('click', () => this.handleDownload());
        this.ui.elements.uploadButton.addEventListener('click', () => this.handleUpload());
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

    async handleUpload() {
        try {
            this.ui.showUploadStatus('uploading');
            
            try {
                const { gistUrl } = await DataController.updateCentralGist(this.ui.currentGrades);
                
                // Store upload info
                await chrome.storage.local.set({
                    'lastGistUrl': gistUrl,
                });

                this.ui.showUploadStatus('upload_success');
            } catch (error) {
                console.error('Upload error:', error);
                if (error.message.includes('token')) {
                    console.log('token error:', error);
                } else {
                    this.ui.showUploadStatus('upload_error');
                }
            }
        } catch (error) {
            console.error('General error:', error);
            this.ui.showStatus('error');
        }
    }

    handleManualUpload() {
        window.open('https://forms.gle/QKUrS5xXAgDUTJDt7', '_blank');
    }

    initializePreviewLink() {
        const gistUrl = DataController.getGistUrl();
        if (gistUrl) {
            this.ui.elements.previewLink.href = gistUrl;
        } else {
            this.ui.elements.previewLink.style.display = 'none';
        }
    }
} 