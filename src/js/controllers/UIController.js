import { messages, tableHeaders, distributionLabels } from '../utils/i18n.js';
import config from '../../config/config.js';

export class UIController {
    constructor() {
        this.initializeElements();
        this.initializeLanguage();
        this.initializePreviewLink();
    }

    initializeElements() {
        this.elements = {
            fetchButton: document.getElementById('fetchGrades'),
            downloadButton: document.getElementById('downloadCSV'),
            uploadButton: document.getElementById('uploadToGist'),
            statusMessage: document.getElementById('statusMessage'),
            gradesContainer: document.getElementById('gradesContainer'),
            actionButtons: document.getElementById('actionButtons'),
            uploadedData: document.getElementById('uploadedData'),
            langEN: document.getElementById('langEN'),
            langZH: document.getElementById('langZH'),
            previewLink: document.getElementById('previewLink'),
            manualUploadButton: document.getElementById('manualUpload')
        };
        this.currentGrades = null;
    }

    initializeLanguage() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.setLanguage(this.currentLang);
        
        this.elements.langEN.addEventListener('click', () => this.setLanguage('en'));
        this.elements.langZH.addEventListener('click', () => this.setLanguage('zh'));
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        this.elements.langEN.classList.toggle('active', lang === 'en');
        this.elements.langZH.classList.toggle('active', lang === 'zh');
        
        document.querySelectorAll(`[data-${lang}]`).forEach(element => {
            element.textContent = element.getAttribute(`data-${lang}`);
        });
    }

    showStatus(messageKey) {
        const message = messages[messageKey]?.[this.currentLang] || messageKey;
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status ${messageKey}`;
    }

    showUploadStatus(messageKey) {
        const message = messages[messageKey]?.[this.currentLang] || messageKey;
        const uploadMessage = document.getElementById('uploadMessage');
        uploadMessage.textContent = message;
        uploadMessage.className = `upload-status ${messageKey}`;
    }

    displayGrades(grades) {
        if (!grades || !Array.isArray(grades)) return;

        const table = this.createGradesTable(grades);
        this.elements.gradesContainer.innerHTML = '';
        this.elements.gradesContainer.appendChild(table);
        this.elements.actionButtons.style.display = 'block';
    }

    createGradesTable(grades) {
        const table = document.createElement('table');
        table.innerHTML = this.getTableHeaders();
        
        grades.forEach(grade => {
            const row = this.createGradeRow(grade);
            table.appendChild(row);
        });

        return table;
    }

    getTableHeaders() {
        return `
            <tr>
                ${tableHeaders[this.currentLang].map(h => `<th>${h}</th>`).join('')}
            </tr>
        `;
    }

    createGradeRow(grade) {
        const labels = distributionLabels[this.currentLang];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${grade.year || ''}</td>
            <td>${grade.course || ''}</td>
            <td>${grade.courseNumber || ''}</td>
            <td>${grade.courseClass || ''}</td>
            <td>${grade.grade || ''}</td>
            <td>
                ${labels.lower}: ${grade.distribution?.lower || '0%'}<br>
                ${labels.same}: ${grade.distribution?.same || '0%'}<br>
                ${labels.higher}: ${grade.distribution?.higher || '0%'}
            </td>
        `;
        return row;
    }

    initializePreviewLink() {
        // Get GIST_ID from config
        const { GIST_ID } = config;
        if (GIST_ID) {
            this.elements.previewLink.href = `https://gist.github.com/${GIST_ID}`;
        }
    }
} 