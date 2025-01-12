class GradeExtractor {
    static SELECTORS = {
        rows: '.table-rows',
        courseTitle: '.table-column-course-title',
        grade: '.table-column-grade',
        year: '.table-column_academic-year',
        courseNumber: '.table-column_course-number',
        courseClass: '.table-column-class',
        distribution: '.dropdown-grade-inline p',
        distributionContainer: '.dropdown-grade-distrubute'
    };

    static extractGrades() {
        const grades = [];
        const gradeRows = document.querySelectorAll(this.SELECTORS.rows);

        gradeRows.forEach(row => {
            try {
                const dropdownSection = row.nextElementSibling;
                const hasDistribution = dropdownSection?.querySelector(this.SELECTORS.distributionContainer);
                
                if (hasDistribution) {
                    const gradeData = this.extractRowData(row);
                    if (gradeData && this.hasValidDistribution(gradeData.distribution)) {
                        grades.push(gradeData);
                    }
                }
            } catch (error) {
                console.error('Error processing row:', error);
            }
        });

        return grades;
    }

    static extractRowData(row) {
        const courseTitle = this.getElementText(row, this.SELECTORS.courseTitle);
        const grade = this.getElementText(row, this.SELECTORS.grade);
        const year = this.getElementText(row, this.SELECTORS.year);
        const courseNumber = this.getElementText(row, this.SELECTORS.courseNumber);
        const courseClass = this.getElementText(row, this.SELECTORS.courseClass);
        const distribution = this.getDistributionData(row);

        return {
            course: courseTitle,
            grade,
            year,
            courseNumber,
            courseClass,
            distribution
        };
    }

    static getElementText(element, selector) {
        return element.querySelector(selector)?.textContent.trim() || 'N/A';
    }

    static getDistributionData(row) {
        const dropdownSection = row.nextElementSibling;
        const distributionContainer = dropdownSection?.querySelector(this.SELECTORS.distributionContainer);
        const distributions = distributionContainer.querySelectorAll('p');
        
        return {
            lower: distributions[0]?.textContent.trim() || '',
            same: distributions[1]?.textContent.trim() || '',
            higher: distributions[2]?.textContent.trim() || ''
        };
    }

    static hasValidDistribution(distribution) {
        return Object.values(distribution).some(value => value && value !== '%');
    }
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchGrades') {
        try {
            const grades = GradeExtractor.extractGrades();
            if (!grades || grades.length === 0) {
                sendResponse({ error: 'No grades found' });
                return true;
            }
            sendResponse({ grades });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }
    return true;
}); 