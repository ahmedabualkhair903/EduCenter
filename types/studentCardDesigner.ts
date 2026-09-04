export type StudentCardElementType =
| "logo"
| "student"
| "teacher"
| "group"
| "grade"
| "qr"
| "attendance_code";

export type StudentCardTextAlign =
| "right"
| "center"
| "left";

export type StudentCardFontWeight =
| "normal"
| "medium"
| "semibold"
| "bold";

export type StudentCardElement = {
id: string;
type: StudentCardElementType;
x: number;
y: number;
width: number;
height: number;
visible: boolean;
zIndex: number;
fontSize: number;
fontWeight: StudentCardFontWeight;
textAlign: StudentCardTextAlign;
italic: boolean;
underline: boolean;
};

export type StudentCardDesign = {
studentId: string;
width: number;
height: number;
background: string;
elements: StudentCardElement[];
updatedAt: string;
};
