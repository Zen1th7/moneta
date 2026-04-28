## Context

Recurring transactions already exist in v1 (`recurring-manager.js`, 418 lines). The existing feature supports: daily/monthly/yearly frequencies, auto-execution on app open (unlimited catch-up), CRUD operations, wallet and category assignment. This spec only documents what is **changing or being added** on top of the existing implementation.

## ADDED Requirements

### Requirement: Weekly frequency is supported
The system SHALL support a "weekly" repeat schedule in addition to the existing daily, monthly, and yearly options.

#### Scenario: Create weekly recurring transaction
- **WHEN** the user selects "Weekly" as the frequency when creating a recurring template
- **THEN** the system SHALL schedule the next occurrence 7 days from the start date and advance by 7 days on each execution

---

### Requirement: User can pause and resume a recurring template
The system SHALL allow users to pause a recurring template so no new occurrences are generated until they resume it.

#### Scenario: Pause recurring
- **WHEN** the user taps "Pause" on a recurring template
- **THEN** the system SHALL set `isPaused: true` on the template and stop generating new occurrences during catch-up; the template remains visible in the list with a "Paused" badge

#### Scenario: Resume recurring
- **WHEN** the user taps "Resume" on a paused template
- **THEN** the system SHALL set `isPaused: false`, reset the nextRunDate to today, and resume normal execution from the next app open

---

### Requirement: Catch-up is capped at 90 days
The system SHALL limit automatic catch-up to a maximum of 90 days back from today to prevent flooding the transaction history after a long period of inactivity.

#### Scenario: App opened after more than 90 days
- **WHEN** the app is opened and a recurring transaction's last run date is more than 90 days ago
- **THEN** the system SHALL only generate occurrences from 90 days ago to today; older missed occurrences are skipped silently

---

### Requirement: A summary notification is shown after auto-creation
The system SHALL show an in-app summary message after catch-up completes if one or more transactions were auto-created.

#### Scenario: Transactions auto-created on open
- **WHEN** one or more recurring transactions are executed on app open
- **THEN** the system SHALL display a dismissible banner: "X recurring transactions were automatically added" with a link to view them in the transaction list
