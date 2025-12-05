export const P_METHOD = ["GCash", "Paymaya", "Credit/Debit Card"];

export const transactionOptions = [
    "Reservation Fee",
    "Equity Payments",
    "Transfer Charges",
    "Contract Balance",
    "Move-in Fee",
    "Loan Difference",
    "Redocumentation Fee",
    "Penalties",
];

export const columnData = [
    {
        label: "Details",
        fields: [
            "Transaction Type",
            "Contract No.",
            "Property",
            "Email",
            "Status",
        ],
    },
    {
        label: "Payment",
        fields: [
            "Bill Amount",
            "Creditable Withholding Tax",
            "MDR Amount",
            "Bank Recon Amount",
            "Gateway Fee",
            "Net Posting Amount",
            "Total Amount"
        ],
    },
    {
        label: "Trace IDs",
        fields: ["Transaction Number", "Request ID", "Response ID:", "Method"],
    },
];


export const columnNameToFieldKey = {
  "Contract No.": "reference_number",
  "Transaction Type": "transaction_type",
  "Property": "property_name",
  "Email": "email",
  "Status": "status",
  "Paynamics Fee": "paynamics_fee",
  "Bank Fee": "bank_fee",
  "CLI Markup": "cli_markup",
  "Gateway Fee": "gateway_fee",
  "Net Posting Amount": "net_posting_amount",
  "MDR Amount": "mdr",
  "Creditable Withholding Tax": "withholding_tax",
  "Bank Recon Amount": "bank_recon_amount",
  "Bill Amount": "amount",
  "Total Amount": "total_amount",
  "Method": "payment_option",
  "Transaction Number": "transaction_number",
  "Request ID": "payment_method_transaction_id",
  "Response ID:": "processor_response_id",
};
