import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Image, Send } from "lucide-react";
import API from "../utils/axios";
import toast from "../utils/toast";
import { getCreationError } from "../utils/creationErrors";
import {
  STORY_CAPTION_MAX_LENGTH,
} from "../utils/creationLimits";

const MAX_STORY_MEDIA_SIZE = 5 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/quicktime"]);

const CreateStory = () => {
  const navigate = useNavigate();
  const [storyImage, setStoryImage] = useState(null);
  const [storyText, setStoryText] = useState("");
  const [storyUploading, setStoryUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
        setErrors((prev) => ({ ...prev, image: "Upload a JPG, PNG, GIF, WebP, MP4, WebM, or MOV file." }));
        e.target.value = "";
        return;
      }
      if (file.size > MAX_STORY_MEDIA_SIZE) {
        setErrors((prev) => ({ ...prev, image: "Story media must be 5MB or smaller." }));
        e.target.value = "";
        return;
      }
      setErrors((prev) => ({ ...prev, image: "", form: "", server: "" }));
      setStoryImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setStoryImage(null);
    setErrors((prev) => ({ ...prev, image: "" }));
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!storyImage && !storyText.trim()) {
      nextErrors.form = "Please add an image or caption to your story.";
    }
    if (storyText.length > STORY_CAPTION_MAX_LENGTH) {
      nextErrors.storyText = `Caption cannot exceed ${STORY_CAPTION_MAX_LENGTH} characters.`;
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setStoryUploading(true);
    try {
      const formData = new FormData();
      if (storyImage) formData.append("image", storyImage);
      if (storyText.trim()) formData.append("text", storyText);
      await API.post("/stories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Story submitted for review.");
      navigate("/feed");
    } catch (err) {
      const result = getCreationError(err, "The story could not be created.");
      setErrors((prev) => ({ ...prev, ...result.errors, server: result.message }));
      toast.error(result.message);
    } finally {
      setStoryUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm btn-circle shrink-0" aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-heading">Create Story</h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Share a story with your network
          </p>
        </div>
      </div>

      {/* Story Form Card */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.server && <ErrorSummary message={errors.server} />}
          {/* Image Upload */}
          <div>
            {preview ? (
              <div className="relative">
                {storyImage?.type.startsWith("video/") ? (
                  <video src={preview} controls className="w-full max-h-64 object-contain rounded-xl" />
                ) : (
                  <img src={preview} alt="Story preview" className="w-full max-h-64 object-cover rounded-xl" />
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 btn btn-circle btn-xs btn-error"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-base-300 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-base-content/50">
                  Upload an image or video (max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.image && <FieldError>{errors.image}</FieldError>}
            {errors.form && <FieldError>{errors.form}</FieldError>}
          </div>

          {/* Caption */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text font-medium text-sm">
                Caption (optional)
              </span>
            </label>
            <input
              type="text"
              className={`input input-bordered w-full text-sm ${errors.storyText ? "input-error" : ""}`}
              placeholder="Add a caption..."
              value={storyText}
              onChange={(e) => {
                setStoryText(e.target.value);
                setErrors((prev) => ({ ...prev, storyText: "", form: "", server: "" }));
              }}
              maxLength={STORY_CAPTION_MAX_LENGTH}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/40">
                {storyText.length}/{STORY_CAPTION_MAX_LENGTH}
              </span>
            </label>
            {errors.storyText && <FieldError>{errors.storyText}</FieldError>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-base-200">
            <button
              type="submit"
              className="btn btn-primary flex-1 gap-2"
              disabled={storyUploading}
            >
              {storyUploading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Post Story
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FieldError = ({ children }) => (
  <p className="mt-1 text-xs font-medium text-error">{children}</p>
);

const ErrorSummary = ({ message }) => (
  <div role="alert" className="alert alert-error py-3 text-sm"><span>{message}</span></div>
);

export default CreateStory;
