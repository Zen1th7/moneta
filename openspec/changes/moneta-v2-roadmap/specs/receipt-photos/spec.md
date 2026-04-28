## ADDED Requirements

### Requirement: User can attach a photo to a transaction
The system SHALL allow users to attach one photo to any transaction, either by taking a photo with the device camera or selecting from the gallery.

#### Scenario: Attach photo via camera
- **WHEN** the user taps "Add Receipt" on a transaction and selects "Take Photo"
- **THEN** the system SHALL open the device camera via Capacitor Camera API; upon capture, attach the photo to the transaction

#### Scenario: Attach photo via gallery
- **WHEN** the user taps "Add Receipt" and selects "Choose from Gallery"
- **THEN** the system SHALL open the device photo picker; upon selection, attach the chosen photo to the transaction

#### Scenario: Camera permission denied
- **WHEN** the user has denied camera permission
- **THEN** the system SHALL display a message explaining that camera access is required and prompt the user to update permissions in device settings

---

### Requirement: Receipt photo is compressed before storage
The system SHALL compress and resize any attached photo to a maximum of 1024px on the longest side and approximately 200KB before storing it as base64 in localStorage.

#### Scenario: Large photo compressed
- **WHEN** the user attaches a photo larger than 1024px or 200KB
- **THEN** the system SHALL compress and resize it before saving; the original file is not stored

#### Scenario: Storage warning
- **WHEN** localStorage usage exceeds 80% of the estimated 5MB limit
- **THEN** the system SHALL display a warning banner suggesting the user clear old receipt photos

---

### Requirement: User can view the attached receipt photo
The system SHALL display the attached receipt photo when the user opens a transaction that has one.

#### Scenario: View receipt on transaction detail
- **WHEN** the user opens a transaction that has a receipt photo attached
- **THEN** the system SHALL show a thumbnail of the photo in the transaction detail; tapping it SHALL open the photo fullscreen

---

### Requirement: User can remove a receipt photo
The system SHALL allow users to delete the receipt photo from a transaction without deleting the transaction itself.

#### Scenario: Remove receipt
- **WHEN** the user taps "Remove Receipt" on a transaction with a photo attached
- **THEN** the system SHALL delete the photo data from localStorage and show the transaction without a photo; transaction data is unchanged

---

### Requirement: Receipt photo indicator appears in transaction list
The system SHALL show a small camera icon on any transaction row in the list that has a receipt photo attached.

#### Scenario: Photo indicator in list
- **WHEN** a transaction has a receipt photo
- **THEN** the system SHALL display a small camera/receipt icon on that transaction's row in the transaction list
