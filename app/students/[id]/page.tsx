import { notFound } from "next/navigation";

import StudentProfile from "@/components/students/StudentProfile";

import { activityService } from "@/services/activityService";
import { attendanceService } from "@/services/attendanceService";
import { examService } from "@/services/examService";
import { messageService } from "@/services/messageService";
import { paymentService } from "@/services/paymentService";
import { studentService } from "@/services/studentService";

type StudentProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const { id } = await params;

  const student =
    await studentService.getById(id);

  if (!student) {
    notFound();
  }

  const [
    payments,
    grades,
    attendance,
    messages,
    activities,
    exams,
  ] = await Promise.all([
    paymentService.listByStudent(id),
    examService.gradesByStudent(id),
    attendanceService.listByStudent(id),
    messageService.listByStudent(id),
    activityService.listByStudent(id),
    examService.list(),
  ]);

  return (
    <StudentProfile
      student={student}
      payments={payments}
      grades={grades}
      attendance={attendance}
      messages={messages}
      activities={activities}
      exams={exams}
      onEdit={() => {}}
    />
  );
}