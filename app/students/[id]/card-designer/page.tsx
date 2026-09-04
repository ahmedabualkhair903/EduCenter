
import { notFound } from "next/navigation";

import StudentCardDesigner from "@/components/students/StudentCardDesigner";

import { generateQRCode } from "@/lib/qr";

import { studentCardDesignerService } from "@/services/studentCardDesignerService";
import { studentCardService } from "@/services/studentCardService";
import { studentService } from "@/services/studentService";

type StudentCardDesignerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const groupNames: Record<string, string> = {
  "group-001": "مجموعة أ",
  "group-002": "مجموعة ب",
  "group-003": "مجموعة ج",
};

export default async function StudentCardDesignerPage({
  params,
}: StudentCardDesignerPageProps) {
  const { id } = await params;

  const [student, studentCard, design] =
    await Promise.all([
      studentService.getById(id),
      studentCardService.getStudentCard(id),
      studentCardDesignerService.getDesign(id),
    ]);

  if (!student) {
    notFound();
  }

  let parentQrCodeUrl: string | null = null;

  if (studentCard.parentQrValue) {
    try {
      parentQrCodeUrl = await generateQRCode(
        studentCard.parentQrValue,
        {
          width: 220,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        },
      );
    } catch {
      parentQrCodeUrl = null;
    }
  }

  const groupName = student.groupId
    ? groupNames[student.groupId] ??
      student.groupId
    : "غير محددة";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <StudentCardDesigner
        student={student}
        groupName={groupName}
        teacherName="غير محدد"
        studentCard={studentCard}
        initialDesign={design}
        parentQrCodeUrl={parentQrCodeUrl}
      />
    </main>
  );
}
