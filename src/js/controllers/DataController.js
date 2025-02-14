import { convertToCSV, downloadCSV } from '../utils/csvHelper.js';

export class DataController {
    static async fetchGrades() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                throw new Error('No active tab found');
            }

            return new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tab.id, { action: 'fetchGrades' }, response => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }
                    if (response?.error) {
                        reject(new Error(response.error));
                        return;
                    }
                    if (response?.grades) {
                        resolve(response.grades);
                    } else {
                        reject(new Error('No grades found'));
                    }
                });
            });
        } catch (error) {
            throw new Error(`Failed to fetch grades: ${error.message}`);
        }
    }

    static transformGradeData(grade, useDefaultValues = false) {
        return {
            Year: grade.year || (useDefaultValues ? '' : 'N/A'),
            Course: grade.course || (useDefaultValues ? '' : 'N/A'),
            'Course Number': grade.courseNumber || (useDefaultValues ? '' : 'N/A'),
            Class: grade.courseClass || (useDefaultValues ? '' : 'N/A'),
            Grade: grade.grade || (useDefaultValues ? '' : 'N/A'),
            'Lower %': grade.distribution?.lower || '0%',
            'Same %': grade.distribution?.same || '0%',
            'Higher %': grade.distribution?.higher || '0%'
        };
    }

    static prepareCSVData(grades) {
        const headers = [
            'Year', 'Course', 'Course Number', 'Class', 
            'Grade', 'Lower %', 'Same %', 'Higher %'
        ];
        
        const rows = grades.map(grade => this.transformGradeData(grade, true));
        return convertToCSV(rows, headers);
    }

    static downloadGradesCSV(grades) {
        const csv = this.prepareCSVData(grades);
        downloadCSV(csv, 'grade-distribution.csv');
    }
} 