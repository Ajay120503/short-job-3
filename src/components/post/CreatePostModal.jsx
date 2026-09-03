import { useState } from "react";
import {
  X,
  Image,
  Send,
} from "lucide-react";
import API from "../../utils/axios";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { getAvailablePostTypes } from "../../utils/postTypeConfig";

const MAX_POST_IMAGES = 4;
const MAX_POST_IMAGE_SIZE = 5 * 1024 * 1024;

const CreatePostModal = ({ onClose }) => {
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState("general");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const nextErrors = {};
    if (files.length > MAX_POST_IMAGES) {
      nextErrors.images = `You can upload up to ${MAX_POST_IMAGES} images.`;
    }
    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) nextErrors.images = "Please upload image files only.";
    const oversizedFile = files.find((file) => file.size > MAX_POST_IMAGE_SIZE);
    if (oversizedFile) nextErrors.images = "Each image must be under 5MB.";
    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }
    setErrors((prev) => ({ ...prev, images: "", form: "" }));
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!text.trim() && images.length === 0 && !["poll", "event", "resource_share"].includes(type)) {
      nextErrors.form = "Please add text or images to your post.";
    }
    if (text.length > 2000) nextErrors.text = "Post text cannot exceed 2000 characters.";
    if (tags.length > 160) nextErrors.tags = "Tags are too long.";
    if (type === "poll" && pollOptions.filter((item) => item.trim()).length < 2) nextErrors.form = "Add at least two poll options.";
    if (type === "event" && (!eventDate || !eventLocation.trim())) nextErrors.form = "Add the event date and location.";
    if (type === "resource_share" && !resourceUrl.trim()) nextErrors.form = "Add a resource link.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("type", type);
      formData.append("tags", tags);
      if (type === "poll") formData.append("pollOptions", JSON.stringify(pollOptions));
      if (type === "event") { formData.append("eventDate", eventDate); formData.append("eventLocation", eventLocation); }
      if (type === "resource_share") { formData.append("resourceUrl", resourceUrl); formData.append("resourceFileType", "link"); }
      images.forEach((img) => formData.append("images", img));

      await API.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Post submitted for review.");
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { user } = useAuthStore();
  const availableTypes = getAvailablePostTypes(user);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h2 className="text-lg font-bold font-heading">Create Post</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm hover:bg-base-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Text Area */}
          <div className="form-control">
            <textarea
              className={`textarea textarea-bordered w-full min-h-[140px] text-base placeholder:text-base-content/30 focus:outline-none focus:border-primary/50 transition-colors resize-none ${errors.text || errors.form ? "textarea-error" : ""}`}
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErrors((prev) => ({ ...prev, text: "", form: "" }));
              }}
              maxLength={2000}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/40">
                {text.length}/2000
              </span>
            </label>
            {errors.text && <FieldError>{errors.text}</FieldError>}
            {errors.form && <FieldError>{errors.form}</FieldError>}
          </div>

          {type === "poll" && <div className="space-y-2">{pollOptions.map((option, index) => <div key={index} className="flex gap-2"><input className="input input-bordered input-sm grow" value={option} placeholder={`Option ${index + 1}`} onChange={(e) => setPollOptions((items) => items.map((item, i) => i === index ? e.target.value : item))} />{pollOptions.length > 2 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPollOptions((items) => items.filter((_, i) => i !== index))}>×</button>}</div>)}{pollOptions.length < 6 && <button type="button" className="btn btn-ghost btn-xs" onClick={() => setPollOptions((items) => [...items, ""])}>+ Add option</button>}</div>}
          {type === "event" && <div className="grid gap-2 sm:grid-cols-2"><input type="datetime-local" className="input input-bordered input-sm" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /><input className="input input-bordered input-sm" placeholder="Event location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} /></div>}
          {type === "resource_share" && <input type="url" className="input input-bordered w-full" placeholder="https://…" value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} />}

          {/* Post Type Selector */}
          <div>
            <label className="text-xs font-medium text-base-content/50 mb-2 block">
              Post Type
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                      type === t.value
                        ? `border-primary bg-primary/10 text-primary shadow-sm`
                        : "border-base-300 bg-base-100 text-base-content/60 hover:border-base-400 hover:bg-base-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="form-control">
            <input
              type="text"
              className={`input input-bordered w-full text-sm focus:outline-none focus:border-primary/50 ${errors.tags ? "input-error" : ""}`}
              placeholder="Tags (comma separated, e.g. React, Node.js)"
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                setErrors((prev) => ({ ...prev, tags: "" }));
              }}
            />
            {errors.tags && <FieldError>{errors.tags}</FieldError>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="btn btn-outline btn-sm gap-2 font-normal">
              <Image className="w-4 h-4" />
              Add Images
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
            </label>
            {images.length > 0 && (
              <span className="text-xs text-base-content/50 ml-2">
                {images.length} image{images.length > 1 ? "s" : ""} selected
              </span>
            )}
            {errors.images && <FieldError>{errors.images}</FieldError>}
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from(images).map((img, i) => (
                <div key={i} className="relative aspect-square group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="w-full h-full object-cover rounded-xl ring-1 ring-base-300"
                  />
                  <button
                    type="button"
                    className="absolute top-1.5 right-1.5 btn btn-circle btn-xs bg-black/50 border-none hover:bg-error text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const newImages = [...images];
                      newImages.splice(i, 1);
                      setImages(newImages);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn btn-primary flex-1 gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Post
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
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

export default CreatePostModal;
