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
  const { error } = await supabase.from("contact_messages").insert({
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    subject: input.subject.trim(),
    message: input.message.trim(),
    source: input.source,
    status: "unread",
  });

  if (error) {
    throw new Error(error.message || "Unable to send your message.");
  }
}
