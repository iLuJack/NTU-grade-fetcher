# NTU Grade Fetcher Chrome Extension

A Chrome extension that fetches and displays grades from the NTU grading portal.

## Project Structure
```
project/
├── src/
│   ├── js/
│   │   ├── controllers/
│   │   │   ├── AppController.js     # Manages the application
│   │   │   ├── UIController.js      # Handles UI interactions and updates
│   │   │   └── DataController.js    # Manages data operations
│   │   ├── utils/
│   │   │   ├── i18n.js             # Internationalization utilities
│   │   │   └── csvHelper.js        # CSV export operations
│   │   ├── content.js              # Content script for grade extraction
│   │   └── popup.js                # Popup interface script
│   ├── css/
│   │   └── styles.css              # Extension styling
│   └── assets/
│       ├── icons/                  # Extension icons
│       └── github.png              # GitHub icon for footer
├── popup.html                      # Extension popup interface
└── manifest.json                   # Extension manifest configuration
```

## Features
- View grades from the NTU portal
- See grade distributions
- Multi-language support (English/中文)
- Export grade data to CSV
- Manual grade distribution sharing via Google Forms
- Clean and intuitive interface

## Local Installation
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

## Development

### Content Script (content.js)
- Runs in the context of NTU portal webpage
- Extracts grade data from the portal
- Communicates with the extension popup

### Controllers
- **UIController**: Manages popup interface and user interactions
- **DataController**: Handles data operations and grade processing

### Styling
- All styles are maintained in `src/css/styles.css`
- Supports both light and dark themes
- Responsive design for popup interface

## Permissions
The extension requires:
- `activeTab`: For accessing the current tab
- `storage`: For saving user preferences

## Notes
- Only works on the NTU grading portal
- Requires appropriate portal access permissions
- Uses Chrome's messaging system for communication
- Supports data export to CSV format

## License
This project is licensed under the MIT License - see the LICENSE file for details.
