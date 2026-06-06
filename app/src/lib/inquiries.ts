import { publicSupabase } from "./supabase";
import type { UploadedReference } from "./uploads";

type BookingInquiryInput = {
  name: string;
  email: string;
  phone?: string | null;
  tattooIdea: string;
  placement?: string | null;
  sizeEstimate?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  budget?: string | null;
  referenceLinks?: UploadedReference[];
  message?: string | null;
};

type CommissionInquiryInput = {
  name: string;
  email: string;
  phone?: string | null;
  commissionType: string;
  description: string;
  sizeRequest?: string | null;
  budget?: string | null;
  deadline?: string | null;
  referenceLinks?: UploadedReference[];
};

function nullable(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function serializeReferenceLinks(references: UploadedReference[] | undefined) {
  return references && references.length > 0 ? JSON.stringify(references) : null;
}

export async function submitBookingInquiry(input: BookingInquiryInput) {
  const payload = {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: nullable(input.phone),
    tattoo_idea: input.tattooIdea.trim(),
    placement: nullable(input.placement),
    size_estimate: nullable(input.sizeEstimate),
    preferred_date: nullable(input.preferredDate),
    preferred_time: nullable(input.preferredTime),
    budget: nullable(input.budget),
    reference_links: serializeReferenceLinks(input.referenceLinks),
    message: nullable(input.message),
    status: "pending",
  };

  const { error } = await publicSupabase.from("booking_inquiries").insert(payload);

  if (error) {
    console.error("Supabase booking_inquiries insert failed", {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });

    throw new Error("Your tattoo booking request could not be sent. Please try again.");
  }
}

export async function submitCommissionInquiry(input: CommissionInquiryInput) {
  const payload = {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: nullable(input.phone),
    commission_type: input.commissionType.trim(),
    description: input.description.trim(),
    size_request: nullable(input.sizeRequest),
    budget: nullable(input.budget),
    deadline: nullable(input.deadline),
    reference_links: serializeReferenceLinks(input.referenceLinks),
    status: "pending",
  };

  const { error } = await publicSupabase.from("commission_inquiries").insert(payload);

  if (error) {
    console.error("Supabase commission_inquiries insert failed", {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });

    throw new Error("Your commission inquiry could not be sent. Please try again.");
  }
}
