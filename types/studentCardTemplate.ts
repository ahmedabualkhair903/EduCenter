
import type { StudentCardElement } from "@/types/studentCardDesigner";

export type StudentCardTemplateId =
  | "simple"
  | "modern"
  | "minimal"
  | "teacher"
  | "center_branding"
  | string;

export type StudentCardTemplate = {
  id: StudentCardTemplateId;
  name: string;
  description: string;
  isSystem: boolean;
  width: number;
  height: number;
  background: string;
  elements: StudentCardElement[];
  createdAt: string;
  updatedAt: string;
};
