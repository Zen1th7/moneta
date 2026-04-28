## ADDED Requirements

### Requirement: Project is scaffolded with Vue 3, Quasar, and Capacitor
The system SHALL be rebuilt as a Quasar Framework project using Vue 3 Composition API, with Capacitor configured for Android and iOS native builds.

#### Scenario: Project scaffold complete
- **WHEN** the developer runs the project setup
- **THEN** the system SHALL build successfully with `quasar build -m capacitor` targeting Android and iOS without errors

#### Scenario: Development server runs
- **WHEN** the developer runs `quasar dev`
- **THEN** the system SHALL start a hot-reload development server accessible in the browser and via Capacitor live reload on a connected device

---

### Requirement: Midnight Gold design system is implemented as Quasar theme variables
The system SHALL port the existing CSS design system (colors, typography, spacing) to Quasar's SCSS theme variables so all components use the Midnight Gold palette automatically.

#### Scenario: Dark mode theme applies correctly
- **WHEN** the app is in dark mode
- **THEN** the system SHALL render with `#0A0F1A` background, `#F59E0B` primary color, and Plus Jakarta Sans typography

#### Scenario: Light mode theme applies correctly
- **WHEN** the app is in light mode
- **THEN** the system SHALL render with `#FAFAF5` background, `#B45309` primary color, and consistent component styling

---

### Requirement: All v1 features are available in the migrated app
The system SHALL implement every feature from the vanilla JS v1 app as Vue 3 components with full feature parity before the old `www/` codebase is retired.

#### Scenario: Feature parity checklist
- **WHEN** the Vue 3 app is complete
- **THEN** the system SHALL support: wallets, transactions, multi-currency, categories, analytics, settings, theme toggle, language switching, biometric lock, notifications, data export/import, and all new v2 features

---

### Requirement: Existing localStorage data is migrated automatically
The system SHALL detect v1 localStorage data on first launch and migrate it to the v2 schema without data loss.

#### Scenario: First launch after update
- **WHEN** the app detects v1 data in localStorage and no v2 migration marker
- **THEN** the system SHALL run a migration script that transforms v1 keys to v2 schema, writes a migration version marker, and completes silently

#### Scenario: Migration failure
- **WHEN** the migration encounters an error
- **THEN** the system SHALL preserve the original v1 data untouched, log the error, and show the user a message to contact support

---

### Requirement: Native Capacitor APIs are used for camera and notifications
The system SHALL use Capacitor plugins (Camera, LocalNotifications, Filesystem) instead of browser Web APIs where native capability is required.

#### Scenario: Camera opens natively on device
- **WHEN** the user triggers receipt photo capture on a physical Android or iOS device
- **THEN** the system SHALL open the native camera app via `@capacitor/camera` (not browser `<input type="file">`)

#### Scenario: Recurring transaction notification delivered natively
- **WHEN** a recurring transaction is auto-created on app open
- **THEN** the system SHALL deliver a native push notification via `@capacitor/local-notifications` summarising what was created
