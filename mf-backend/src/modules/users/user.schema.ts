import { z } from "zod";

export const setOnlineStatusSchema = z.object({
  isOnline: z.boolean(),
});

export type SetOnlineStatusInput = z.infer<typeof setOnlineStatusSchema>;
