import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(2, "Title is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  location: z.string().min(2, "Location is required."),
  event_date: z.string().min(1, "Date is required."),
  status: z.enum(["draft", "published"]),
});

export type EventFormValues = z.infer<typeof eventSchema>;
