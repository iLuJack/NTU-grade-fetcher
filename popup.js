// Wait for the popup HTML to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Grade Fetcher Popup]:', 'Popup DOM loaded');

    // Get references to HTML elements we'll need
    const fetchButton = document.getElementById('fetchGrades');
    const gradesContainer = document.getElementById('gradesContainer');

    console.log('[Grade Fetcher Popup]:', 'Elements found:', {
        fetchButton: !!fetchButton,
        gradesContainer: !!gradesContainer
    });

    // Add click event listener to the fetch button
    fetchButton.addEventListener('click', async () => {
        console.log('[Grade Fetcher Popup]:', 'Fetch button clicked');
        try {
            // Get the currently active tab in the current window
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('[Grade Fetcher Popup]:', 'Current tab:', tab);

            // Send a message to content.js running in the active tab
            console.log('[Grade Fetcher Popup]:', 'Sending message to content script...');
            chrome.tabs.sendMessage(tab.id, { action: 'fetchGrades' }, response => {
                console.log('[Grade Fetcher Popup]:', 'Received response:', response);
                
                // If we got grades back from content.js
                if (response && response.grades) {
                    console.log('[Grade Fetcher Popup]:', 'Grades found:', response.grades);
                    displayGrades(response.grades);  // Show the grades in popup
                } else {
                    console.error('[Grade Fetcher Popup]:', 'No grades in response');
                    gradesContainer.innerHTML = '<p class="error">No grades found or error occurred</p>';
                }
            });
        } catch (error) {
            console.error('[Grade Fetcher Popup]:', 'Error in click handler:', error);
            gradesContainer.innerHTML = '<p class="error">Error fetching grades</p>';
        }
    });

    // Function to display grades in the popup
    function displayGrades(grades) {
        console.log('[Grade Fetcher Popup]:', 'Displaying grades:', grades);
        
        // Clear any existing content
        gradesContainer.innerHTML = '';
        
        // Create a new table element
        const table = document.createElement('table');
        // Add table headers
        table.innerHTML = `
            <tr>
                <th>Year</th>
                <th>Course</th>
                <th>Course Number</th>
                <th>Class</th>
                <th>Grade</th>
                <th>Distribution</th>
            </tr>
        `;
        
        // Add each grade as a new row in the table
        grades.forEach(grade => {
            console.log('[Grade Fetcher Popup]:', 'Adding grade row:', grade);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${grade.year}</td>
                <td>${grade.course}</td>
                <td>${grade.courseNumber}</td>
                <td>${grade.courseClass}</td>
                <td>${grade.grade}</td>
                <td>
                    Lower: ${grade.distribution.lower}<br>
                    Same: ${grade.distribution.same}<br>
                    Higher: ${grade.distribution.higher}
                </td>
            `;
            table.appendChild(row);
        });
        
        // Add the completed table to the popup
        gradesContainer.appendChild(table);
        console.log('[Grade Fetcher Popup]:', 'Table display complete');
    }
});