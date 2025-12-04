# Historical Import - Usage Examples

## CSV Template Examples

### Example 1: NEW Account

```csv
contract_no,account_name,property_name,unit_no,financing,psd,take_out_date,dou_expiry,account_status,current_step,current_submilestone,completion_percentage,notes,category,to_year,to_month
SAMPLE-001,Ana Garcia,Sample Project,Unit 101,Cash,4/1/2024,6/1/2024,6/1/2025,New,,,0,New account to be processed,RES,2024,6
```

**Result:**

-   Creates new account with status "New"
-   No checklists marked
-   No work orders created
-   Completion: 0%

---

### Example 2: ONGOING Account (with work order creation)

```csv
contract_no,account_name,property_name,unit_no,financing,psd,take_out_date,dou_expiry,account_status,current_step,current_submilestone,completion_percentage,notes,category,to_year,to_month
SAMPLE-002,Pedro Reyes,Sample Project,Unit 102,Bank Financing,3/5/2024,5/10/2024,5/10/2025,Ongoing,Titling,Document Preparation,45,In progress - waiting for documents,RES,2024,5
```

**API Request:**

```json
{
  "file": <csv_file>,
  "import_type": "ongoing",
  "create_work_orders": "1",
  "auto_assign": "1"
}
```

**Result:**

-   Creates/updates account with status "Ongoing"
-   Maps "Titling" → work_order_type_id
-   Maps "Document Preparation" → submilestone_id
-   Marks ALL checklists complete up to "Document Preparation" submilestone
-   Auto-calculates completion percentage (e.g., 35%)
-   Creates work order for "Titling" step
-   Auto-assigns employees from project_milestone_assignees
-   Account appears in Master List

---

### Example 3: COMPLETED Account

```csv
contract_no,account_name,property_name,unit_no,financing,psd,take_out_date,dou_expiry,account_status,current_step,current_submilestone,completion_percentage,notes,category,to_year,to_month
SAMPLE-003,Maria Santos,Sample Project,Unit 103,Pag-IBIG,2/10/2024,4/15/2024,4/15/2025,Completed,Registration,Title Release,100,Recently completed,RES,2024,4
```

**Result:**

-   Creates/updates account with status "Completed"
-   Sets current_submilestone_id to LAST submilestone
-   Marks ALL checklists across ALL steps as complete
-   Sets completion_percentage = 100%
-   Does NOT create work orders
-   Account appears in Master List

---

### Example 4: HISTORICAL Account

```csv
contract_no,account_name,property_name,unit_no,financing,psd,take_out_date,dou_expiry,account_status,current_step,current_submilestone,completion_percentage,notes,category,to_year,to_month
SAMPLE-004,Juan Dela Cruz,Sample Project,Unit 104,Bank Financing,1/15/2024,3/20/2024,3/20/2025,Historical,Registration,Title Release,100,Historical record - already completed,RES,2024,3
```

**Result:**

-   Creates/updates account with status "Historical"
-   Sets current_submilestone_id to LAST submilestone
-   Marks ALL checklists across ALL steps as complete
-   Sets completion_percentage = 100%
-   Does NOT create work orders
-   Logs as historical import
-   Account appears in Master List (can be filtered out in UI)

---

## Month Format Examples

All these are valid for the `to_month` field:

```csv
to_month
1
2
12
January
Feb
March
jun
JULY
august
Sept
OCT
```

They will all be converted to numbers (1-12) automatically.

---

## Frontend Usage

### Opening the Modal

```javascript
// In MasterListView.jsx
<button onClick={() => setIsHistoricalImportModalOpen(true)}>
    Import Historical Accounts
</button>
```

### Modal Component

```jsx
<HistoricalImportModal
    isOpen={isHistoricalImportModalOpen}
    onClose={() => setIsHistoricalImportModalOpen(false)}
    onSuccess={() => {
        fetchMasterList(); // Refresh the table
        setIsHistoricalImportModalOpen(false);
    }}
/>
```

### API Call

```javascript
const formData = new FormData();
formData.append("file", selectedFile);
formData.append("import_type", "ongoing"); // or 'new', 'completed', 'historical'
formData.append("create_work_orders", "1"); // '0' or '1'
formData.append("auto_assign", "1"); // '0' or '1'

const response = await apiService.post("/accounts/import-historical", formData);
```

---

## Testing Scenarios

### Test 1: Empty File

```csv
contract_no,account_name,property_name,unit_no,financing,psd,take_out_date,dou_expiry,account_status,current_step,current_submilestone,completion_percentage,notes,category,to_year,to_month
```

**Expected:**

```json
{
    "error": "No valid data found in file",
    "stats": {
        "imported": 0,
        "errors": 1
    }
}
```

---

### Test 2: Invalid Date Format

```csv
contract_no,account_name,property_name,psd,take_out_date,dou_expiry
TEST-001,John Doe,Test Project,not-a-date,2024-06-01,invalid
```

**Expected:**

```json
{
    "error": "File validation failed",
    "details": [
        "Row 2: Invalid date format for psd: 'not-a-date'",
        "Row 2: Invalid date format for dou_expiry: 'invalid'"
    ]
}
```

---

### Test 3: Non-existent Step

```csv
contract_no,account_name,property_name,account_status,current_step,current_submilestone
TEST-002,Jane Smith,Test Project,Ongoing,InvalidStep,Document Prep
```

**Expected:**

```json
{
    "status": 200,
    "message": "Import completed successfully! Created: 1 accounts.",
    "stats": {
        "imported": 1,
        "warnings": 1,
        "warning_details": [
            "Row 2: Could not find step 'InvalidStep', using first submilestone"
        ]
    }
}
```

---

### Test 4: Duplicate Contract

```csv
contract_no,account_name,property_name,account_status
DUP-001,First Name,Test Project,New
DUP-001,Updated Name,Test Project,Ongoing
```

**Expected:**

```json
{
    "status": 200,
    "message": "Import completed successfully! Updated: 1 accounts.",
    "stats": {
        "imported": 0,
        "updated": 1,
        "updated_accounts": [
            {
                "contract_no": "DUP-001",
                "account_name": "Updated Name",
                "property_name": "Test Project",
                "old_status": "New",
                "new_status": "Ongoing"
            }
        ]
    }
}
```

---

### Test 5: Large File (1000+ rows)

```csv
contract_no,account_name,property_name,...
TEST-0001,Account 1,Project A,...
TEST-0002,Account 2,Project A,...
...
TEST-1000,Account 1000,Project Z,...
```

**Expected:**

-   Processes all rows in transaction
-   Returns statistics for all accounts
-   Handles batch processing efficiently
-   Logs progress for monitoring

---

## API Response Examples

### Success with Work Orders

```json
{
    "status": 200,
    "message": "Import completed successfully! Created: 15 accounts. Work orders created: 5. Auto-assignments: 12.",
    "stats": {
        "imported": 15,
        "updated": 0,
        "errors": 0,
        "warnings": 0,
        "imported_accounts": [
            {
                "contract_no": "NEW-001",
                "account_name": "John Doe",
                "property_name": "Vista Heights",
                "status": "Ongoing"
            }
        ],
        "work_orders": {
            "work_orders_created": 5,
            "assignments_created": 12,
            "errors": 0,
            "error_details": []
        }
    },
    "import_type": "ongoing"
}
```

### Partial Success with Warnings

```json
{
  "status": 200,
  "message": "Import completed successfully! Created: 8 accounts. Updated: 2 accounts. Warnings: 3.",
  "stats": {
    "imported": 8,
    "updated": 2,
    "errors": 0,
    "warnings": 3,
    "warning_details": [
      "Row 5: Could not find submilestone 'Unknown Step', using first submilestone",
      "Row 12: Auto-assignment failed: No employees found for property",
      "Row 18: Invalid month name 'Juny', using NULL"
    ],
    "imported_accounts": [...],
    "updated_accounts": [...]
  },
  "import_type": "ongoing"
}
```

### Validation Errors

```json
{
    "status": 422,
    "error": "File validation failed",
    "details": [
        "Row 2: Missing required field: contract_no",
        "Row 5: Missing required field: account_name",
        "Row 8: Invalid account_status: 'Pending'. Must be: New, Ongoing, Completed, or Historical"
    ],
    "warnings": [],
    "preview_count": 0
}
```

---

## Common Issues & Solutions

### Issue 1: Account Not Appearing in Master List

**Symptom:** Imported account doesn't show up in Master List View

**Solution:** Check that `added_status` is set to true (fixed in recent update)

```php
// Now all import types set added_status = true
$accountData['added_status'] = true;
```

---

### Issue 2: Checklists Not Marked Correctly

**Symptom:** ONGOING accounts have wrong checklists marked

**Solution:** System now marks checklists up to current submilestone (recent enhancement)

```php
// New method: markChecklistsUpToSubmilestone()
// Marks ALL checklists for:
// - All previous work order types (by sequence)
// - All submilestones up to current in current work order type
```

---

### Issue 3: Completion Percentage Doesn't Match

**Symptom:** Completion percentage from CSV doesn't reflect actual progress

**Solution:** System auto-calculates based on completed checklists (recent enhancement)

```php
// New method: updateCompletionPercentage()
// Formula: (completed_checklists / total_checklists) * 100
```

---

### Issue 4: Work Orders Not Created

**Symptom:** ONGOING accounts don't have work orders

**Check:**

1. `create_work_orders` = '1' in request
2. Account has `current_submilestone_id` set
3. Check logs for work order creation errors

**Debug:**

```bash
tail -f storage/logs/laravel.log | grep "Work order"
```

---

### Issue 5: Employees Not Auto-Assigned

**Symptom:** Work orders created but no employees assigned

**Check:**

1. `auto_assign` = '1' in request
2. `project_milestone_assignees` table has entries for:
    - Matching `property_name`
    - Matching `submilestone_id`
3. Employee records exist and are active

**Query to verify:**

```sql
SELECT * FROM project_milestone_assignees
WHERE property_name = 'Your Property'
AND submilestone_id = 123;
```

---

## Performance Considerations

### Large File Imports (1000+ rows)

**Current Implementation:**

-   Uses database transactions
-   Batch processing via Laravel Excel
-   Logs progress for monitoring

**Recommendations:**

-   For files > 5000 rows, consider queue jobs
-   Monitor memory usage
-   Use `php.ini` settings:
    ```ini
    memory_limit = 512M
    max_execution_time = 300
    upload_max_filesize = 20M
    ```

---

## Database Queries

### Check Import Statistics

```sql
-- Count accounts by status
SELECT account_status, COUNT(*) as total
FROM taken_out_accounts
GROUP BY account_status;

-- Recent imports
SELECT contract_no, account_name, account_status, imported_at
FROM taken_out_accounts
WHERE imported_at IS NOT NULL
ORDER BY imported_at DESC
LIMIT 20;

-- Accounts with completed checklists
SELECT
    a.contract_no,
    a.account_name,
    a.completion_percentage,
    COUNT(acs.id) as completed_checklists
FROM taken_out_accounts a
LEFT JOIN account_checklist_status acs ON a.id = acs.account_id AND acs.status = true
GROUP BY a.id
ORDER BY a.imported_at DESC;
```

### Check Work Order Creation

```sql
-- Work orders created for imported accounts
SELECT
    wo.work_order,
    wo.work_order_type_id,
    a.contract_no,
    a.account_name
FROM work_orders wo
JOIN work_order_account woa ON wo.work_order_id = woa.work_order_id
JOIN taken_out_accounts a ON woa.account_id = a.id
WHERE a.imported_at IS NOT NULL
ORDER BY wo.created_at DESC;
```

### Check Employee Assignments

```sql
-- Auto-assigned employees
SELECT
    a.contract_no,
    a.account_name,
    e.name as employee_name,
    s.name as submilestone_name
FROM work_order_account_assignee woaa
JOIN taken_out_accounts a ON woaa.account_id = a.id
JOIN employees e ON woaa.employee_id = e.id
JOIN submilestones s ON woaa.submilestone_id = s.id
WHERE a.imported_at IS NOT NULL;
```

---

## Logging Examples

Check the Laravel logs for detailed information:

```bash
# View recent imports
tail -100 storage/logs/laravel.log | grep "Historical import"

# View work order creation
tail -100 storage/logs/laravel.log | grep "Work order created"

# View auto-assignments
tail -100 storage/logs/laravel.log | grep "Employee auto-assigned"

# View errors
tail -100 storage/logs/laravel.log | grep "ERROR"
```

---

## Summary

This implementation provides:
✅ Complete automation for historical account imports
✅ Flexible handling of all account lifecycle stages
✅ Robust error handling and validation
✅ Detailed feedback and statistics
✅ Production-ready with comprehensive logging

**Ready to use in production!** 🚀
