## ADDED Requirements

### Requirement: Category breakdown chart shows spending distribution
The system SHALL display a donut or pie chart showing what percentage of total expenses went to each category for the selected time period.

#### Scenario: View category breakdown for current month
- **WHEN** the user views the spending insights screen with "Month" period selected
- **THEN** the system SHALL render a donut chart with one segment per category that has expenses, labeled with category name and percentage

#### Scenario: No expenses in period
- **WHEN** there are no expense transactions in the selected period
- **THEN** the system SHALL show an empty state message instead of an empty chart

---

### Requirement: Income vs. expense trend chart shows cash flow over time
The system SHALL display a bar or line chart comparing total income and total expenses per period (day/week/month) over the last 6 periods.

#### Scenario: Monthly trend view
- **WHEN** the user selects "Monthly" trend on the insights screen
- **THEN** the system SHALL render a grouped bar chart with one pair of bars per month for the last 6 months, income in gold and expenses in red

#### Scenario: Net cash flow indicator
- **WHEN** the chart is rendered
- **THEN** the system SHALL show a net cash flow summary (income minus expenses) for the currently selected period below the chart

---

### Requirement: Top spending categories are listed with amounts
The system SHALL display a ranked list of the top 5 spending categories by total amount for the selected period.

#### Scenario: Top 5 categories list
- **WHEN** the user views insights
- **THEN** the system SHALL show the top 5 expense categories sorted by total descending, each with amount and percentage of total spending

---

### Requirement: Month-over-month comparison shows spending change
The system SHALL compare current month's total spending to the previous month and display the change as a percentage.

#### Scenario: Spending increased
- **WHEN** current month spending is higher than last month
- **THEN** the system SHALL display the increase percentage in red with an upward arrow

#### Scenario: Spending decreased
- **WHEN** current month spending is lower than last month
- **THEN** the system SHALL display the decrease percentage in green with a downward arrow

---

### Requirement: Insights respect the active currency filter
The system SHALL only include transactions in the currently selected currency when computing insights figures and charts.

#### Scenario: Currency filter applied
- **WHEN** the user has selected a specific currency (e.g. USD) on the insights screen
- **THEN** the system SHALL compute all charts and summaries using only USD transactions
