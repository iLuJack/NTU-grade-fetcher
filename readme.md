# NTU Grade Fetcher Chrome Extension

A Chrome extension that fetches and displays grades from the NTU grading portal.

## Project Structure
```
project/
├── src/
│   ├── js/
│   │   ├── controllers/
│   │   │   ├── UIController.js      # Handles UI interactions and updates
│   │   │   ├── DataController.js    # Manages data operations and API calls
│   │   │   └── LanguageController.js # Handles i18n and language switching
│   │   ├── utils/
│   │   │   ├── i18n.js             # Internationalization utilities
│   │   │   └── csvHelper.js        # CSV export/import operations
│   │   └── content.js              # Content script for grade extraction
│   ├── css/
│   │   └── styles.css              # Extension styling
│   └── config/
│       ├── config.js               # Extension configuration
│       └── config.template.js      # Template for config settings
├── popup.html                      # Extension popup interface
└── manifest.json                   # Extension manifest configuration
```

## Features
- View grades from the NTU portal
- See grade distributions
- Multi-language support (English/中文)
- Export grade data to CSV
- Share anonymous grade distributions
- Clean and intuitive interface

## Local Installation
1. Clone this repository
2. Copy `src/config/config.template.js` to `src/config/config.js` and update settings
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extension directory
6. The extension icon should appear in your Chrome toolbar

## Development

### Content Script (content.js)
- Runs in the context of NTU portal webpage
- Extracts grade data from the portal
- Communicates with the extension popup

### Controllers
- **UIController**: Manages popup interface and user interactions
- **DataController**: Handles data operations and API communications
- **LanguageController**: Manages language switching and translations

### Configuration
- Create `config.js` from `config.template.js`
- Update API endpoints and settings as needed
- Keep sensitive data in `config.js` (gitignored)

### Styling
- All styles are maintained in `src/css/styles.css`
- Supports both light and dark themes
- Responsive design for popup interface

## Permissions
The extension requires:
- `activeTab`: For accessing the current tab
- `storage`: For saving user preferences
- `scripting`: For injecting content scripts

## Notes
- Only works on the NTU grading portal
- Requires appropriate portal access permissions
- Uses Chrome's messaging system for communication
- Supports data export and sharing capabilities

## License
This project is licensed under the MIT License - see the LICENSE file for details.
