import config from '../../config/config.js';
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

    static validateGradeData(grade) {
        return {
            year: grade.year || 'N/A',
            course: grade.course || 'N/A',
            courseNumber: grade.courseNumber || 'N/A',
            courseClass: grade.courseClass || 'N/A',
            grade: grade.grade || 'N/A',
            distribution: {
                lower: grade.distribution?.lower || '0%',
                same: grade.distribution?.same || '0%',
                higher: grade.distribution?.higher || '0%'
            }
        };
    }

    static prepareGradeData(grades) {
        return grades.map(grade => this.validateGradeData(grade));
    }

    static async updateCentralGist(grades) {
        const { GITHUB_TOKEN, GIST_ID } = config;
        
        if (!GITHUB_TOKEN || !GIST_ID) {
            throw new Error('GitHub token or Gist ID not configured');
        }

        const filename = 'grade_distribution_data.csv';
        
        try {
            // 1. Prepare data with all columns (without timestamp)
            const anonymousData = grades.map(grade => ({
                Year: grade.year || '',
                Course: grade.course || '',
                'Course Number': grade.courseNumber || '',
                Class: grade.courseClass || '',
                Grade: grade.grade || '',
                'Lower %': grade.distribution?.lower || '0%',
                'Same %': grade.distribution?.same || '0%',
                'Higher %': grade.distribution?.higher || '0%'
            }));

            // 2. Define CSV headers - same as download
            const headers = [
                'Year',
                'Course',
                'Course Number',
                'Class',
                'Grade',
                'Lower %',
                'Same %',
                'Higher %'
            ];

            // 3. Fetch existing content
            let existingContent = '';
            try {
                existingContent = await this.fetchGistContent(GIST_ID, GITHUB_TOKEN, filename);
            } catch (error) {
                console.warn('No existing content found, creating new Gist');
            }

            // 4. Convert new data to CSV
            const newContent = convertToCSV(anonymousData, headers);
            
            // 5. Combine existing and new content
            const combinedContent = existingContent 
                ? existingContent + '\n' + newContent.split('\n').slice(1).join('\n')
                : newContent;

            // 6. Update Gist
            const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: 'Anonymous Grade Distribution Data',
                    files: {
                        [filename]: {
                            content: combinedContent
                        }
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update Gist: ${errorData.message}`);
            }

            const data = await response.json();
            return {
                gistId: data.id,
                gistUrl: data.html_url
            };
        } catch (error) {
            console.error('Error updating Gist:', error);
            throw error;
        }
    }

    static async fetchGistContent(gistId, token, filename) {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Gist');
        }

        const data = await response.json();
        return data.files[filename]?.content || '';
    }

    static prepareCSVData(grades) {
        const headers = [
            'Year', 'Course', 'Course Number', 'Class', 
            'Grade', 'Lower %', 'Same %', 'Higher %'
        ];
        
        const rows = grades.map(grade => ({
            Year: grade.year,
            Course: grade.course,
            'Course Number': grade.courseNumber,
            Class: grade.courseClass,
            Grade: grade.grade,
            'Lower %': grade.distribution.lower,
            'Same %': grade.distribution.same,
            'Higher %': grade.distribution.higher
        }));

        return convertToCSV(rows, headers);
    }

    static downloadGradesCSV(grades) {
        const csv = this.prepareCSVData(grades);
        downloadCSV(csv, 'grades.csv');
    }

    static getGistUrl() {
        const { GIST_ID } = config;
        return GIST_ID ? `https://gist.github.com/${GIST_ID}` : null;
    }
} 