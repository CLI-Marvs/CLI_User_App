# Excel Template - Bulk Import Quick Guide

## 🎯 Optimized Copy-Paste Workflow for 1,000+ Accounts

This template is designed for **efficient bulk imports** without performance issues!

---

## ✅ How It Works

**Row 2 = Master Row** (Yellow highlighted cells)

-   Only this row has dropdowns
-   Select your step and submilestone here
-   IDs auto-calculate with formulas

**Rows 3+**

-   Empty and ready for you to paste values
-   No dropdowns = faster file, better performance

---

## 📋 Step-by-Step Instructions

### **STEP 1: Fill Basic Account Data**

Fill in columns for all your accounts (rows 2-1000+):

-   Contract No
-   Account Name
-   Property Name
-   Unit No
-   Financing
-   PSD
-   Dates
-   etc.

### **STEP 2: Set Step/Submilestone in Master Row (Row 2)**

1. Go to Row 2, column **CURRENT STEP NAME** (yellow cell)
2. Click the dropdown ▼ and select your step (e.g., "STEP 3")
3. The **CURRENT STEP ID** auto-fills ✨
4. Go to column **CURRENT SUBMILESTONE NAME** (yellow cell)
5. Click the dropdown ▼ (shows only submilestones for Step 3)
6. Select your submilestone (e.g., "Submilestone 3.1")
7. The **CURRENT SUBMILESTONE ID** auto-fills ✨

### **STEP 3: Copy to All Rows with Same Step/Submilestone**

#### For accounts 3-500 that need "STEP 3, Submilestone 3.1":

**Method A: Copy 4 cells at once**

```
1. Select cells K2:N2 (Step Name, Step ID, Submilestone Name, Submilestone ID)
2. Copy (Ctrl+C)
3. Select range K3:N500
4. Paste (Ctrl+V)
✓ Done! 498 accounts now have Step 3, Submilestone 3.1
```

**Method B: Copy one column at a time**

```
1. Select K2 (Step Name), Copy (Ctrl+C)
2. Select K3:K500, Paste (Ctrl+V)
3. Select L2 (Step ID), Copy (Ctrl+C)
4. Select L3:L500, Paste (Ctrl+V)
5. Repeat for Submilestone columns M and N
```

### **STEP 4: Different Steps for Different Groups**

If rows 501-800 need a **different** step:

```
1. Go back to Row 2
2. Change dropdown to "STEP 4"
3. Change submilestone dropdown to "Submilestone 4.2"
4. Copy K2:N2
5. Select K501:N800
6. Paste (Ctrl+V)
✓ Done! Rows 501-800 now have Step 4, Submilestone 4.2
```

---

## 🎨 Visual Column Layout

```
| Contract No | Account Name | ... | CURRENT STEP NAME | CURRENT STEP ID | CURRENT SUBMILESTONE NAME | CURRENT SUBMILESTONE ID |
|-------------|--------------|-----|-------------------|-----------------|---------------------------|-------------------------|
| Row 2:      | Sample       | ... | [DROPDOWN] ▼      | =FORMULA        | [DROPDOWN] ▼              | =FORMULA                |
|             |              |     | 🟡 YELLOW CELL     |                 | 🟡 YELLOW CELL            |                         |
| Row 3:      | Account 1    | ... | (paste here)      | (paste here)    | (paste here)              | (paste here)            |
| Row 4:      | Account 2    | ... | (paste here)      | (paste here)    | (paste here)              | (paste here)            |
| ...         | ...          | ... | ...               | ...             | ...                       | ...                     |
| Row 1000:   | Account 998  | ... | (paste here)      | (paste here)    | (paste here)              | (paste here)            |
```

---

## ⚡ Why This Method?

### ❌ **OLD METHOD (All rows with dropdowns)**

-   1,000 rows × 2 dropdowns = 2,000 validations
-   File size: ~150MB
-   Opening time: 30+ seconds
-   Editing: Slow and laggy

### ✅ **NEW METHOD (Copy-paste values)**

-   Only 1 row with dropdowns
-   File size: ~15MB
-   Opening time: 2-3 seconds
-   Editing: Fast and smooth

---

## 💡 Pro Tips

### **Tip 1: You can type directly!**

If you know the exact names, just type them:

-   Type "STEP 3" in the Step Name column
-   Type "Submilestone 3.1" in Submilestone Name column
-   IDs will auto-calculate ✨

### **Tip 2: Use Excel's Fill Down**

```
1. Enter Step Name in one cell
2. Select that cell + cells below
3. Press Ctrl+D (Fill Down)
```

### **Tip 3: Sort before pasting**

If your accounts need different steps:

1. Sort by the step they need (add a helper column if needed)
2. Group them together
3. Paste in chunks

### **Tip 4: Check the Reference Data sheet**

-   See all available steps and submilestones
-   Copy names directly from there to avoid typos

---

## ⚠️ Important Notes

### **DO NOT edit ID columns manually!**

-   Step ID and Submilestone ID have formulas
-   They auto-calculate based on the NAME columns
-   Editing them manually will break the import

### **Why the formulas are important:**

```
CURRENT STEP NAME: "STEP 3"  → CURRENT STEP ID: 3 (auto-calculated)
CURRENT SUBMILESTONE NAME: "Submilestone 3.1" → CURRENT SUBMILESTONE ID: 15 (auto-calculated)
```

The import system reads the **ID columns** to determine which step/submilestone each account is in.

---

## 🔍 Verification Before Import

Before uploading your file, check:

1. ✅ All accounts have Contract No and Account Name
2. ✅ All accounts have Property Name (same for all!)
3. ✅ Step Name and Submilestone Name are filled
4. ✅ Step ID and Submilestone ID show numbers (not empty, not #N/A)
5. ✅ Dates are in format M/D/YYYY
6. ✅ PSD field is exactly "With PSD" or "Without PSD"

### **Quick Formula Check:**

-   Click on any cell in the Step ID column (not row 2)
-   Look at the formula bar
-   You should see: `=IF(K3="","",IFERROR(INDEX(...` (formula copied from row 2)
-   If you see a number with no formula, that's also OK (value was pasted)

---

## 📊 Example Scenario

**You have 1,200 accounts to import:**

-   Accounts 1-500: All at "STEP 3 → Submilestone 3.1"
-   Accounts 501-900: All at "STEP 4 → Submilestone 4.2"
-   Accounts 901-1200: All at "STEP 5 → Submilestone 5.1"

**Time needed: ~5 minutes**

```
1. Fill all 1,200 accounts' basic data (Contract No, Name, etc.)
2. Row 2: Select "STEP 3" and "Submilestone 3.1"
3. Copy K2:N2, paste to K3:N500 (2 seconds)
4. Row 2: Change to "STEP 4" and "Submilestone 4.2"
5. Copy K2:N2, paste to K501:N900 (2 seconds)
6. Row 2: Change to "STEP 5" and "Submilestone 5.1"
7. Copy K2:N2, paste to K901:N1200 (2 seconds)
8. Save and upload!
```

---

## 🚀 Result

After import:

-   ✅ All 1,200 accounts imported with correct status
-   ✅ All accounts have `current_submilestone_id` populated
-   ✅ Work orders created (grouped by work_order_type_id)
-   ✅ Accounts assigned to appropriate work orders
-   ✅ Employees auto-assigned based on project milestone settings

---

## 🆘 Troubleshooting

### **Problem: Step ID shows #N/A**

-   **Cause:** Step Name doesn't match exactly
-   **Solution:** Check spelling, use dropdown or Reference Data sheet

### **Problem: Submilestone dropdown is empty**

-   **Cause:** Step Name not selected first
-   **Solution:** Select Step Name first, then Submilestone dropdown will populate

### **Problem: After pasting, IDs are empty**

-   **Cause:** Pasted as values only (formulas not copied)
-   **Solution:** Make sure to copy from row 2 which has formulas, not from another row that might have values only

### **Problem: Import says "0 work orders created"**

-   **Cause:** Submilestone ID column is empty or has #N/A
-   **Solution:**
    1. Check that Step Name and Submilestone Name are filled
    2. Verify formulas in ID columns are working
    3. Look for red #N/A errors and fix them

---

**Need help?** Check the "Instructions" and "Reference Data" sheets in the template!
