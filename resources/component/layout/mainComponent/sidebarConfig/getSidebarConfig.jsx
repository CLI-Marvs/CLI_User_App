import { ALLOWED_EMPLOYEES_CRS } from "@/constant/data/allowedEmployeesCRS";

export const getSidebarConfig = (userLoggedInEmail) => [
    {
        id: "notification",
        label: "Notifications",
        path: "/notification",
        showBadge: true,
        type: "single",
    },
    {
        id: "inquiry",
        label: "Customer Relations",
        type: "dropdown",
        basePath: "/inquirymanagement",
        children: [
            {
                id: "feedback",
                label: "Feedback",
                path: "/inquirymanagement/inquirylist",
                matchPaths: ["/inquirymanagement/inquirylist", "/inquirymanagement/thread"],
            },
            {
                id: "walk-in",
                label: "Walk-in",
                path: "/inquirymanagement/walk-in",
            },
            {
                id: "reports",
                label: "Reports",
                path: "/inquirymanagement/report",
                type: "floating",
                children: [
                    {
                        id: "inquiries-report",
                        label: "Inquiries",
                        path: "/inquirymanagement/report/inquiries",
                    },
                    {
                        id: "survey-report",
                        label: "Survey",
                        path: "/inquirymanagement/report/survey",
                    },
                    {
                        id: "walk-in-report",
                        label: "Walk-in",
                        path: "/inquirymanagement/report/walk-in",
                    },
                ],
            },
            {
                id: "settings",
                label: "Settings",
                path: "/inquirymanagement/settings/bannersettings",
                visible: ALLOWED_EMPLOYEES_CRS.includes(userLoggedInEmail),
            },
        ],
    },
    {
        id: "document",
        label: "Document Management",
        type: "dropdown",
        basePath: "/documentmanagement",
        children: [
            {
                id: "title-registration",
                label: "Title & Registration",
                path: "/documentmanagement/titleandregistration",
            },
        ],
    },
    {
        id: "transaction",
        label: "Transaction Management",
        basePath: "/transaction",
        type: "dropdown",
        children: [
            {
                id: "receivables",
                label: "Receivables/Incoming",
                path: "/transaction/receivables/transactions",
            },
            {
                id: "transaction-settings",
                label: "Settings",
                path: "/transaction/settings/markup",
            },
            {
                id: "tools",
                label: "Tools",
                path: "/transaction/tools/check-generator/check-writer",
            },
        ],
    },
    {
        id:"sales-dashboard",
        label: "Sales Dashboard",
        type: "dropdown",
        basePath: "/sales-dashboard",
        children: [
            {
                id: "live-inventory",
                label: "Live Inventory",
                path: "/sales-dashboard/live-inventory",
            },
            {
                id: "sellers",
                label: "Sellers",
                path: "/sales-dashboard/sellers",
            },
            {
                id: "buyers",
                label: "Buyers",
                path: "/sales-dashboard/buyers",
            },
            {
                id: "applications",
                label: "Applications",
                path: "/sales-dashboard/applications",
            },
            {
                id: "settings",
                label: "Settings",
                path: "/sales-dashboard/settings",
            },
            {
                id: "term-sheet",
                label: "Term Sheet",
                path: "/sales-dashboard/term-sheet",
            },
        ],
    },
    {
        id: "coming-soon",
        type: "section",
        label: "Coming Soon",
        items: [
            "Property & Pricing",
            "Broker Management",
            "Document\nManagement",
            "Property\nManagement",
        ],
    },
    {
        id: "super-admin",
        label: "Admin Settings",
        type: "dropdown",
        basePath: "/super-admin",
        visible: ALLOWED_EMPLOYEES_CRS.includes(userLoggedInEmail),
        children: [
            {
                id: "user-rights",
                label: "User Rights & Permissions",
                path: "/super-admin/user-rights-and-permissions",
            },
            {
                id: "property-settings",
                label: "Property Settings",
                path: "/super-admin/property-settings",
            },
        ],
    },
];
