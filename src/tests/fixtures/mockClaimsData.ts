export interface ClaimAdjudicationPayload {
  claimId: string;
  memberId: string;
  groupId: string;
  rxNumber: string;
  ndc: string;
  drugName: string;
  quantity: number;
  daysSupply: number;
  status: 'PAID' | 'REJECTED';
  pricing: {
    ingredientCost: number;
    dispensingFee: number;
    salesTax: number;
    allowedAmount: number;
    patientCopay: number;
    planPaid: number;
  };
  rejectionDetails?: {
    rejectCode: string;
    rejectDescription: string;
  };
  formularyTier: 'TIER-1' | 'TIER-2' | 'TIER-3' | 'NON-FORMULARY';
  priorAuthRequired: boolean;
  timestamp: string;
}

export const mockClaimsData = {
  // Scenario 1: A routine Tier 1 Generic claim that successfully processes
  metforminSuccess: {
    claimId: "CLM-909281",
    memberId: "MBR100021",
    groupId: "RX8821",
    rxNumber: "RX7788122",
    ndc: "50090-2849-0", // Metformin HCl 500mg
    drugName: "Metformin 500mg",
    quantity: 60,
    daysSupply: 30,
    status: "PAID",
    pricing: {
      ingredientCost: 12.00,
      dispensingFee: 2.00,
      salesTax: 0.00,
      allowedAmount: 14.00,
      patientCopay: 10.00, // Standard Tier 1 copay
      planPaid: 4.00
    },
    formularyTier: "TIER-1",
    priorAuthRequired: false,
    timestamp: new Date().toISOString()
  } as ClaimAdjudicationPayload,

  // Scenario 2: Specialty drug Humira, rejected because no Prior Authorization is on file
  humiraRejectedPA: {
    claimId: "CLM-909282",
    memberId: "MBR100021",
    groupId: "RX8821",
    rxNumber: "RX7788123",
    ndc: "00074-4339-02", // Humira Pen 40mg
    drugName: "Humira 40mg Pen",
    quantity: 2,
    daysSupply: 30,
    status: "REJECTED",
    pricing: {
      ingredientCost: 3500.00,
      dispensingFee: 15.00,
      salesTax: 0.00,
      allowedAmount: 0.00,
      patientCopay: 0.00,
      planPaid: 0.00
    },
    rejectionDetails: {
      rejectCode: "75",
      rejectDescription: "Prior Authorization Required"
    },
    formularyTier: "TIER-3", // Specialty Tier
    priorAuthRequired: true,
    timestamp: new Date().toISOString()
  } as ClaimAdjudicationPayload,

  // Scenario 3: Nexium capsule, rejected because it is excluded from coverage (Non-Formulary)
  nexiumRejectedFormulary: {
    claimId: "CLM-909283",
    memberId: "MBR100021",
    groupId: "RX8821",
    rxNumber: "RX7788124",
    ndc: "0186-5040-31", // Nexium 40mg Capsule
    drugName: "Nexium 40mg Capsule",
    quantity: 30,
    daysSupply: 30,
    status: "REJECTED",
    pricing: {
      ingredientCost: 240.00,
      dispensingFee: 2.50,
      salesTax: 0.00,
      allowedAmount: 0.00,
      patientCopay: 0.00,
      planPaid: 0.00
    },
    rejectionDetails: {
      rejectCode: "70",
      rejectDescription: "Product/Service Not Covered - Non-Formulary"
    },
    formularyTier: "NON-FORMULARY",
    priorAuthRequired: false,
    timestamp: new Date().toISOString()
  } as ClaimAdjudicationPayload
};
