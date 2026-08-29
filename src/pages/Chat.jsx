import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Send,
  ImagePlus,
  ArrowLeft,
  User,
  MessageCircle,
  Edit3,
  Trash2,
  Check,
  X,
  MoreHorizontal,
  Eraser,
  AlertTriangle,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { useSocket } from "../context/SocketContext";
import API from "../utils/axios";
import ConfirmModal from "../components/common/ConfirmModal";
import UserAvatar from "../components/common/UserAvatar";
import toast from "react-hot-toast";

const getOtherParticipantFromConversation = (conversation, currentUserId) =>
  conversation?.participants?.find((participant) => participant._id !== currentUserId) ||
  conversation?.otherParticipant;

const dedupeConversations = (items, currentUserId) => {
  const seen = new Set();
  return (items || []).filter((conversation) => {
    const other = getOtherParticipantFromConversation(conversation, currentUserId);
    const otherId = other?._id;
    if (!otherId) return true;
    if (seen.has(otherId)) return false;
    seen.add(otherId);
    return true;
  });
};

const Chat = () => {
  const { id: selectedUserId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    socket,
    onlineUsers,
    isUserOnline,
    emitTyping,
    emitStopTyping,
    joinConversation,
    leaveConversation,
  } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Confirm modal states
  const [msgToDelete, setMsgToDelete] = useState(null);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await API.get("/chat/conversations");
        setConversations(dedupeConversations(data.conversations, user?._id));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Start conversation with selected user
  useEffect(() => {
    if (selectedUserId && user) {
      const startConversation = async () => {
        try {
          const { data } = await API.post("/chat/conversations", {
            participantId: selectedUserId,
          });
          setActiveConversation(data.conversation);
          setConversations((prev) =>
            dedupeConversations([data.conversation, ...prev], user?._id)
          );
          joinConversation(data.conversation._id);
        } catch (err) {
          toast.error("Could not start conversation");
        }
      };
      startConversation();
    }
  }, [selectedUserId, user]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConversation) return;
    const fetchMessages = async () => {
      try {
        const { data } = await API.get(
          `/chat/conversations/${activeConversation._id}/messages`
        );
        setMessages(data.messages || []);
      } catch {
        /* ignore */
      }
    };
    fetchMessages();
    joinConversation(activeConversation._id);

    return () => {
      leaveConversation(activeConversation._id);
    };
  }, [activeConversation?._id]);

  // Store the active conversation ID in a ref to avoid stale closures
  const activeConversationRef = useRef(null);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Listen for incoming messages (set up only once)
  useEffect(() => {
    const s = socket?.current;
    if (!s) return;

    const handleReceiveMessage = (message) => {
      const senderId =
        typeof message.sender === "object"
          ? message.sender._id
          : message.sender;
      if (senderId === user._id) return;

      const activeConv = activeConversationRef.current;
      if (activeConv && message.conversation === activeConv._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      API.get("/chat/conversations").then(({ data }) =>
        setConversations(dedupeConversations(data.conversations, user?._id))
      );
    };

    const handleMessageUpdated = (updatedMsg) => {
      const activeConv = activeConversationRef.current;
      if (activeConv && updatedMsg.conversation === activeConv._id) {
        setMessages((prev) =>
          prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
        );
      }
    };

    const handleMessageDeleted = ({ messageId, conversationId }) => {
      const activeConv = activeConversationRef.current;
      if (activeConv && conversationId === activeConv._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? {
                  ...m,
                  content: "This message was deleted",
                  type: "deleted",
                  deletedAt: new Date(),
                }
              : m
          )
        );
      }
    };

    const handleTyping = ({ conversationId, userId }) => {
      const activeConv = activeConversationRef.current;
      if (conversationId === activeConv?._id) {
        setTypingUsers((prev) => ({ ...prev, [userId]: true }));
      }
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: false }));
    };

    s.on("receive_message", handleReceiveMessage);
    s.on("message_updated", handleMessageUpdated);
    s.on("message_deleted", handleMessageDeleted);
    s.on("is_typing", handleTyping);
    s.on("stopped_typing", handleStopTyping);

    return () => {
      s.off("receive_message", handleReceiveMessage);
      s.off("message_updated", handleMessageUpdated);
      s.off("message_deleted", handleMessageDeleted);
      s.off("is_typing", handleTyping);
      s.off("stopped_typing", handleStopTyping);
    };
  }, [socket?.current, user._id]);

  // Focus edit input when entering edit mode
  useEffect(() => {
    if (editingMessage && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    try {
      const { data } = await API.post("/chat/messages", {
        conversationId: activeConversation._id,
        content: messageText.trim(),
        type: "text",
      });
      setMessages((prev) => [...prev, data.message]);
      setMessageText("");
      emitStopTyping(activeConversation._id, user._id);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleEditMessage = async (msgId, newContent) => {
    if (!newContent.trim()) return;
    try {
      const { data } = await API.put(`/chat/messages/${msgId}`, {
        content: newContent.trim(),
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? data.message : m))
      );
      setEditingMessage(null);
      setEditText("");
      toast.success("Message updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update message");
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await API.delete(`/chat/messages/${msgId}`);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId
            ? {
                ...m,
                content: "This message was deleted",
                type: "deleted",
                deletedAt: new Date(),
              }
            : m
        )
      );
      setMenuOpenId(null);
      setMsgToDelete(null);
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  const handleClearChat = async (conversationId) => {
    try {
      await API.delete(`/chat/conversations/${conversationId}/clear`);
      setMessages([]);
      // Refresh conversation list
      const { data } = await API.get("/chat/conversations");
      setConversations(dedupeConversations(data.conversations, user?._id));
      setShowClearChatModal(false);
      toast.success("Chat cleared");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear chat");
    }
  };

  const handleDeleteChat = async (conversationId) => {
    try {
      await API.delete(`/chat/conversations/${conversationId}`);
      setActiveConversation(null);
      setMessages([]);
      // Refresh conversation list
      const { data } = await API.get("/chat/conversations");
      setConversations(dedupeConversations(data.conversations, user?._id));
      setShowDeleteChatModal(false);
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete conversation"
      );
    }
  };

  const startEdit = (msg) => {
    setEditingMessage(msg._id);
    setMessageText(msg.content);
    setMenuOpenId(null);
    // Focus the input after state update
    setTimeout(() => {
      document.querySelector('input[placeholder="Type a message..."]')?.focus();
    }, 50);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setMessageText("");
  };

  const handleTyping = () => {
    if (!activeConversation) return;
    emitTyping(activeConversation._id, user._id);
    setTimeout(() => emitStopTyping(activeConversation._id, user._id), 2000);
  };

  const getOtherParticipant = (conv) => {
    return getOtherParticipantFromConversation(conv, user?._id);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation List */}
      <div
        className={`${
          activeConversation ? "hidden md:flex" : "flex"
        } md:w-80 w-full flex-col border-r border-base-300`}
      >
        <div className="p-4 border-b border-base-300">
          <h1 className="text-xl font-bold font-heading">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 skeleton rounded"></div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-8 text-base-content/50">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-base-200 transition-colors ${
                    activeConversation?._id === conv._id ? "bg-base-200" : ""
                  }`}
                >
                  <div className="relative">
                    <UserAvatar user={other} size={48} />
                    {isUserOnline(other?._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">
                        {other?.name || "Unknown"}
                      </p>
                      {conv.lastMessageTime && (
                        <span className="text-xs text-base-content/40">
                          {new Date(conv.lastMessageTime).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-base-content/50 truncate">
                      {conv.lastMessage || "Start a conversation"}
                    </p>
                  </div>
                  {(conv.unreadCounts?.[user?._id] || 0) > 0 && (
                    <span className="badge badge-primary badge-sm">
                      {conv.unreadCounts[user._id]}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
            <div className="flex items-center gap-3">
              <button
                className="btn btn-ghost btn-circle btn-sm md:hidden"
                onClick={() => setActiveConversation(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link
                to={`/profile/${getOtherParticipant(activeConversation)?._id}`}
                className="flex items-center gap-3"
              >
                <UserAvatar
                  user={getOtherParticipant(activeConversation)}
                  size={40}
                />
                <div>
                  <p className="font-semibold text-sm">
                    {getOtherParticipant(activeConversation)?.name}
                  </p>
                  <p className="text-xs text-base-content/50">
                    {isUserOnline(
                      getOtherParticipant(activeConversation)?._id
                    ) ? (
                      <span className="text-success">Online</span>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </Link>
            </div>
            {/* Chat actions dropdown */}
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-xl border border-base-300 w-48 mt-2"
              >
                <li>
                  <button
                    onClick={() => setShowClearChatModal(true)}
                    className="flex items-center gap-2 py-2"
                  >
                    <Eraser className="w-4 h-4" /> Clear Chat
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowDeleteChatModal(true)}
                    className="flex items-center gap-2 py-2 text-error"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Chat
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-base-content/50 mt-10">
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((msg) => {
                const isMine =
                  msg.sender?._id === user._id || msg.sender === user._id;
                const isDeleted = msg.type === "deleted";
                const isEditing = editingMessage === msg._id;
                return (
                  <div
                    key={msg._id}
                    className={`chat ${
                      isMine ? "chat-end" : "chat-start"
                    } group`}
                  >
                    <div className="chat-image avatar">
                      <UserAvatar user={msg.sender} size={32} />
                    </div>
                    <div className="chat-header text-xs opacity-50 mb-0.5 flex items-center gap-2">
                      <span>{msg.sender?.name || "User"}</span>
                      <time className="text-[10px]">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                      {msg.editedAt && !isDeleted && (
                        <span className="text-[9px] opacity-60">(edited)</span>
                      )}
                    </div>
                    <div
                      className={`chat-bubble text-sm relative ${
                        isMine ? "chat-bubble-primary" : ""
                      } ${isDeleted ? "opacity-50 italic" : ""}`}
                    >
                      {isDeleted ? (
                        <span className="text-xs italic">
                          This message was deleted
                        </span>
                      ) : msg.type === "text" ? (
                        <span>{msg.content}</span>
                      ) : msg.type === "image" ? (
                        <img
                          src={msg.fileUrl}
                          alt=""
                          className="max-w-[200px] rounded-lg"
                        />
                      ) : msg.type === "file" ? (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          className="underline text-sm"
                        >
                          {msg.fileName || "Download File"}
                        </a>
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>
                    {isMine && !isDeleted && (
                      <div className="chat-footer flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] opacity-50">
                          {msg.readBy?.length > 1 ? "✓✓ Read" : "✓ Sent"}
                        </span>
                        {/* Edit/Delete dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setMenuOpenId(
                                menuOpenId === msg._id ? null : msg._id
                              )
                            }
                            className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </button>
                          {menuOpenId === msg._id && (
                            <div className="absolute bottom-full right-0 mb-1 bg-base-100 shadow-lg rounded-xl border border-base-300 p-1 z-10 min-w-[120px]">
                              {msg.type === "text" && (
                                <button
                                  onClick={() => startEdit(msg)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg hover:bg-base-200 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                              )}
                              <button
                                onClick={() => setMsgToDelete(msg)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg hover:bg-error/10 text-error transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {isMine && isDeleted && (
                      <div className="chat-footer text-[10px] opacity-50 mt-0.5">
                        Deleted
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {/* Typing indicator */}
            {Object.entries(typingUsers).some(
              ([uid, isTyping]) => isTyping && uid !== user._id
            ) && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-8 rounded-full bg-base-300"></div>
                </div>
                <div className="chat-bubble bg-base-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-base-300 bg-base-100">
            {editingMessage && (
              <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border-b border-primary/10">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editing message</span>
                </div>
                <button
                  onClick={cancelEdit}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingMessage) {
                  handleEditMessage(editingMessage, messageText);
                } else {
                  handleSendMessage(e);
                }
              }}
              className="p-4 flex gap-2"
            >
              <button type="button" className="btn btn-ghost btn-circle btn-sm">
                <ImagePlus className="w-5 h-5" />
              </button>
              <input
                ref={editInputRef}
                type="text"
                className="input input-bordered flex-1 rounded-full"
                placeholder={
                  editingMessage ? "Edit message..." : "Type a message..."
                }
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  if (!editingMessage) handleTyping();
                }}
              />
              <button
                type="submit"
                className={`btn btn-circle btn-sm ${
                  editingMessage ? "btn-success" : "btn-primary"
                }`}
                disabled={!messageText.trim()}
              >
                {editingMessage ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-base-content/40">
          <div className="text-center">
            <MessageCircle className="w-20 h-20 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Select a conversation</p>
            <p className="text-sm">or search for users to start messaging</p>
          </div>
        </div>
      )}
      {/* Delete Message Confirm Modal */}
      <ConfirmModal
        isOpen={!!msgToDelete}
        onClose={() => setMsgToDelete(null)}
        onConfirm={() => handleDeleteMessage(msgToDelete?._id)}
        title="Delete this message?"
        message="This action cannot be undone. The message will be removed permanently."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Clear Chat Confirm Modal */}
      <ConfirmModal
        isOpen={showClearChatModal}
        onClose={() => setShowClearChatModal(false)}
        onConfirm={() => handleClearChat(activeConversation?._id)}
        title="Clear all messages?"
        message="This will clear the chat only for you. The other person will still keep their messages."
        confirmText="Clear"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Chat Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteChatModal}
        onClose={() => setShowDeleteChatModal(false)}
        onConfirm={() => handleDeleteChat(activeConversation?._id)}
        title="Delete this conversation?"
        message="This will remove the conversation only from your chat list. The other person will still keep their copy."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Chat;
