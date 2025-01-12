import { UIController } from './UIController.js';
import { DataController } from './DataController.js';
import { downloadCSV } from '../utils/csvHelper.js';

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
    }

    async handleFetchGrades() {
        try {
            this.ui.showStatus('fetching');
            const grades = await DataController.fetchGrades();
            this.ui.currentGrades = grades;
            this.ui.displayGrades(grades);
            this.ui.showStatus('success');
        } catch (error) {
            this.ui.showStatus('error');
        }
    }

    handleDownload() {
        if (!this.ui.currentGrades) return;
        DataController.downloadGradesCSV(this.ui.currentGrades);
    }

    async handleUpload() {
        try {
            if (!this.ui.currentGrades) {
                this.ui.showStatus('no_grades');
                return;
            }
            
            this.ui.showStatus('uploading');
            
            try {
                const { gistUrl } = await DataController.updateCentralGist(this.ui.currentGrades);
                
                // Store upload info
                const timestamp = new Date().toISOString();
                await chrome.storage.local.set({
                    'lastGistUrl': gistUrl,
                    'lastUpload': timestamp
                });

                this.ui.updateUploadInfo(gistUrl, timestamp);
                this.ui.showStatus('upload_success');
            } catch (error) {
                console.error('Upload error:', error);
                if (error.message.includes('token')) {
                    this.ui.showStatus('token_error');
                } else {
                    this.ui.showStatus('upload_error');
                }
            }
        } catch (error) {
            console.error('General error:', error);
            this.ui.showStatus('error');
        }
    }

    checkPreviousUploads() {
        chrome.storage.local.get(['lastGistUrl', 'lastUpload'], result => {
            if (result.lastGistUrl && result.lastUpload) {
                this.ui.updateUploadInfo(result.lastGistUrl, result.lastUpload);
            }
        });
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