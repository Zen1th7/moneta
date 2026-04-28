## ADDED Requirements

### Requirement: User can create a savings goal
The system SHALL allow users to create a financial goal with a name, target amount, optional deadline, and optional linked wallet.

#### Scenario: Create goal with all fields
- **WHEN** the user enters a goal name, target amount, deadline, and linked wallet, then saves
- **THEN** the system SHALL create the goal at 0% progress and display it in the goals list

#### Scenario: Create goal without deadline
- **WHEN** the user creates a goal without setting a deadline
- **THEN** the system SHALL save the goal and display it without a deadline or projected completion date

---

### Requirement: User can record contributions toward a goal
The system SHALL allow users to manually add a contribution amount to a goal at any time.

#### Scenario: Add contribution
- **WHEN** the user enters a contribution amount and confirms
- **THEN** the system SHALL add the amount to the goal's saved total and update progress percentage

#### Scenario: Contribution exceeds remaining target
- **WHEN** the user enters a contribution that would exceed the target amount
- **THEN** the system SHALL warn the user and ask for confirmation before marking the goal as completed

---

### Requirement: User can withdraw from a goal
The system SHALL allow users to reduce a goal's saved amount to represent spending from the savings.

#### Scenario: Partial withdrawal
- **WHEN** the user enters a withdrawal amount less than the saved total
- **THEN** the system SHALL reduce the saved total and update the progress percentage with a warning indicator

#### Scenario: Full withdrawal
- **WHEN** the user withdraws an amount equal to or greater than the saved total
- **THEN** the system SHALL reset the goal to 0 and display a "Reset" notice

---

### Requirement: Goal progress is displayed visually with projected completion
The system SHALL show each goal as a progress bar with saved amount, target amount, percentage, and (if deadline is set) projected completion date based on average contribution rate.

#### Scenario: On-track goal
- **WHEN** the contribution rate is sufficient to meet the deadline
- **THEN** the system SHALL show a green "On track" indicator alongside the projected date

#### Scenario: Behind-schedule goal
- **WHEN** the contribution rate is insufficient to meet the deadline
- **THEN** the system SHALL show an amber "Behind schedule" indicator and the shortfall amount needed per month

---

### Requirement: Completed goals are celebrated and archived
The system SHALL detect when a goal reaches 100% and mark it as complete with a visual celebration.

#### Scenario: Goal reaches target
- **WHEN** a contribution brings the saved total to or above the target amount
- **THEN** the system SHALL display a completion animation, mark the goal as "Completed", and move it to a completed goals section
