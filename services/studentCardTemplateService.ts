
import type { StudentCardTemplate } from "@/types/studentCardTemplate";
import type { StudentCardElement } from "@/types/studentCardDesigner";

import {
  loadFromStorage,
  mockRequest,
  saveToStorage,
} from "./mockService";

const STORAGE_KEY =
  "student_card_templates";

const CARD_WIDTH = 860;
const CARD_HEIGHT = 540;

function createElement(
  element: Omit<StudentCardElement, "id"> & {
    id: string;
  },
): StudentCardElement {
  return {
    ...element,
  };
}

function createTemplateElements(
  variant:
    | "simple"
    | "modern"
    | "minimal"
    | "teacher"
    | "center_branding",
): StudentCardElement[] {
  const common: StudentCardElement[] = [
    createElement({
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
    }),
    createElement({
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
    }),
    createElement({
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
    }),
    createElement({
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
    }),
    createElement({
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
    }),
    createElement({
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
    }),
    createElement({
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
    }),
  ];

  if (variant === "modern") {
    return common.map((element) => {
      if (element.id === "student") {
        return {
          ...element,
          x: 40,
          y: 112,
          width: 560,
          height: 92,
          fontSize: 30,
        };
      }

      if (element.id === "logo") {
        return {
          ...element,
          x: 40,
          y: 32,
          width: 150,
          height: 58,
        };
      }

      if (element.id === "qr") {
        return {
          ...element,
          x: 635,
          y: 145,
          width: 185,
          height: 185,
        };
      }

      if (element.id === "attendance_code") {
        return {
          ...element,
          x: 42,
          y: 360,
          width: 770,
          height: 90,
        };
      }

      return element;
    });
  }

  if (variant === "minimal") {
    return common.map((element) => {
      if (element.id === "logo") {
        return {
          ...element,
          x: 700,
          y: 30,
          width: 100,
          height: 55,
          fontSize: 14,
        };
      }

      if (element.id === "student") {
        return {
          ...element,
          x: 55,
          y: 65,
          width: 500,
          height: 72,
          fontSize: 26,
        };
      }

      if (element.id === "group") {
        return {
          ...element,
          x: 55,
          y: 160,
          width: 220,
          height: 54,
          fontSize: 16,
        };
      }

      if (element.id === "grade") {
        return {
          ...element,
          x: 295,
          y: 160,
          width: 220,
          height: 54,
          fontSize: 16,
        };
      }

      if (element.id === "teacher") {
        return {
          ...element,
          x: 55,
          y: 230,
          width: 460,
          height: 52,
          fontSize: 15,
        };
      }

      if (element.id === "qr") {
        return {
          ...element,
          x: 635,
          y: 175,
          width: 165,
          height: 165,
        };
      }

      if (element.id === "attendance_code") {
        return {
          ...element,
          x: 55,
          y: 350,
          width: 460,
          height: 72,
          fontSize: 22,
        };
      }

      return element;
    });
  }

  if (variant === "teacher") {
    return common.map((element) => {
      if (element.id === "teacher") {
        return {
          ...element,
          x: 42,
          y: 125,
          width: 770,
          height: 74,
          fontSize: 20,
          fontWeight: "bold",
        };
      }

      if (element.id === "student") {
        return {
          ...element,
          x: 42,
          y: 215,
          width: 520,
          height: 72,
          fontSize: 26,
        };
      }

      if (element.id === "group") {
        return {
          ...element,
          x: 42,
          y: 300,
          width: 245,
          height: 58,
        };
      }

      if (element.id === "grade") {
        return {
          ...element,
          x: 315,
          y: 300,
          width: 245,
          height: 58,
        };
      }

      if (element.id === "qr") {
        return {
          ...element,
          x: 620,
          y: 205,
          width: 190,
          height: 190,
        };
      }

      if (element.id === "attendance_code") {
        return {
          ...element,
          x: 42,
          y: 400,
          width: 770,
          height: 82,
        };
      }

      return element;
    });
  }

  if (variant === "center_branding") {
    return common.map((element) => {
      if (element.id === "logo") {
        return {
          ...element,
          x: 40,
          y: 25,
          width: 180,
          height: 78,
          fontSize: 18,
        };
      }

      if (element.id === "student") {
        return {
          ...element,
          x: 42,
          y: 125,
          width: 520,
          height: 82,
          fontSize: 29,
        };
      }

      if (element.id === "group") {
        return {
          ...element,
          x: 42,
          y: 225,
          width: 245,
          height: 62,
        };
      }

      if (element.id === "grade") {
        return {
          ...element,
          x: 315,
          y: 225,
          width: 245,
          height: 62,
        };
      }

      if (element.id === "teacher") {
        return {
          ...element,
          x: 42,
          y: 310,
          width: 520,
          height: 62,
          fontSize: 18,
        };
      }

      if (element.id === "qr") {
        return {
          ...element,
          x: 630,
          y: 170,
          width: 180,
          height: 180,
        };
      }

      if (element.id === "attendance_code") {
        return {
          ...element,
          x: 42,
          y: 400,
          width: 770,
          height: 82,
        };
      }

      return element;
    });
  }

  return common;
}

function createSystemTemplates(): StudentCardTemplate[] {
  const now = new Date().toISOString();

  return [
    {
      id: "simple",
      name: "Simple",
      description:
        "قالب بسيط ومتوازن للاستخدام اليومي.",
      isSystem: true,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: "#ffffff",
      elements: createTemplateElements("simple"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "modern",
      name: "Modern",
      description:
        "قالب عصري يركز على بيانات الطالب.",
      isSystem: true,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: "#f8fafc",
      elements: createTemplateElements("modern"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "minimal",
      name: "Minimal",
      description:
        "تصميم هادئ ونظيف بأقل قدر من التفاصيل.",
      isSystem: true,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: "#ffffff",
      elements: createTemplateElements("minimal"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "teacher",
      name: "Teacher",
      description:
        "قالب يعطي بيانات المدرس مساحة أوضح.",
      isSystem: true,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: "#f8fafc",
      elements: createTemplateElements("teacher"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "center_branding",
      name: "Center Branding",
      description:
        "قالب مناسب لهوية المركز وشعاره.",
      isSystem: true,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: "#ffffff",
      elements:
        createTemplateElements(
          "center_branding",
        ),
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function cloneTemplate(
  template: StudentCardTemplate,
): StudentCardTemplate {
  return {
    ...template,
    elements: template.elements.map(
      (element) => ({
        ...element,
      }),
    ),
  };
}

export const studentCardTemplateService = {
  list: async (): Promise<
    StudentCardTemplate[]
  > => {
    const systemTemplates =
      createSystemTemplates();

    const customTemplates =
      loadFromStorage<StudentCardTemplate[]>(
        STORAGE_KEY,
        [],
      );

    const templates = [
      ...systemTemplates,
      ...customTemplates.filter(
        (template) =>
          !systemTemplates.some(
            (systemTemplate) =>
              systemTemplate.id ===
              template.id,
          ),
      ),
    ];

    return mockRequest(
      templates.map(cloneTemplate),
    );
  },

  getById: async (
    templateId: string,
  ): Promise<StudentCardTemplate | null> => {
    const templates =
      await studentCardTemplateService.list();

    return mockRequest(
      templates.find(
        (template) =>
          template.id === templateId,
      ) ?? null,
    );
  },

  save: async (
    template: StudentCardTemplate,
  ): Promise<StudentCardTemplate> => {
    const customTemplates =
      loadFromStorage<StudentCardTemplate[]>(
        STORAGE_KEY,
        [],
      );

    const nextTemplate =
      cloneTemplate({
        ...template,
        isSystem: false,
        updatedAt:
          new Date().toISOString(),
      });

    const nextTemplates =
      customTemplates.some(
        (item) =>
          item.id === nextTemplate.id,
      )
        ? customTemplates.map((item) =>
            item.id === nextTemplate.id
              ? nextTemplate
              : item,
          )
        : [
            ...customTemplates,
            nextTemplate,
          ];

    saveToStorage(
      STORAGE_KEY,
      nextTemplates,
    );

    return mockRequest(nextTemplate);
  },

  saveAsNew: async (
    name: string,
    sourceDesign: {
      width: number;
      height: number;
      background: string;
      elements: StudentCardElement[];
    },
  ): Promise<StudentCardTemplate> => {
    const now =
      new Date().toISOString();

    const id = `custom_${Date.now()}`;

    const template: StudentCardTemplate = {
      id,
      name:
        name.trim() ||
        "قالب مخصص",
      description:
        "قالب مخصص تم حفظه من مصمم كارت الطالب.",
      isSystem: false,
      width: sourceDesign.width,
      height: sourceDesign.height,
      background:
        sourceDesign.background,
      elements:
        sourceDesign.elements.map(
          (element) => ({
            ...element,
          }),
        ),
      createdAt: now,
      updatedAt: now,
    };

    const customTemplates =
      loadFromStorage<StudentCardTemplate[]>(
        STORAGE_KEY,
        [],
      );

    saveToStorage(
      STORAGE_KEY,
      [
        ...customTemplates,
        template,
      ],
    );

    return mockRequest(
      cloneTemplate(template),
    );
  },

  delete: async (
    templateId: string,
  ): Promise<void> => {
    const customTemplates =
      loadFromStorage<StudentCardTemplate[]>(
        STORAGE_KEY,
        [],
      );

    saveToStorage(
      STORAGE_KEY,
      customTemplates.filter(
        (template) =>
          template.id !== templateId,
      ),
    );

    return mockRequest(undefined);
  },
};
