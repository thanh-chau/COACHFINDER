import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageSquareHeart, Star } from "lucide-react";
import {
  getMyWebsiteFeedback,
  saveMyWebsiteFeedback,
} from "../api/feedback";

interface WebsiteFeedbackFormProps {
  onSaved?: () => void;
  compact?: boolean;
}

export function WebsiteFeedbackForm({
  onSaved,
  compact = false,
}: WebsiteFeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyWebsiteFeedback()
      .then((feedback) => {
        setRating(feedback.rating ?? 0);
        setComment(feedback.comment ?? "");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không tải được đánh giá."),
      )
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (rating < 1 || rating > 5) {
      setError("Vui lòng chọn từ 1 đến 5 sao.");
      return;
    }
    if (comment.length > 1000) {
      setError("Nhận xét không được vượt quá 1000 ký tự.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await saveMyWebsiteFeedback({
        rating,
        comment: comment.trim() || undefined,
      });
      setRating(saved.rating ?? rating);
      setComment(saved.comment ?? "");
      setMessage("Đánh giá của bạn đã được lưu. Cảm ơn bạn!");
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được đánh giá.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${
        compact ? "p-5" : "p-6 lg:p-8"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
          <MessageSquareHeart className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">
            Đánh giá CoachFinder
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Chia sẻ trải nghiệm để chúng tôi cải thiện nền tảng tốt hơn.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải đánh giá...
        </div>
      ) : (
        <>
          <div className="mt-6">
            <div className="mb-2 text-sm font-bold text-gray-700">
              Mức độ hài lòng
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} sao`}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(value)}
                  className="rounded-lg p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-250"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              Nhận xét
            </span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              rows={compact ? 4 : 6}
              placeholder="Điều gì bạn thích hoặc muốn CoachFinder cải thiện?"
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-50"
            />
            <span className="mt-1 block text-right text-xs text-gray-400">
              {comment.length}/1000
            </span>
          </label>

          {error && (
            <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Đang lưu..." : "Lưu đánh giá"}
          </button>
        </>
      )}
    </section>
  );
}
