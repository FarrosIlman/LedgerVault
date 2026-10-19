/**
 * LedgerVault AI — Sample Data & Preloaded Presets
 * Pre-calibrated freelancer receipts with statutory IRS Form 1040 Schedule C mapping.
 */

const PRESET_RECEIPTS = [
  {
    id: "rec_preset_taxi_01",
    name: "City Cab Taxi - Client Meeting",
    filename: "receipt_taxi.jpg",
    imageSrc: "assets/images/receipt_taxi.jpg",
    rawOcrText: `CITY CAB SERVICES\nTAXI RECEIPT\nTHANK YOU FOR RIDING WITH US!\nDATE: Oct 26, 2026, 3:45 PM  Trip ID: #TC98347\nDRIVER: Michael Thompson (ID: 1042)\nPICKUP: 12:48 PM, 234 Fifth Ave, Midtown, NY\nDROP-OFF: 1:32 PM, 51 W 52nd St, Rockefeller Center, NY\nBase Fare: $3.50\nDistance (9.7 mi @ $2.10/mi): $20.37\nTime (44 min @ $0.45/min): $19.80\nBooking Fee: $2.50\nSurcharges: $1.85\nSubtotal: $48.02\nTIP (18%): $8.64\nTOTAL: $56.66\nPAYMENT: Visa *1234`,
    merchant: "City Cab Services (Taxi #TC98347)",
    date: "2026-10-14",
    time: "1:32 PM",
    subtotal: 48.02,
    tax: 0.00,
    tip: 8.64,
    total: 56.66,
    currency: "USD",
    paymentMethod: "Visa *1234 (Mobile Wallet)",
    client: "Innovate Tech Inc",
    billable: true,
    scheduleCCategory: "Car and Truck Expenses",
    irsScheduleLine: "Line 9 (Car and truck expenses)",
    deductibleRate: 1.00, // 100% deductible business transit
    deductibleAmount: 56.66,
    auditRiskScore: "LOW",
    auditRiskReason: "Ordinary transportation expense between business locations with documented trip details.",
    items: [
      { name: "Base Fare & Booking Fee", qty: 1, price: 5.35 },
      { name: "Distance (9.7 mi @ $2.10/mi)", qty: 1, price: 20.37 },
      { name: "Time (44 min @ $0.45/min)", qty: 1, price: 19.80 },
      { name: "City Congestion Surcharge", qty: 1, price: 2.50 },
      { name: "Driver Tip (18%)", qty: 1, price: 8.64 }
    ],
    notes: "Transit between client meeting locations. Documented as billable to client."
  },
  {
    id: "rec_preset_cafe_02",
    name: "The Daily Grind - Client Strategy Breakfast",
    filename: "receipt_cafe.jpg",
    imageSrc: "assets/images/receipt_cafe.jpg",
    rawOcrText: `THE DAILY GRIND\n142 OAK STREET, NEW YORK, NY 10013\nORDER #4852 | TABLE 14 | SERVER: SARAH\nDATE: 12/10/2026 | TIME: 10:48 AM | DINE IN\nFLAT WHITE 2 @ $5.20 $10.40\nAVOCADO TOAST 1 @ $12.50 $12.50\nSUBTOTAL $22.90\nSALES TAX (8.875%) $2.03\n**TOTAL $24.93\nTIP (Suggested 18%) $3.52\n**FINAL AMOUNT $28.45\nVISA **** 1234`,
    merchant: "The Daily Grind Cafe",
    date: "2026-10-12",
    time: "10:48 AM",
    subtotal: 22.90,
    tax: 2.03,
    tip: 3.52,
    total: 28.45,
    currency: "USD",
    paymentMethod: "Visa *1234",
    client: "Studio Horizon",
    billable: false,
    scheduleCCategory: "Deductible Meals",
    irsScheduleLine: "Line 24b (Deductible meals - 50% limit)",
    deductibleRate: 0.50, // 50% IRS limitation under IRC § 274(n)
    deductibleAmount: 14.23,
    auditRiskScore: "MODERATE",
    auditRiskReason: "Business meals require substantiation of business discussion under IRC § 274(n). Statutory 50% deduction limit applied.",
    items: [
      { name: "Flat White (Almond Milk, Extra Shot)", qty: 2, price: 10.40 },
      { name: "Avocado Toast (Sourdough, Feta)", qty: 1, price: 12.50 },
      { name: "NYC Sales Tax (8.875%)", qty: 1, price: 2.03 },
      { name: "Tip", qty: 1, price: 3.52 }
    ],
    notes: "Client roadmap discussion with Studio Horizon creative director."
  },
  {
    id: "rec_preset_tech_03",
    name: "NexaCloud - Architecture Subcontractor Fee",
    filename: "invoice_tech.jpg",
    imageSrc: "assets/images/invoice_tech.jpg",
    rawOcrText: `NEXACLOUD SOLUTIONS\nINVOICE #: NX-092123\nINVOICE DATE: October 20, 2026\nBILL TO: Innovate Tech Inc.\nDESCRIPTION: Cloud Architecture Consulting - October 2026 (20 Hours @ 150.00/hr) $3,000.00\nServer Rack Accessory Kit $350.00\nNetwork Patch Cables $300.00\nSUBTOTAL: $1,250.00\nTAX: $200.00\nTOTAL DUE: $1,450.00`,
    merchant: "NexaCloud Solutions",
    date: "2026-10-08",
    time: "2:15 PM",
    subtotal: 1250.00,
    tax: 200.00,
    tip: 0.00,
    total: 1450.00,
    currency: "USD",
    paymentMethod: "ACH Wire / Direct Debit",
    client: "Innovate Tech Inc",
    billable: true,
    scheduleCCategory: "Contract Labor",
    irsScheduleLine: "Line 11 (Contract labor)",
    deductibleRate: 1.00,
    deductibleAmount: 1450.00,
    auditRiskScore: "LOW",
    auditRiskReason: "Subcontractor fee directly associated with client deliverable with itemized invoice and purchase order linkage.",
    items: [
      { name: "Cloud Architecture Consulting", qty: 4, price: 600.00 },
      { name: "Server Rack Accessory Kit", qty: 1, price: 350.00 },
      { name: "Network Patch Cables & Terminals", qty: 20, price: 300.00 },
      { name: "Technical Sales Tax", qty: 1, price: 200.00 }
    ],
    notes: "Subcontracted infrastructure engineering for Innovate Tech deployment sprint."
  }
];

const INITIAL_VAULT_RECORDS = [
  ...PRESET_RECEIPTS,
  {
    id: "rec_vault_04",
    name: "Amazon Web Services (Cloud Hosting)",
    filename: "aws_invoice_oct2026.pdf",
    imageSrc: null,
    rawOcrText: `Amazon Web Services, Inc. Invoice\nAccount: 1234-5678-9012\nInvoice Date: October 1, 2026\nEC2 Compute Usage: $180.00\nRDS Database: $95.00\nS3 Storage: $20.00\nState Tax: $23.40\nTotal Amount: $318.40`,
    merchant: "Amazon Web Services (AWS)",
    date: "2026-10-01",
    time: "12:00 AM",
    subtotal: 295.00,
    tax: 23.40,
    tip: 0.00,
    total: 318.40,
    currency: "USD",
    paymentMethod: "MasterCard *8821",
    client: "Internal Overhead",
    billable: false,
    scheduleCCategory: "Office Expenses",
    irsScheduleLine: "Line 18 (Office expense)",
    deductibleRate: 1.00,
    deductibleAmount: 318.40,
    auditRiskScore: "LOW",
    auditRiskReason: "Recurring cloud hosting utility required for ongoing freelance software operations.",
    items: [
      { name: "EC2 Compute Usage", qty: 2, price: 180.00 },
      { name: "RDS Database", qty: 1, price: 95.00 },
      { name: "S3 Storage", qty: 1, price: 20.00 },
      { name: "Tax", qty: 1, price: 23.40 }
    ],
    notes: "Production server costs for freelance client staging environments."
  },
  {
    id: "rec_vault_05",
    name: "Figma Professional Annual Subscription",
    filename: "figma_receipt_sep2026.pdf",
    imageSrc: null,
    rawOcrText: `Figma, Inc. Receipt\nDate: September 15, 2026\nAnnual Professional Subscription: $180.00\nTax: $15.30\nTotal: $195.30`,
    merchant: "Figma Inc",
    date: "2026-09-15",
    time: "9:30 AM",
    subtotal: 180.00,
    tax: 15.30,
    tip: 0.00,
    total: 195.30,
    currency: "USD",
    paymentMethod: "Visa *1234",
    client: "Studio Horizon",
    billable: true,
    scheduleCCategory: "Office Expenses",
    irsScheduleLine: "Line 18 (Office expense)",
    deductibleRate: 1.00,
    deductibleAmount: 195.30,
    auditRiskScore: "LOW",
    auditRiskReason: "Design software subscription directly used for client design handoffs.",
    items: [
      { name: "Figma Professional Annual Seat", qty: 1, price: 180.00 },
      { name: "Digital Services Tax", qty: 1, price: 15.30 }
    ],
    notes: "Annual software subscription renewed for design project."
  }
];

// Official IRS Form 1040 Schedule C Standard Lines
const SCHEDULE_C_CATEGORIES = [
  { code: "Line 8", name: "Advertising", defaultRate: 1.00 },
  { code: "Line 9", name: "Car and Truck Expenses", defaultRate: 1.00 },
  { code: "Line 11", name: "Contract Labor", defaultRate: 1.00 },
  { code: "Line 13", name: "Depreciation and Section 179", defaultRate: 1.00 },
  { code: "Line 17", name: "Legal and Professional Services", defaultRate: 1.00 },
  { code: "Line 18", name: "Office Expenses", defaultRate: 1.00 },
  { code: "Line 24a", name: "Travel", defaultRate: 1.00 },
  { code: "Line 24b", name: "Deductible Meals", defaultRate: 0.50 }
];

const CLIENT_LIST = [
  "Innovate Tech Inc",
  "Studio Horizon",
  "Apex Ventures",
  "Nordic Labs",
  "Internal Overhead"
];
