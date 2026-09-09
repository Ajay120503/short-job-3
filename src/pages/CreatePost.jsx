import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Image,
  Send,
  ArrowLeft,
} from "lucide-react";
import API from "../utils/axios";
import toast from "../utils/toast";
import useAuthStore from "../store/authStore";
import { getAvailablePostTypes } from "../utils/postTypeConfig";
import { getCreationError } from "../utils/creationErrors";
import {
  POST_TAG_MAX_ITEMS,
  POST_TEXT_MAX_LENGTH,
  POST_TEXT_MIN_LENGTH,
} from "../utils/creationLimits";

const MAX_POST_IMAGES = 4;
const MAX_POST_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const CreatePost = () => {
  const navigate = useNavigate();
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

  const { user } = useAuthStore();
  const availableTypes = getAvailablePostTypes(user);
  const imagePreviews = useMemo(
    () => images.map((image) => URL.createObjectURL(image)),
    [images],
  );

  useEffect(
    () => () => imagePreviews.forEach((url) => URL.revokeObjectURL(url)),
    [imagePreviews],
  );

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const nextErrors = {};
    if (files.length > MAX_POST_IMAGES) {
      nextErrors.images = `You can upload up to ${MAX_POST_IMAGES} images.`;
    }
    const invalidFile = files.find((file) => !ALLOWED_IMAGE_TYPES.has(file.type));
    if (invalidFile) nextErrors.images = "Upload JPG, PNG, GIF, or WebP images only.";
    const oversizedFile = files.find((file) => file.size > MAX_POST_IMAGE_SIZE);
    if (oversizedFile) nextErrors.images = "Each image must be under 5MB.";
    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }
    setErrors((prev) => ({ ...prev, images: "", form: "", server: "" }));
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!text.trim()) nextErrors.text = "Post text is required.";
    else if (text.trim().length < POST_TEXT_MIN_LENGTH) nextErrors.text = `Post text needs at least ${POST_TEXT_MIN_LENGTH} characters.`;
    else if (text.length > POST_TEXT_MAX_LENGTH) nextErrors.text = `Post text cannot exceed ${POST_TEXT_MAX_LENGTH} characters.`;
    const normalizedTags = [...new Set(tags.split(",").map((tag) => tag.trim()).filter(Boolean))];
    if (normalizedTags.length > POST_TAG_MAX_ITEMS) nextErrors.tags = `Use no more than ${POST_TAG_MAX_ITEMS} tags.`;
    else if (normalizedTags.some((tag) => tag.length < 3 || tag.length > 20)) nextErrors.tags = "Each tag must contain 3 to 20 characters.";
    if (!availableTypes.some((item) => item.value === type)) nextErrors.type = "Choose a post type available to your account.";
    const validPollOptions = pollOptions.map((item) => item.trim()).filter(Boolean);
    if (type === "poll") {
      if (validPollOptions.length < 2) nextErrors.pollOptions = "Add at least two poll options.";
      else if (validPollOptions.some((option) => option.length > 100)) nextErrors.pollOptions = "Each poll option must be 100 characters or fewer.";
      else if (new Set(validPollOptions.map((option) => option.toLowerCase())).size !== validPollOptions.length) nextErrors.pollOptions = "Poll options must be different.";
    }
    if (type === "event") {
      if (!eventDate) nextErrors.eventDate = "Choose the event date and time.";
      else if (new Date(eventDate) <= new Date()) nextErrors.eventDate = "Event date must be in the future.";
      if (!eventLocation.trim()) nextErrors.eventLocation = "Event location is required.";
      else if (eventLocation.trim().length > 200) nextErrors.eventLocation = "Event location cannot exceed 200 characters.";
    }
    if (type === "resource_share") {
      try {
        const url = new URL(resourceUrl);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("invalid protocol");
      } catch {
        nextErrors.resourceUrl = "Enter a valid http:// or https:// resource link.";
      }
    }
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
      if (type === "event") {
        formData.append("eventDate", eventDate);
        formData.append("eventLocation", eventLocation.trim());
      }
      if (type === "resource_share") {
        formData.append("resourceUrl", resourceUrl.trim());
        formData.append("resourceFileType", "link");
      }
      images.forEach((img) => formData.append("images", img));

      await API.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Post submitted for review.");
      navigate("/feed");
    } catch (error) {
      const result = getCreationError(error, "The post could not be created.");
      setErrors((prev) => ({ ...prev, ...result.errors, server: result.message }));
      toast.error(result.message);
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-2xl font-bold font-heading">Create Post</h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Share something with your community
          </p>
        </div>
      </div>

      {/* Post Form Card */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.server && <ErrorSummary message={errors.server} />}
          {/* Text Area */}
          <div className="form-control">
            <textarea
              className={`textarea textarea-bordered w-full min-h-[150px] text-base placeholder:text-base-content/30 focus:outline-none focus:border-primary/50 transition-colors resize-none ${errors.text || errors.form ? "textarea-error" : ""}`}
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErrors((prev) => ({ ...prev, text: "", form: "", server: "" }));
              }}
              minLength={POST_TEXT_MIN_LENGTH}
              maxLength={POST_TEXT_MAX_LENGTH}
              required
              autoFocus
            />
            <label className="label">
              <span className="label-text-alt text-base-content/40">
                {text.length}/{POST_TEXT_MAX_LENGTH}
              </span>
            </label>
            {errors.text && <FieldError>{errors.text}</FieldError>}
            {errors.form && <FieldError>{errors.form}</FieldError>}
          </div>

          {type === "poll" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-base-content/60">Poll options</label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    name="pollOptions"
                    className={`input input-bordered input-sm grow ${errors.pollOptions ? "input-error" : ""}`}
                    value={option}
                    maxLength={100}
                    placeholder={`Option ${index + 1}`}
                    onChange={(e) => {
                      setPollOptions((items) => items.map((item, i) => i === index ? e.target.value : item));
                      setErrors((prev) => ({ ...prev, pollOptions: "", server: "" }));
                    }}
                  />
                  {pollOptions.length > 2 && <button type="button" className="btn btn-ghost btn-sm" aria-label={`Remove option ${index + 1}`} onClick={() => setPollOptions((items) => items.filter((_, i) => i !== index))}>×</button>}
                </div>
              ))}
              {pollOptions.length < 6 && <button type="button" className="btn btn-ghost btn-xs" onClick={() => setPollOptions((items) => [...items, ""])}>+ Add option</button>}
              {errors.pollOptions && <FieldError>{errors.pollOptions}</FieldError>}
            </div>
          )}

          {type === "event" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div><input name="eventDate" type="datetime-local" className={`input input-bordered w-full ${errors.eventDate ? "input-error" : ""}`} value={eventDate} onChange={(e) => { setEventDate(e.target.value); setErrors((prev) => ({ ...prev, eventDate: "", server: "" })); }} />{errors.eventDate && <FieldError>{errors.eventDate}</FieldError>}</div>
              <div><input name="eventLocation" className={`input input-bordered w-full ${errors.eventLocation ? "input-error" : ""}`} maxLength={200} placeholder="Event location" value={eventLocation} onChange={(e) => { setEventLocation(e.target.value); setErrors((prev) => ({ ...prev, eventLocation: "", server: "" })); }} />{errors.eventLocation && <FieldError>{errors.eventLocation}</FieldError>}</div>
            </div>
          )}

          {type === "resource_share" && (
            <div><input name="resourceUrl" type="url" className={`input input-bordered w-full ${errors.resourceUrl ? "input-error" : ""}`} maxLength={1000} placeholder="https://example.com/resource" value={resourceUrl} onChange={(e) => { setResourceUrl(e.target.value); setErrors((prev) => ({ ...prev, resourceUrl: "", server: "" })); }} />{errors.resourceUrl && <FieldError>{errors.resourceUrl}</FieldError>}</div>
          )}

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
                    onClick={() => {
                      setType(t.value);
                      setErrors((prev) => ({ ...prev, type: "", form: "", server: "" }));
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                      type === t.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-base-300 bg-base-100 text-base-content/60 hover:border-base-400 hover:bg-base-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
            {errors.type && <FieldError>{errors.type}</FieldError>}
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
                setErrors((prev) => ({ ...prev, tags: "", server: "" }));
              }}
              maxLength={218}
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
                accept="image/jpeg,image/png,image/gif,image/webp"
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from(images).map((img, i) => (
                <div key={i} className="relative aspect-square group">
                  <img
                    src={imagePreviews[i]}
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
          <div className="flex gap-3 pt-3 border-t border-base-200">
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
  <div role="alert" className="alert alert-error py-3 text-sm">
    <span>{message}</span>
  </div>
);

export default CreatePost;
