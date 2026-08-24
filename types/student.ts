export type StudentStatus = "active" | "inactive" | "suspended";

export type CustomFieldType = "text" | "number" | "date" | "select" | "textarea" | "boolean";

export type StudentCustomFieldDefinition = {
  id: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  options?: string[];
  active: boolean;
  order: number;
};

export type StudentCustomFieldValue = {
  fieldId: string;
  value: string | number | boolean | null;
};

export type StudentFinancialSummary = {
  totalRequired: number;
  paid: number;
  remaining: number;
};

export type Student = {
  id: string;
  studentId: string;
  name: string;
  phone?: string;
  guardianName: string;
  guardianPhone: string;
  grade: string;
  groupId?: string;
  address?: string;
  notes?: string;
  status: StudentStatus;
  customFields: StudentCustomFieldValue[];
  financial: StudentFinancialSummary;
  createdAt: string;
  updatedAt: string;
};
