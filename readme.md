# NTU Grade Fetcher Chrome Extension

A Chrome extension that fetches and displays grades from the NTU grading portal.

## project structure
project/
├── src/
│   ├── js/
│   │   ├── controllers/
│   │   │   ├── UIController.js      # UI logic
│   │   │   ├── DataController.js    # Data operations
│   │   │   └── AppController.js     # Main application logic
│   │   ├── utils/
│   │   │   ├── i18n.js             # Internationalization
│   │   │   └── csvHelper.js        # CSV operations
│   │   └── content.js              # Content script
│   ├── css/
│   │   └── styles.css              # Styles
│   └── config/
│       ├── config.js               # Configuration
│       └── config.template.js      # Template for config
├── popup.html                      # Main HTML
└── manifest.json                   # Extension manifest

## Table of Contents
- [Overview](#overview)
- [File Structure](#file-structure)
- [Installation](#installation)
- [Development](#development)
- [Notes](#notes)

## Overview
This extension allows students to:
- View their grades from the NTU portal
- See grade distributions
- Display results in a clean table format

## File Structure
```
.
├── manifest.json      # Extension configuration
├── popup.html        # Extension popup interface
├── popup.js         # Popup functionality
├── content.js       # Webpage interaction script
├── styles.css       # Styling for popup
└── readme.md        # Documentation
```

## Installation
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the extension directory
4. The extension icon should appear in your Chrome toolbar

## Development

### Content Script (content.js)
- Runs in webpage context
- Extracts grade data from the NTU portal
- Handles DOM manipulation
- Communicates with popup.js

### Popup Script (popup.js)
- Runs in extension context
- Handles user interface
- Displays grade data
- Manages extension popup window

### Manifest (manifest.json)
- Defines extension permissions
- Specifies content scripts
- Configures extension behavior

## Notes
- The extension only works on the NTU grading portal
- Requires appropriate permissions to access the portal
- Styles are maintained in a separate CSS file
- Extension uses Chrome's messaging system for communication