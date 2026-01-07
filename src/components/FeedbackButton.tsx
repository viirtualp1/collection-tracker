import { useState } from "react";
import { createPortal } from "react-dom";
import { feedbackService } from "../lib/feedback";
import { authService } from "../lib/auth";
import "./FeedbackButton.scss";

function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const user = await authService.getCurrentUser();
      const result = await feedbackService.sendFeedback({
        subject: subject.trim() || "Feedback from Collection Tracker",
        message: message.trim(),
        userEmail: user?.email,
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
        setSubject("");
        setMessage("");
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="feedback-button"
        onClick={() => setIsOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
      >
        Feedback
      </button>

      {isOpen &&
        createPortal(
          <div className="feedback-overlay" onClick={() => setIsOpen(false)}>
            <div
              className="feedback-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="feedback-header">
                <h3>Send Feedback</h3>
                <button
                  className="feedback-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form className="feedback-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="feedback-error" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="feedback-success">
                    Thank you! Your feedback has been sent.
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="feedback-subject">Subject (optional)</label>
                  <input
                    id="feedback-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's this about?"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="feedback-message">Message *</label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your feedback, suggestions, or bug reports..."
                    rows={6}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="feedback-actions">
                  <button
                    type="button"
                    className="feedback-button-cancel"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="feedback-button-submit"
                    disabled={loading || !message.trim()}
                  >
                    {loading ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default FeedbackButton;
