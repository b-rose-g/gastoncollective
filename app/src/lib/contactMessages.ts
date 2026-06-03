import { supabase } from "./supabase";

type ContactMessageInput = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  source: string;
};

export async function submitContactMessage(input: ContactMessageInput) {
  const payload = {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    subject: input.subject.trim(),
    message: input.message.trim(),
    source: input.source.trim() || "contact",
    status: "unread",
  };

  const { error } = await supabase.from("contact_messages").insert(payload);

  if (error) {
    console.error("Supabase contact_messages insert failed", {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });

    throw new Error("Your message could not be sent. Please try again.");
  }
}
