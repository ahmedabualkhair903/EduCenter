export type MessageType =
  | "individual"
  | "group"
  | "notification"
  | "reminder"
  | "examResult"
  | "attendance"
  | "checkOut"
  | "absence";

export type MessageStatus =
  | "draft"
  | "scheduled"
  | "pending"
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

  /**
   * Display title used by the messages screen.
   */
  title?: string;

  /**
   * Display recipient label used by the messages screen.
   */
  recipient?: string;

  /**
   * Number of recipients for group/bulk messages.
   */
  recipientsCount?: number;

  /**
   * Scheduling labels used by the messages screen.
   */
  scheduledDate?: string;

  scheduledTime?: string;

  createdAt: string;

  sentAt?: string;

  error?: string;
};