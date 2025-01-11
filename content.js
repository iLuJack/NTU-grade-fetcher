// Add prefixes to easily identify your logs
console.log('[Grade Fetcher]:', 'Content script loaded');
console.log('[Grade Fetcher]:', 'Starting grade extraction');

function extractGrades() {
    console.group('[Grade Fetcher] Extraction Process'); // Creates a collapsible group
    console.log('Finding grade rows...');
    
    const grades = [];
    console.log('Initialized empty grades array');
    
    try {
        // Find all table rows
        const gradeRows = document.querySelectorAll('.table-rows');
        console.log(`Found ${gradeRows.length} grade rows`);
        
        gradeRows.forEach((row, index) => {
            console.log(`Processing row ${index + 1} of ${gradeRows.length}`);
            
            try {
                // Extract course title and grade
                const courseTitle = row.querySelector('.table-column-course-title').textContent.trim();
                const grade = row.querySelector('.table-column-grade').textContent.trim();
                const year = row.querySelector('.table-column_academic-year').textContent.trim();
                const courseNumber = row.querySelector('.table-column_course-number').textContent.trim();
                const courseClass = row.querySelector('.table-column-class').textContent.trim();

                // Find the corresponding dropdown section (it's the next sibling div)
                const dropdownSection = row.nextElementSibling;
                
                // Extract grade distribution percentages
                const distributions = dropdownSection.querySelectorAll('.dropdown-grade-inline p');
                const lowerPercent = distributions[0]?.textContent.trim() || '0%';
                const samePercent = distributions[1]?.textContent.trim() || '0%';
                const higherPercent = distributions[2]?.textContent.trim() || '0%';
                
                console.log('Extracted data:', {
                    course: courseTitle,
                    grade: grade,
                    distribution: {
                        lower: lowerPercent,
                        same: samePercent,
                        higher: higherPercent
                    },
                    year: year,
                    courseNumber: courseNumber,
                    courseClass: courseClass
                });
                
                // Add all information to our array
                grades.push({
                    course: courseTitle,
                    grade: grade,
                    distribution: {
                        lower: lowerPercent,
                        same: samePercent,
                        higher: higherPercent
                    },
                    year: year,
                    courseNumber: courseNumber,
                    courseClass: courseClass
                });                
            } catch (rowError) {
                console.error(`Error processing row ${index}:`, rowError);
            }
        });
        
        console.log('Grade extraction complete');
        console.log('Final grades array:', grades);
        
    } catch (error) {
        console.error('[Grade Fetcher] Error:', error);
    }
    
    console.groupEnd(); // Ends the group
    
    return grades;
}

// Message listener remains the same
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);
    
    if (request.action === 'fetchGrades') {
        console.log('Fetch grades action received');
        
        try {
            const grades = extractGrades();
            console.log('Grades extracted successfully:', grades);
            sendResponse({ grades });
            
        } catch (error) {
            console.error('Error in message handler:', error);
            sendResponse({ error: error.message });
        }
    } else {
        console.warn('Unknown action received:', request.action);
    }
});

console.log('Content script initialization complete');