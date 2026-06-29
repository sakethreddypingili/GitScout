# GitScout Developer Documentation

GitScout is an advanced, highly interactive client-side web application built to search, analyze, and visualize GitHub profiles and repository data. Using the official GitHub REST API and Chart.js, the application translates raw developer statistics into detailed visualization dashboards (including language distribution, star ratings, and activity charts). It incorporates modern glassmorphism design principles, responsive grids, and perspective-based 3D animations.

---

## Directory Structure

This repository contains the following structural layout:
* index.html - Defines the semantic HTML5 layout of the dashboard, search controls, and visualization panels.
* css/styles.css - Implements the visual styling, dark mode configuration, custom layout classes, and layout variables.
* js/main.js - Bootstraps the application, registers events, and coordinates search operations.
* js/api.js - Interfaces directly with the GitHub REST API, handling requests, rate limits, and network state wrapper functions.
* js/chart.js - Maps user repository statistics into datasets for Chart.js doughnut, bar, and line graphs.
* js/ui.js - Updates the Document Object Model (DOM) dynamically based on response models.
* js/animations.js - Handles perspective transforms for 3D tilt effects, slide reveals, and fade transitions.
* js/utils.js - Provides shared helper utilities, input sanitizers, and numerical converters.

---

## Architectural Flow & Communication Diagram

```
[ User Inputs Search ] 
        │
        ▼
[ main.js ] ──(Trigger Search)──► [ api.js ] ──(Fetch JSON)──► [ GitHub REST API ]
        │                                                              │
        ▼                                                              ▼
[ ui.js ] ◄──(Render HTML Panels)── [ chart.js ] ◄──(Parse Arrays Data)┘
        │
        ▼
[ animations.js ] (Apply 3D Tilt, Implosion & Fade transitions)
```

---

## Module Specifications

### 1. App Entry (js/main.js)
The main controller manages core application events. It listens to form submissions and click events, coordinates the asynchronous pipeline when fetching users, sets the visual states (loading spinners, error templates, output blocks), and syncs local user color schemes.

### 2. GitHub REST Client (js/api.js)
Coordinates API requests using fetch. It handles request status validation, handles errors such as 404 (user not found), formats endpoint responses into standard models, and manages basic rate limiting checks.
* User profiles: /users/{username}
* Repositories: /users/{username}/repos?per_page=100
* Languages: /repos/{username}/{repo}/languages (when deep-diving into individual repository stats)

### 3. Charting Service (js/chart.js)
Aggregates repository data to generate charts using Chart.js:
* Language Distribution: A doughnut chart representing total bytes per language.
* Star Popularity: A horizontal bar chart identifying top repositories by star count.
* Activity Trend: A line chart showing commit frequencies and repository creation dates.
To match the translucent UI theme, chart backgrounds are configured with custom semi-transparent color schemes and font configurations.

### 4. DOM Engine (js/ui.js)
Maintains functions that map API data models to the DOM. It builds user profile headers, populates stats blocks (followers, following, gists, public repos), sets up paginated or grid layouts for repositories, and handles the display of warning prompts when users are not found.

### 5. Animation Engine (js/animations.js)
Leverages CSS transitions, keyframes, and JavaScript event loops to deliver smooth motion:
* 3D Card Tilt: Tracks mouse positions over profile cards to dynamically apply transform: rotateX() and rotateY() to simulate depth.
* Sequential Reveals: Intersects container elements and applies delayed fade-in animations.
* Implosion transitions: Erases the current active state with a compression scale effect before showing new search results.

### 6. Utility Toolkit (js/utils.js)
Contains stateless helpers used across files:
* Number compactors (e.g. converting 12300 to 12.3k).
* Date structure parsers.
* Input sanitizers to prevent cross-site scripting (XSS) when injecting user bios.

---

## Design System & Styling Architecture

The application UI is built around a glassmorphism theme defined in css/styles.css:
* Variables: Customized CSS properties define border radii, translucent shadows, and light/dark theme variables.
* Backdrop Filters: Utilizes backdrop-filter: blur() with translucent borders to overlay structural panels on top of animated ambient gradients.
* Dark Mode: Seamless theme switching is supported by toggling a CSS class on the root element.

---

## Local Development & Setup

### Prerequisites
A modern browser and a command-line interface.

### Running Locally
1. Navigate to the project root directory:
   ```bash
   cd GitScout
   ```
2. Start a simple web server:
   ```bash
   python -m http.server 8000
   ```
3. Open a browser and navigate to `http://localhost:8000`.
