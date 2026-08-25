"use client"; 
 
import { 
  useState, 
} from "react"; 
 
import StudentModal, { 
  type StudentFormData, 
} from "@/components/students/StudentModal"; 
 
import StudentProfileContent from "@/components/students/StudentProfileContent"; 
 
import type { 
  AttendanceRecord, 
  Grade, 
  Payment, 
  Student, 
  StudentActivity, 
  WhatsAppMessage, 
} from "@/types"; 
 
type Props = { 
  student: Student; 
  payments: Payment[]; 
  grades: Grade[]; 
  attendance: AttendanceRecord[]; 
  messages: WhatsAppMessage[]; 
  activities: StudentActivity[]; 
  exams: { 
    id: string; 
    name: string; 
    subject: string; 
    maxScore: number; 
    date: string; 
  }[]; 
}; 
 
export default function StudentProfilePageClient( 
  props: Props, 
) { 
  const [student, setStudent] = 
    useState(props.student); 
 
  const [editOpen, setEditOpen] = 
    useState(false); 
 
  const handleUpdate = ( 
    data: StudentFormData, 
  ) => { 
    setStudent((current) => ({ 
      ...current, 
      name: data.name, 
      phone: data.phone, 
      guardianName: 
        data.guardianName, 
      guardianPhone: 
        data.guardianPhone, 
      grade: data.grade, 
      groupId: data.groupId, 
      address: data.address, 
      status: data.status, 
      notes: data.notes, 
      updatedAt: 
        new Date().toISOString(), 
    })); 
 
    setEditOpen(false); 
  }; 
 
  return ( 
    <> 
      <StudentProfileContent 
        {...props} 
        student={student} 
        onEdit={() => 
          setEditOpen(true) 
        } 
      /> 
 
      <StudentModal 
        open={editOpen} 
        onClose={() => 
          setEditOpen(false) 
        } 
        onSubmit={handleUpdate} 
        mode="edit" 
        initialData={student} 
      /> 
    </> 
  ); 
}