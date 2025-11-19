# ProviderVault - Healthcare Credentialing System

This document provides an overview of the ProviderVault codebase for AI assistants working on this project.

## Project Overview

ProviderVault is a **healthcare credentialing management system** that helps organizations track providers, their credentials, licenses, enrollments, payer contracts, and claims. It's a client-side single-page application (SPA) that uses localStorage for data persistence.

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data Storage**: Browser localStorage
- **Dependencies**: None (no external libraries or frameworks)
- **Build System**: None (static files served directly)

## File Structure

```
/
├── index.html       # Main application (all HTML views/modals)
├── app.js          # All JavaScript logic (~4000+ lines)
├── styles.css      # All CSS styles (~1100+ lines)
├── debug.html      # Debug utility for localStorage inspection
├── standalone.html # Standalone version
└── CLAUDE.md       # This file
```

## Architecture

### Single-Page Application Pattern

The app uses a view-based navigation system. All views are defined in `index.html` and shown/hidden via the `showView(viewName)` function in `app.js`.

### Main Views

- **Dashboard** - Overview with stats, quick actions, and upcoming expirations
- **Providers** - Healthcare provider management with detailed profiles
- **Credentialing** - Credential verification pipeline
- **Enrollments** - Provider enrollment tracking
- **Payers** - Payer contract management
- **Locations** - Practice location management
- **Organizations** - Multi-organization support
- **Claims** - Malpractice/liability claims tracking
- **Analytics** - Reporting and metrics
- **Email Notifications** - Automated notification tracking
- **Settings** - Application settings (placeholder)

### Data Model

Core entities are stored in global arrays and persisted to localStorage:

```javascript
// Global data arrays (app.js lines 10-34)
let providers = [];
let payers = [];
let enrollments = [];
let locations = [];
let contracts = [];
let emailNotifications = [];
let organizations = [];
let claims = [];
let currentOrganization = null;
let currentUser = null;
```

### LocalStorage Keys

All keys are prefixed with `pv` (ProviderVault):

- `pvCurrentUser` - Current authenticated user
- `pvCurrentOrganization` - Currently selected organization
- `pvOrganizations` - All organizations
- `pvProviders` - All providers
- `pvPayers` - All payers
- `pvEnrollments` - All enrollments
- `pvLocations` - All locations
- `pvContracts` - Payer contracts
- `pvEmailNotifications` - Email notification history
- `pvClaims` - Claims data

### Multi-Organization Support

Data is scoped to organizations. When rendering lists, data is filtered by `currentOrganization.id`:

```javascript
const orgProviders = providers.filter(p => p.organizationId === currentOrganization?.id);
```

## Key Conventions

### Naming Conventions

- **Functions**: camelCase (e.g., `saveProvider`, `renderProviders`)
- **Entity IDs**: Uppercase with prefix (e.g., `ORG-001`, `CLM-2024-001`)
- **LocalStorage keys**: `pv` prefix + PascalCase (e.g., `pvProviders`)
- **HTML element IDs**: kebab-case (e.g., `provider-modal`, `claims-list`)
- **CSS classes**: kebab-case (e.g., `.stat-card`, `.provider-info`)

### Function Patterns

1. **Load functions** - Load data from localStorage (e.g., `loadData()`, `loadOrganizations()`)
2. **Save functions** - Persist to localStorage (e.g., `saveProviders()`, `savePayers()`)
3. **Render functions** - Update DOM (e.g., `renderProviders()`, `renderDashboard()`)
4. **Show/Close modal functions** - Modal management (e.g., `showProviderModal()`, `closeProviderModal()`)
5. **Event handlers** - Form submissions (e.g., `saveProvider(event)`, `login(event)`)

### Color Palette

The app uses a consistent color scheme defined in `styles.css`:

- **Primary**: Cyan/Teal (`#06b6d4`)
- **Dark**: Slate (`#1e293b`)
- **Background**: Light gray (`#f8fafc`)
- **Success**: Green (`#10b981`)
- **Warning**: Orange (`#f97316`)
- **Danger**: Red (`#ef4444`)

### Status Badges

Standard status classes are used throughout:

- `.status-active` - Green (Active, Approved)
- `.status-pending` - Yellow (Pending)
- `.status-expired` - Red (Expired, Denied)
- `.status-inactive` - Gray (Inactive)
- `.status-in-progress` - Blue (In Progress)

## Development Workflow

### Running the Application

Since this is a static application with no build step:

1. **Direct file access**: Open `index.html` in a browser
2. **Local server** (recommended for development):
   ```bash
   # Python
   python -m http.server 8000

   # Node.js
   npx serve .
   ```

### Testing Changes

1. Make changes to the relevant file
2. Refresh the browser (use Ctrl+Shift+R for hard refresh to clear cache)
3. Check browser console for errors

### Debugging

- Open `debug.html` to inspect localStorage data
- Use browser DevTools to debug JavaScript
- Console logging is disabled in production (see `app.js` lines 3-7)

### Cache Busting

The HTML files use version query strings for cache busting:
```html
<link rel="stylesheet" href="styles.css?v=7">
<script src="app.js?v=13"></script>
```

When making changes, increment these version numbers.

## Important Code Sections

### Authentication (app.js: 46-96)

Simple localStorage-based auth with demo credentials:
- Email: `admin@providervault.com`
- Password: `demo123`

### View Navigation (app.js: 98-138)

The `showView()` function handles all view switching and triggers appropriate render functions.

### Data Loading (app.js: 716-1117)

`loadData()` initializes all data from localStorage or creates default sample data.

### Provider Management (app.js: 2862-3177)

Comprehensive provider CRUD operations with support for:
- State licenses
- Practice locations
- Hospital affiliations
- Credentialing contacts
- Liability insurance
- Professional references
- Disclosures

### Dashboard Updates (app.js: 1119-1381)

`updateDashboard()` calculates and displays:
- Provider counts
- Enrollment counts
- Pending credentialing items
- Open claims
- Upcoming credential expirations

## Common Tasks

### Adding a New View

1. Add navigation button in sidebar (`index.html` ~lines 61-151)
2. Add view div with class `view` (`index.html`)
3. Add case in `showView()` function (`app.js`)
4. Create render function (e.g., `renderNewView()`)

### Adding a New Entity Type

1. Add global array and state variables (`app.js` top)
2. Add localStorage key constant
3. Create load/save functions
4. Create render function
5. Create modal HTML in `index.html`
6. Create show/close modal functions
7. Create save/edit/delete functions

### Adding Form Fields to Provider

1. Add form field HTML in provider-modal (`index.html` ~lines 679-912)
2. Update `saveProvider()` to read the field
3. Update `editProvider()` to populate the field when editing
4. Update `renderProviderDetail()` if displaying in detail view

### Modifying Styles

1. Find relevant CSS section in `styles.css`
2. CSS is organized by section with comment headers (e.g., `/* ===== BUTTONS ===== */`)
3. Follow existing patterns for consistency

## Best Practices

### When Making Changes

1. **Preserve existing patterns** - Follow the established coding style
2. **Maintain data integrity** - Always validate organizationId assignments
3. **Update cache versions** - Increment version numbers when modifying CSS/JS
4. **Test multi-org** - Ensure changes work correctly with organization filtering
5. **Check localStorage** - Use debug.html to verify data persistence

### Code Quality

1. **No external dependencies** - Keep the app self-contained
2. **Defensive coding** - Check for null/undefined (e.g., `currentOrganization?.id`)
3. **Consistent error handling** - Use alerts for user-facing errors
4. **Clean form state** - Reset forms when closing modals

### Performance

1. **Avoid unnecessary re-renders** - Only call render functions when data changes
2. **Filter data early** - Apply organization filtering before processing
3. **Use event delegation** - For lists with many items

## Known Issues & Considerations

1. **Console logging disabled** - All console.log/warn/error calls are disabled to prevent UI glitches
2. **LocalStorage limits** - Browser localStorage has size limits (~5-10MB)
3. **No real authentication** - Auth is simulated for demo purposes
4. **No backend** - All data is client-side only

## Git Workflow

- Main development branch: Use feature branches prefixed with `claude/`
- Commit messages should be descriptive and explain the "why"
- Test changes locally before pushing

## Debug Utilities

The `debug.html` page provides utilities for:
- Viewing all localStorage data
- Fixing organization ID assignments
- Clearing provider data
- Validating data integrity

Access it at `/debug.html` when running the application.
