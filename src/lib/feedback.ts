export interface FeedbackData {
  subject: string;
  message: string;
  userEmail?: string;
}

export const feedbackService = {
  async sendFeedback(data: FeedbackData): Promise<{ error: Error | null }> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return { error: new Error("Supabase configuration missing") };
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            to: "zininnikita309@gmail.com",
            subject: data.subject,
            text: data.message,
            replyTo: data.userEmail,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Feedback service error:", errorText);
        return { error: new Error("Failed to send feedback") };
      }

      return { error: null };
    } catch (err) {
      console.error("Feedback error:", err);
      return {
        error:
          err instanceof Error ? err : new Error("Failed to send feedback"),
      };
    }
  },
};
