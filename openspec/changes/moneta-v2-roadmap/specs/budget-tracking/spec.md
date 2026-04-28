## ADDED Requirements

### Requirement: User can create a monthly budget per category
The system SHALL allow users to create a budget that sets a spending limit for a specific expense category for the current calendar month.

#### Scenario: Create a new budget
- **WHEN** the user selects a category and enters a monthly limit amount
- **THEN** the system SHALL save the budget and display it in the budget list with 0% usage

#### Scenario: Duplicate budget prevention
- **WHEN** the user tries to create a budget for a category that already has one
- **THEN** the system SHALL prevent creation and prompt the user to edit the existing budget instead

---

### Requirement: Budget usage updates in real time from transactions
The system SHALL calculate budget usage automatically from all expense transactions in the matching category within the current calendar month.

#### Scenario: Transaction added to budgeted category
- **WHEN** a new expense transaction is saved in a category that has a budget
- **THEN** the system SHALL update that budget's used amount and percentage immediately

#### Scenario: Transaction deleted from budgeted category
- **WHEN** an expense transaction is deleted from a budgeted category
- **THEN** the system SHALL recalculate and reduce the budget's used amount accordingly

---

### Requirement: Budget progress is shown visually
The system SHALL display each budget as a progress bar showing used amount, remaining amount, and percentage.

#### Scenario: Under budget display
- **WHEN** spending is below the limit
- **THEN** the progress bar SHALL be shown in the primary color (gold/amber) with remaining amount visible

#### Scenario: Over budget display
- **WHEN** spending exceeds the limit
- **THEN** the progress bar SHALL turn red and display an "Over budget" label with the overspend amount

---

### Requirement: User receives an alert when approaching or exceeding budget
The system SHALL notify the user when spending reaches 80% or 100% of a budget limit.

#### Scenario: 80% warning
- **WHEN** total spending in a budgeted category reaches 80% of the limit
- **THEN** the system SHALL display an in-app warning banner on the budget card

#### Scenario: Over 100% alert
- **WHEN** total spending exceeds the budget limit
- **THEN** the system SHALL display a red alert on the budget card and (if notifications enabled) send a push notification

---

### Requirement: User can edit or delete a budget
The system SHALL allow users to change the limit of an existing budget or remove it entirely.

#### Scenario: Edit budget limit
- **WHEN** the user edits a budget and saves a new limit
- **THEN** the system SHALL recalculate the usage percentage against the new limit immediately

#### Scenario: Delete budget
- **WHEN** the user deletes a budget
- **THEN** the system SHALL remove it from the list; existing transactions are unaffected
