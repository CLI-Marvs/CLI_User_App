# Bulk Import Guide - Handling 1000+ Accounts

## Overview

The import system now supports large-scale imports with 1000+ rows efficiently.

## Template Generation

### Download Template (Automatic Row Generation)

```
GET /api/system-structure/download-template?import_type=ongoing
```

**Parameters:**

-   `import_type`: `new`, `ongoing`, or `completed` (required)
-   `row_count`: Number of rows to prepare (optional)

### Automatic Defaults

-   **Ongoing imports**: 500 rows (ready for bulk imports)
-   **New/Completed imports**: 50 rows
-   **Maximum**: 10,000 rows

### Custom Row Count (Optional)

Only specify if you need more than the default:

-   **Medium batch**: `?import_type=ongoing&row_count=1000` (1000 accounts)
-   **Large batch**: `?import_type=ongoing&row_count=2000` (2000 accounts)
-   **Extra large**: `?import_type=ongoing&row_count=5000` (5000 accounts)

## How It Works

### 1. Template Generation

-   Dropdowns and formulas are pre-generated for ALL requested rows
-   Step ID and Submilestone ID columns auto-populate via formulas
-   No manual formula copying needed

### 2. Bulk Filling Steps (For Ongoing Imports)

#### Method 1: Drag and Drop

1. Fill Row 2 with sample data
2. Select the `CURRENT STEP NAME` cell in Row 2
3. Click the small square at bottom-right of cell
4. Drag down to fill all rows (e.g., Row 2 to Row 1001)
5. Repeat for `CURRENT SUBMILESTONE NAME` column

#### Method 2: Copy-Paste (Faster for 1000+ rows)

1. Fill Row 2 completely
2. Select `CURRENT STEP NAME` cell in Row 2
3. Press `Ctrl+C` to copy
4. Select range `K3:K1001` (or your target range)
5. Press `Ctrl+V` to paste
6. Repeat for `CURRENT SUBMILESTONE NAME` column

### 3. Property Name Requirement

⚠️ **IMPORTANT**: All accounts in one file must have the same `property_name`

-   This is validated during import
-   Ensures all accounts are grouped into one work order

## Performance Optimizations

### Import System

-   **Memory Limit**: 512MB (handles large Excel files)
-   **Execution Time**: 300 seconds (5 minutes)
-   **Transaction-based**: Ensures data integrity
-   **Batch Processing**: Efficient database operations

### Template System

-   **Row Cap**: Maximum 10,000 rows per template
-   **Formula Efficiency**: OFFSET-based dynamic dropdowns
-   **Sheet Structure**: Optimized reference data layout

## Import Process for Large Files

### Step 1: Download Template

```bash
# Default: 500 rows ready to use
curl -O "http://your-domain/api/system-structure/download-template?import_type=ongoing"

# Optional: For more than 500 accounts
curl -O "http://your-domain/api/system-structure/download-template?import_type=ongoing&row_count=1000"
```

### Step 2: Fill Data

1. Open template in Excel or Google Sheets
2. Fill required fields: `contract_no`, `account_name`, `property_name`
3. For ongoing: Use bulk fill for `CURRENT STEP NAME` and `CURRENT SUBMILESTONE NAME`
4. Fill other fields as needed

### Step 3: Upload

```javascript
// Frontend example
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("import_type", "ongoing");
formData.append("create_work_orders", "true");
formData.append("auto_assign", "true");

await fetch("/api/historical-accounts/import", {
    method: "POST",
    body: formData,
});
```

## Work Order Creation

### Single Work Order Group

All imported accounts are grouped into:

-   **1 Work Order Group** for the entire batch
-   **Multiple Work Orders** organized by step (work order type)
-   **Auto-assignments** based on property and submilestone

### Example with 1000 Accounts

If importing 1000 accounts across 3 different steps:

```
Work Order Group #1 (1000 accounts total)
├── Work Order WO-000001-1 (Step 1: Documentation) - 300 accounts
├── Work Order WO-000001-2 (Step 2: Verification) - 500 accounts
└── Work Order WO-000001-3 (Step 3: Registration) - 200 accounts
```

## Validation

### Pre-Import Checks

✅ Contract numbers are unique
✅ Required fields present (contract_no, account_name)
✅ All accounts have same property name
✅ Step and submilestone IDs are valid
✅ Date formats are correct

### Error Handling

-   Validation errors prevent import
-   Row-specific error messages
-   Detailed error logs

## Best Practices

### 1. Property Name Consistency

```
✓ Good: All 1000 accounts → "Sunshine Heights"
✗ Bad:  500 accounts → "Sunshine Heights"
        500 accounts → "Moonlight Gardens"
```

### 2. Bulk Fill Strategy

For 1000+ rows:

1. Fill first row completely
2. Use copy-paste for step/submilestone columns
3. Fill unique data (contract_no, account_name) via CSV or formula

### 3. Testing Approach

1. **Test small**: Start with 10 rows
2. **Scale up**: Try 100 rows
3. **Full import**: Run 1000+ rows after validation

### 4. Performance Tips

-   Use `.xlsx` format (not `.csv` for formulas)
-   Close other applications during large imports
-   Monitor import progress via logs

## Troubleshooting

### Issue: Template Generation Slow

**Solution**: Template automatically generates with optimal defaults (500 rows for ongoing)

-   If you specified a custom row_count and it's too large, reduce it

```
Instead of: ?row_count=10000
Try: ?row_count=2000 or use default (no parameter)
```

### Issue: Import Timeout

**Check**:

-   Server PHP timeout settings
-   Network connection stability
-   File size (should be < 10MB)

### Issue: Memory Exhausted

**Increase** in `php.ini`:

```ini
memory_limit = 1024M
max_execution_time = 600
```

### Issue: Duplicate Contract Numbers

**Solution**: Use Excel's Remove Duplicates feature before import

## API Response Example

### Successful Import (1000 accounts)

```json
{
    "message": "Import completed successfully! Created: 1000 accounts. Work order groups created: 1. Work orders created: 3. Accounts added to work orders: 1000. Auto-assignments: 1000.",
    "stats": {
        "imported": 1000,
        "updated": 0,
        "errors": 0,
        "warnings": 0,
        "work_orders": {
            "work_order_groups_created": 1,
            "work_orders_created": 3,
            "accounts_added": 1000,
            "assignments_created": 1000
        }
    },
    "import_type": "ongoing"
}
```

## Limits and Constraints

| Feature                 | Limit     | Reason               |
| ----------------------- | --------- | -------------------- |
| Max Rows per Template   | 10,000    | Excel performance    |
| Max File Size           | 10 MB     | Upload limits        |
| Import Timeout          | 5 minutes | Server configuration |
| Memory Limit            | 512 MB    | Import processing    |
| Accounts per Work Order | Unlimited | Database design      |

## Notes

-   Template formulas work in both Excel and Google Sheets
-   Dropdowns are dynamic and dependent (submilestone depends on step)
-   All ID columns are auto-populated (read-only)
-   Import validation runs before actual data insertion
-   Property name validation ensures grouping integrity
