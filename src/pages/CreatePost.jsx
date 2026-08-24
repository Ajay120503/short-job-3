import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Image,
  Send,
  ArrowLeft,
} from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { getAvailablePostTypes } from "../utils/postTypeConfig";

const CreatePost = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState("general");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const availableTypes = getAvailablePostTypes(user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) {
      toast.error("Please add text or images to your post.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("type", type);
      formData.append("tags", tags);
      images.forEach((img) => formData.append("images", img));

      await API.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Post submitted for review.");
      navigate("/feed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm btn-circle"
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
      <div className="card bg-base-100 border border-base-300/50 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Text Area */}
          <div className="form-control">
            <textarea
              className="textarea textarea-bordered w-full min-h-[150px] text-base placeholder:text-base-content/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              autoFocus
            />
            <label className="label">
              <span className="label-text-alt text-base-content/40">
                {text.length}/2000
              </span>
            </label>
          </div>

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
          </div>

          {/* Tags */}
          <div className="form-control">
            <input
              type="text"
              className="input input-bordered w-full text-sm focus:outline-none focus:border-primary/50"
              placeholder="Tags (comma separated, e.g. React, Node.js)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
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
                onChange={(e) => setImages([...e.target.files])}
              />
            </label>
            {images.length > 0 && (
              <span className="text-xs text-base-content/50 ml-2">
                {images.length} image{images.length > 1 ? "s" : ""} selected
              </span>
            )}
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

export default CreatePost;
