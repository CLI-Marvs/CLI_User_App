# Historical Account Import System

## Overview

This system provides specialized import functionality for three types of account imports in the titling and registration workflow:

1. **Historical Accounts** - Completed/archived accounts
2. **Ongoing Accounts** - Accounts currently in progress
3. **Completed Accounts** - Recently completed accounts
4. **New Accounts** - Standard new account import

## API Endpoints

### Import Historical Accounts

```
POST /api/accounts/import-historical
```

**Parameters:**

-   `file` (required): Excel/CSV file (xlsx, xls, csv)
-   `import_type` (required): "historical", "ongoing", "completed", or "new"
-   `create_work_orders` (optional, boolean): Create work orders for ongoing accounts
-   `auto_assign` (optional, boolean): Auto-assign employees based on project settings

**Example Request:**

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("import_type", "ongoing");
formData.append("create_work_orders", true);
formData.append("auto_assign", true);

fetch("/api/accounts/import-historical", {
    method: "POST",
    body: formData,
    headers: {
        Authorization: "Bearer " + token,
    },
});
```

### Preview Import

```
POST /api/accounts/import-preview
```

Validates the file and shows preview statistics without actually importing.

### Account Status Summary

```
GET /api/accounts/status-summary
```

Returns statistics about accounts by status and recent imports.

## CSV File Format

### Required Columns (existing):

-   `contract_no` - Contract number (required)
-   `account_name` - Account/buyer name (required)
-   `property_name` - Project/property name
-   `unit_no` - Unit number
-   `financing` - Financing type (Cash, BPI, HDMF)
-   `psd` - Purchase/sales document
-   `take_out_date` - Take out date
-   `dou_expiry` - DOU expiry date
-   `category` - Account category
-   `to_year` - Take out year
-   `to_month` - Take out month

### New Columns for Historical Import:

-   `account_status` - "New", "Ongoing", "Completed", or "Historical"
-   `current_step` - Work order type name (e.g., "Titling", "Registration")
-   `current_submilestone` - Submilestone name
-   `completion_percentage` - Progress percentage (0-100)
-   `notes` - Import notes/remarks

## Import Types

### 1. Historical Accounts (`import_type: "historical"`)

-   Sets `account_status` to "Historical"
-   Sets `completion_percentage` to 100% (or from CSV)
-   Marks `checklist_status` as completed
-   Sets `current_submilestone_id` to last submilestone if not specified
-   Marks all checklists as completed
-   Does NOT create work orders

### 2. Ongoing Accounts (`import_type: "ongoing"`)

-   Sets `account_status` to "Ongoing"
-   Uses `completion_percentage` from CSV (default 50%)
-   Maps `current_step` and `current_submilestone` to IDs
-   Optionally creates work orders if `create_work_orders` is true
-   Auto-assigns employees based on `property_name` and submilestone
-   Marks checklists as completed based on completion percentage

### 3. Completed Accounts (`import_type: "completed"`)

-   Sets `account_status` to "Completed"
-   Sets `completion_percentage` to 100%
-   Marks `checklist_status` as completed
-   Marks all checklists as completed
-   Does NOT create work orders

### 4. New Accounts (`import_type: "new"`)

-   Sets `account_status` to "New"
-   Sets `completion_percentage` to 0%
-   Standard import behavior
-   Does NOT create work orders

## Work Order Auto-Creation

For ongoing accounts with `create_work_orders: true`:

1. **Work Order Group Creation:**

    - Status: "In Progress"
    - Due date: Uses account's `dou_expiry`

2. **Work Order Creation:**

    - Generated work order number: "WO-XXXXXX"
    - Links to appropriate work order type based on `current_step`
    - Status: "In Progress"

3. **Auto-Assignment:**
    - Queries `project_milestone_assignees` table
    - Matches by `property_name` and `submilestone_id`
    - Creates `work_order_account_assignee` records

## Database Changes

### New Columns in `taken_out_accounts`:

-   `account_status` ENUM('New', 'Ongoing', 'Completed', 'Historical')
-   `current_submilestone_id` BIGINT (foreign key to submilestones)
-   `completion_percentage` TINYINT (0-100)
-   `imported_at` TIMESTAMP
-   `import_notes` TEXT

## Response Format

```json
{
    "message": "Import completed successfully! Created: 5 accounts. Work orders created: 3. Auto-assignments: 8.",
    "stats": {
        "imported": 5,
        "updated": 2,
        "errors": 0,
        "warnings": 1,
        "duplicates": 0,
        "work_orders": {
            "work_orders_created": 3,
            "assignments_created": 8,
            "errors": 0
        }
    },
    "import_type": "ongoing"
}
```

## Error Handling

The system provides comprehensive error handling:

-   File validation before import
-   Row-by-row error tracking
-   Duplicate detection
-   Date format validation
-   Missing required field validation
-   Database transaction rollback on failure

## Usage Examples

### Import Historical Data

```javascript
// For importing completed historical accounts
importData({
    file: historicalFile,
    import_type: "historical",
    create_work_orders: false,
});
```

### Import Ongoing Projects

```javascript
// For importing accounts currently in progress
importData({
    file: ongoingFile,
    import_type: "ongoing",
    create_work_orders: true,
    auto_assign: true,
});
```

### Preview Before Import

```javascript
// Check file before actual import
previewImport({
    file: csvFile,
    import_type: "ongoing",
}).then((response) => {
    console.log("Preview:", response.preview);
    // Show user the preview stats before confirming
});
```

## Best Practices

1. **Always preview first** - Use the preview endpoint to validate files
2. **Use transactions** - The system uses database transactions for data integrity
3. **Check logs** - Monitor Laravel logs for detailed import information
4. **Validate data** - Ensure CSV format matches expected columns
5. **Test incremental** - Start with small files to test the process

## Column Mapping Flexibility

The system uses flexible header matching:

-   Case-insensitive matching
-   Partial string matching (70% similarity threshold)
-   Multiple variations for each field (e.g., "Contract", "Contract No", "Contract Number")
-   Automatic detection of header row location
