import type {
StudentCardDesign,
StudentCardElement,
} from "@/types/studentCardDesigner";

import {
loadFromStorage,
mockRequest,
saveToStorage,
} from "./mockService";

const STORAGE_KEY_PREFIX =
"student_card_design_";

const createDefaultElements = (): StudentCardElement[] => [
{
id: "logo",
type: "logo",
x: 690,
y: 28,
width: 120,
height: 72,
visible: true,
zIndex: 8,
fontSize: 16,
fontWeight: "bold",
textAlign: "center",
italic: false,
underline: false,
},
{
id: "student",
type: "student",
x: 42,
y: 42,
width: 520,
height: 78,
visible: true,
zIndex: 7,
fontSize: 28,
fontWeight: "bold",
textAlign: "right",
italic: false,
underline: false,
},
{
id: "group",
type: "group",
x: 42,
y: 155,
width: 250,
height: 62,
visible: true,
zIndex: 6,
fontSize: 18,
fontWeight: "semibold",
textAlign: "right",
italic: false,
underline: false,
},
{
id: "grade",
type: "grade",
x: 315,
y: 155,
width: 250,
height: 62,
visible: true,
zIndex: 5,
fontSize: 18,
fontWeight: "semibold",
textAlign: "right",
italic: false,
underline: false,
},
{
id: "teacher",
type: "teacher",
x: 42,
y: 238,
width: 523,
height: 62,
visible: true,
zIndex: 4,
fontSize: 17,
fontWeight: "medium",
textAlign: "right",
italic: false,
underline: false,
},
{
id: "attendance_code",
type: "attendance_code",
x: 42,
y: 340,
width: 523,
height: 92,
visible: true,
zIndex: 3,
fontSize: 25,
fontWeight: "bold",
textAlign: "center",
italic: false,
underline: false,
},
{
id: "qr",
type: "qr",
x: 620,
y: 180,
width: 190,
height: 190,
visible: true,
zIndex: 2,
fontSize: 14,
fontWeight: "normal",
textAlign: "center",
italic: false,
underline: false,
},
];

function createDefaultDesign(
studentId: string,
): StudentCardDesign {
return {
studentId,
width: 860,
height: 540,
background: "#ffffff",
elements: createDefaultElements(),
updatedAt: new Date().toISOString(),
};
}

export const studentCardDesignerService = {
getDesign: async (
studentId: string,
): Promise<StudentCardDesign> => {
const storageKey =
`${STORAGE_KEY_PREFIX}${studentId}`;


const stored =
  loadFromStorage<StudentCardDesign | null>(
    storageKey,
    null,
  );

if (!stored) {
  return mockRequest(
    createDefaultDesign(studentId),
  );
}

return mockRequest({
  ...stored,
  elements: stored.elements.map(
    (element) => ({
      ...element,
    }),
  ),
});


},

saveDesign: async (
design: StudentCardDesign,
): Promise<StudentCardDesign> => {
const updatedDesign: StudentCardDesign = {
...design,
elements: design.elements.map(
(element) => ({
...element,
}),
),
updatedAt:
new Date().toISOString(),
};


saveToStorage(
  `${STORAGE_KEY_PREFIX}${design.studentId}`,
  updatedDesign,
);

return mockRequest(updatedDesign);


},

resetDesign: async (
studentId: string,
): Promise<StudentCardDesign> => {
const design =
createDefaultDesign(studentId);


saveToStorage(
  `${STORAGE_KEY_PREFIX}${studentId}`,
  design,
);

return mockRequest(design);


},
};
