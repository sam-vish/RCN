// Form definitions shared by the server action (validation, storage, routing, email) and the UI.

export type FormKind =
  | "newsletter"
  | "prayer"
  | "contact"
  | "visit"
  | "event_registration"
  | "serve"
  | "testimony";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

type FieldRule = { required?: boolean; email?: boolean; max?: number; checkbox?: boolean; int?: [number, number] };

export type FormSpec = {
  table: string;
  subject: string;
  /** Route the notification to the selected branch's inbox (field `branch`). */
  routeByBranch?: boolean;
  fields: Record<string, FieldRule>;
  success: string;
  autoReply?: { subject: string; body: string };
};

export const formSpecs: Record<FormKind, FormSpec> = {
  newsletter: {
    table: "newsletter_signups",
    subject: "New newsletter signup",
    fields: {
      first_name: { max: 80 },
      email: { required: true, email: true },
      branch: { max: 60 },
      source: { max: 40 },
    },
    success: "You're on the list. The next letter comes straight to your inbox.",
  },
  prayer: {
    table: "prayer_requests",
    subject: "New prayer request",
    routeByBranch: true,
    fields: {
      name: { max: 120 },
      email: { email: true },
      phone: { max: 40 },
      branch: { max: 60 },
      request: { required: true, max: 4000 },
      may_contact: { checkbox: true },
    },
    success: "Your request has been received. It's kept private and is read only by authorized leaders, who will stand with you in prayer.",
    autoReply: {
      subject: "We received your prayer request",
      body: "Your prayer request has reached the RCN North America prayer team. It is kept private and read only by authorized leaders. If you are in an emergency, please contact your local emergency services.",
    },
  },
  contact: {
    table: "contact_messages",
    subject: "New message from the website",
    routeByBranch: true,
    fields: {
      name: { required: true, max: 120 },
      email: { required: true, email: true },
      phone: { max: 40 },
      branch: { max: 60 },
      message: { required: true, max: 4000 },
    },
    success: "Thank you. Your message is on its way to the branch team.",
    autoReply: {
      subject: "We received your message",
      body: "Thank you for reaching out to RCN North America. Your message has been passed to the branch team and someone will reply as soon as they can.",
    },
  },
  visit: {
    table: "visits",
    subject: "Someone is planning a visit",
    routeByBranch: true,
    fields: {
      branch: { required: true, max: 60 },
      gathering: { required: true, max: 120 },
      visit_date: { required: true, max: 40 },
      name: { required: true, max: 120 },
      email: { required: true, email: true },
      phone: { max: 40 },
      adults: { int: [1, 30] },
      kids: { int: [0, 30] },
      notes: { max: 2000 },
    },
    success: "You're all set. We've emailed you the address, time and what to expect, and the branch team knows you're coming.",
  },
  event_registration: {
    table: "event_registrations",
    subject: "New event registration",
    routeByBranch: true,
    fields: {
      event: { required: true, max: 120 },
      name: { required: true, max: 120 },
      email: { required: true, email: true },
      phone: { max: 40 },
      branch: { max: 60 },
      attending: { required: true, int: [1, 30] },
      notes: { max: 2000 },
    },
    success: "You're registered. A confirmation is on its way to your inbox.",
    autoReply: {
      subject: "Your registration is confirmed",
      body: "Thank you for registering. We'll send details and any updates as the date gets closer.",
    },
  },
  serve: {
    table: "serve_signups",
    subject: "New serve interest",
    routeByBranch: true,
    fields: {
      team: { required: true, max: 60 },
      name: { required: true, max: 120 },
      email: { required: true, email: true },
      phone: { max: 40 },
      branch: { max: 60 },
      skills: { max: 400 },
      message: { max: 2000 },
    },
    success: "Thank you for offering to serve. A team lead will reach out with next steps.",
    autoReply: {
      subject: "Thank you for offering to serve",
      body: "We've received your interest in serving with RCN North America. A team lead will reach out with next steps.",
    },
  },
  testimony: {
    table: "testimonies",
    subject: "New testimony submitted (needs moderation)",
    routeByBranch: true,
    fields: {
      name: { max: 120 },
      email: { email: true },
      title: { max: 160 },
      branch: { max: 60 },
      testimony: { required: true, max: 6000 },
      consent_publish: { required: true, checkbox: true },
    },
    success: "Thank you for sharing what God has done. Our team reads every testimony before anything is published.",
  },
};
