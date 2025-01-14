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

    static async updateCentralGist(grades) {
        const { GITHUB_TOKEN, GIST_ID } = config;
        const statsFilename = 'stats.txt';

        try {
            // 1. Fetch stats first to determine the filename
            let statsContent = '';
            try {
                statsContent = await this.fetchGistContent(GIST_ID, GITHUB_TOKEN, statsFilename);
            } catch (error) {
                console.warn('No existing stats found, initializing new stats');
                statsContent = 'Total-Contributer : 0';
            }

            // 2. Get current count and generate filename
            const match = statsContent.match(/Total-Contributer\s*:\s*(\d+)/);
            // match[0] is Total-Contributer : n
            // match[1] is n
            // 10 means convert to decimal
            const currentCount = match ? parseInt(match[1], 10) : 0;
            const newCount = currentCount + 1;
            const filename = `contributer-${newCount}.csv`;

            // 3. Prepare new grades data
            const anonymousData = grades.map(grade => this.transformGradeData(grade, true));

            // 4. Convert new data to CSV
            const headers = [
                'Year', 'Course', 'Course Number', 'Class',
                'Grade', 'Lower %', 'Same %', 'Higher %'
            ];

            const newContent = convertToCSV(anonymousData, headers);

            // 5. Update stats content
            const updatedStats = statsContent.replace(
                /Total-Contributer\s*:\s*\d+/,
                `Total-Contributer : ${newCount}`
            );

            // 6. Update Gist with both files
            const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
                // PATCH is used to update the existing Gist
                method: 'PATCH',
                headers: {
                    // Bearer is the auth scheme used by Github
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    description: 'Anonymous Grade Distribution Data',
                    files: {
                        [filename]: {
                            content: newContent
                        },
                        [statsFilename]: {
                            content: updatedStats
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
                gistUrl: data.html_url,
                contributerId: newCount
            };
        } catch (error) {
            console.error('Error updating Gist:', error);
            throw error;
        }
    }

    static async fetchGistContent(gistId, token, filename) {
        try {
            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`GitHub API Error: ${error.message}`);
            }

            const data = await response.json();
            const file = data.files[filename];
            
            if (!file) {
                throw new Error(`File "${filename}" not found in gist`);
            }

            // Handle truncated files
            if (file.truncated) {
                const rawResponse = await fetch(file.raw_url);
                return await rawResponse.text();
            }

            return file.content || '';
        } catch (error) {
            console.error('Error fetching gist:', error);
            throw error;
        }
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
        downloadCSV(csv, 'grades.csv');
    }

    static getGistUrl() {
        const { GIST_ID } = config;
        return GIST_ID ? `https://gist.github.com/${GIST_ID}` : null;
    }
} 