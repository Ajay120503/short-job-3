import { useState, useEffect } from "react";
import { MessageCircleQuestion, MoreHorizontal, Send, Trash2 } from "lucide-react";
import API from "../../utils/axios";
import useAuthStore from "../../store/authStore";
import ConfirmModal from "../common/ConfirmModal";
import toast from "react-hot-toast";

const JobQnA = ({ jobId, isJobPoster }) => {
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});

  const fetchQnA = async () => {
    try {
      const { data } = await API.get(`/jobs/${jobId}`);
      setQuestions(data.job?.qna || []);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQnA();
  }, [jobId]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/jobs/${jobId}/qna`, {
        question: newQuestion,
        isAnonymous,
      });
      setQuestions(data.qna || []);
      setNewQuestion("");
      setIsAnonymous(false);
      toast.success("Question posted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async (qnaId, answer) => {
    if (!answer.trim()) return;
    try {
      const { data } = await API.post(`/jobs/${jobId}/qna/${qnaId}/answer`, {
        answer,
      });
      setQuestions(data.qna || []);
      setAnswers((prev) => ({ ...prev, [qnaId]: "" }));
      toast.success("Answer posted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post answer");
    }
  };

  const [qnaToDelete, setQnaToDelete] = useState(null);

  const handleDelete = async (qnaId) => {
    try {
      await API.delete(`/jobs/${jobId}/qna/${qnaId}`);
      setQuestions((prev) => prev.filter((q) => q._id !== qnaId));
      setQnaToDelete(null);
      toast.success("Question deleted");
    } catch {
      toast.error("Failed to delete question");
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="mt-6 border-t border-base-300 pt-4">
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <MessageCircleQuestion className="w-5 h-5" />
        Questions & Answers ({questions.length})
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 skeleton rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mb-4">
          {questions.length === 0 && (
            <p className="text-sm text-base-content/40">
              No questions yet. Be the first to ask!
            </p>
          )}
          {questions.map((q) => (
            <div
              key={q._id}
              className="bg-base-200/50 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">Q: {q.question}</p>
                  <p className="text-xs text-base-content/40 mt-0.5">
                    {q.isAnonymous ? "Anonymous" : q.askedBy?.name || "User"} ·{" "}
                    {timeAgo(q.createdAt)}
                  </p>
                </div>
                {(q.askedBy?._id === user?._id || isJobPoster) && (
                  <div className="dropdown dropdown-end">
                    <button
                      tabIndex={0}
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-label="Question actions"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu z-20 w-36 rounded-box border border-base-300 bg-base-100 p-1 text-xs shadow-xl"
                    >
                      <li>
                        <button
                          onClick={() => setQnaToDelete(q)}
                          className="text-error"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {q.answer ? (
                <div className="ml-4 pl-3 border-l-2 border-success/30">
                  <p className="text-sm">{q.answer}</p>
                  <p className="text-xs text-base-content/40 mt-0.5">
                    {q.answeredBy?.name || "Institution"} ·{" "}
                    {timeAgo(q.answeredAt)}
                  </p>
                </div>
              ) : isJobPoster ? (
                <div className="ml-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-bordered input-xs flex-1 text-xs"
                      placeholder="Type an answer..."
                      value={answers[q._id] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q._id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleAnswer(q._id, answers[q._id]);
                      }}
                    />
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => handleAnswer(q._id, answers[q._id])}
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-base-content/40 ml-4 italic">
                  Awaiting answer...
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ask question form */}
      {user && !isJobPoster && (
        <form onSubmit={handleAsk} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered input-sm flex-1 text-sm"
              placeholder="Ask a question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting || !newQuestion.trim()}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs text-base-content/50 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            Post anonymously
          </label>
        </form>
      )}

      {/* Delete Question Confirm Modal */}
      <ConfirmModal
        isOpen={!!qnaToDelete}
        onClose={() => setQnaToDelete(null)}
        onConfirm={() => handleDelete(qnaToDelete?._id)}
        title="Delete this question?"
        message="This action cannot be undone. The question and its answer will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default JobQnA;
