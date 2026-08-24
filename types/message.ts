export type MessageType =
  | "individual"
  | "group"
  | "notification"
  | "reminder";

export type MessageStatus =
  | "draft"
  | "scheduled"
  | "sent"
  | "failed";

export type WhatsAppMessage = {
  id: string;

  /**
   * Student ID when the message targets
   * an individual student.
   *
   * For group/bulk messages this can contain
   * a group or audience identifier.
   */
  studentId: string;

  /**
   * Guardian phone number used by the
   * future WhatsApp integration.
   */
  guardianPhone: string;

  type: MessageType;

  status: MessageStatus;

  content?: string;

  createdAt: string;

  sentAt?: string;

  error?: string;
};