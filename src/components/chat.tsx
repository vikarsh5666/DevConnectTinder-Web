import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import api, { isRequestCanceled } from "../utils/api";
import { useAppSelector } from "../utils/hooks";

interface Message {
    _id: string;
    senderId: string;
    firstName: string;
    lastName: string;
    text: string;
    seen: boolean;
}

interface ChatApiMessage {
    _id: string;
    senderId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    text: string;
    seen: boolean;
}

const Chat = () => {
    const { targetUserId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { photoUrl } = location.state || {};

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [senderName, setSenderName] = useState("");

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const user = useAppSelector((store) => store.user);
    const userId = user?._id;

    const socketRef = useRef<
        ReturnType<typeof createSocketConnection> | null
    >(null);

    // Fetch existing chat messages
    useEffect(() => {
        if (!targetUserId) return;

        const controller = new AbortController();

        const fetchChatMessages = async () => {
            try {
                const response = await api.get(`/chat/${targetUserId}`, {
                    signal: controller.signal,
                });

                const chatMessages: Message[] = (
                    response.data.messages || []
                ).map((msg: ChatApiMessage) => ({
                    _id: msg._id,
                    senderId: msg.senderId._id,
                    firstName: msg.senderId?.firstName,
                    lastName: msg.senderId?.lastName,
                    text: msg.text,
                    seen: msg.seen,
                }));

                const sender = chatMessages.find(
                    (msg) => msg.senderId !== userId
                );

                if (!controller.signal.aborted) {
                    if (sender) {
                        setSenderName(
                            `${sender.firstName ?? ""} ${sender.lastName ?? ""}`.trim()
                        );
                    }

                    setMessages((prev) => {
                        const messageMap = new Map(
                            chatMessages.map((msg) => [msg._id, msg])
                        );

                        prev.forEach((msg) => {
                            const existing = messageMap.get(msg._id);

                            messageMap.set(
                                msg._id,
                                existing
                                    ? {
                                        ...existing,
                                        ...msg,
                                        seen: existing.seen || msg.seen,
                                    }
                                    : msg
                            );
                        });

                        return Array.from(messageMap.values());
                    });
                }
            } catch (error) {
                if (isRequestCanceled(error)) return;
                console.error("Failed to fetch messages:", error);
            }
        };

        fetchChatMessages();

        return () => {
            controller.abort();
        };
    }, [targetUserId, userId]);

    // Connect socket and handle messages and seen status
    useEffect(() => {
        if (!userId || !targetUserId) return;

        const socket = createSocketConnection();
        socketRef.current = socket;

        const handleMessageReceived = (message: Message) => {
            const normalizedMessage: Message = {
                _id: message._id,
                senderId: message.senderId?.toString(),
                firstName: message?.firstName,
                lastName: message.lastName,
                text: message.text,
                seen: message.seen ?? false,
            };

            setMessages((prev) => {
                const existingIndex = prev.findIndex(
                    (msg) => msg._id === normalizedMessage._id
                );

                if (existingIndex !== -1) {
                    return prev.map((msg, index) =>
                        index === existingIndex
                            ? { ...msg, ...normalizedMessage }
                            : msg
                    );
                }

                return [...prev, normalizedMessage];
            });

            if (normalizedMessage.senderId !== userId) {
                socket.emit("markMessagesSeen", {
                    userId,
                    targetUserId,
                });
            }
        };

        const handleMessagesSeen = ({
            messageIds,
        }: {
            messageIds: string[];
            seenBy: string;
        }) => {
            if (!Array.isArray(messageIds)) return;

            const seenIds = new Set(messageIds);

            setMessages((prev) =>
                prev.map((msg) =>
                    seenIds.has(msg._id)
                        ? { ...msg, seen: true }
                        : msg
                )
            );
        };

        socket.on("messageReceived", handleMessageReceived);
        socket.on("messagesSeen", handleMessagesSeen);

        socket.emit("joinChat", {
            firstName: user?.firstName,
            userId,
            targetUserId,
        });

        socket.emit("markMessagesSeen", {
            userId,
            targetUserId,
        });

        return () => {
            socket.off("messageReceived", handleMessageReceived);
            socket.off("messagesSeen", handleMessagesSeen);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [userId, targetUserId, user?.firstName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages]);

    // Send a message
    const sendMessage = () => {
        const text = newMessage.trim();

        if (!text || !userId || !targetUserId) return;

        socketRef.current?.emit("sendMessage", {
            firstName: user?.firstName,
            lastName: user.lastName,
            userId,
            targetUserId,
            text,
        });

        setNewMessage("");
    };

    const lastOwnMessageId = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].senderId?.toString() === userId?.toString()) {
                return messages[i]._id;
            }
        }
        return undefined;
    }, [messages, userId]);

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 h-[75vh] flex flex-col
            bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">

            {/* Chat Header */}
            <div className="relative flex items-center gap-3 p-4 pr-14 bg-gray-800 border-b border-gray-700">

                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold overflow-hidden shrink-0">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={senderName || "User"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        senderName?.charAt(0)?.toUpperCase() || "U"
                    )}
                </div>

                <div className="min-w-0">
                    <h1 className="text-white font-semibold text-lg truncate">
                        {senderName || "Chat"}
                    </h1>
                    <p className="text-xs text-green-400">
                        Chat conversation
                    </p>
                </div>

                <div className="ml-auto text-xl">💬</div>

                {/* Light theme-based Cross Button */}
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    aria-label="Close chat"
                    title="Close chat"
                    className="btn btn-circle btn-sm absolute right-3 top-1/2 -translate-y-1/2
                        bg-base-100 text-base-content
                        border-2 border-white/80 shadow-md
                        hover:bg-primary hover:text-primary-content
                        hover:border-primary transition-all duration-200"
                >
                    <span className="text-lg font-bold">✕</span>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-950">
                {messages.map((msg) => {
                    const isOwnMessage =
                        msg.senderId?.toString() === userId?.toString();

                    return (
                        <div
                            key={msg._id}
                            className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"
                                }`}
                        >
                            <span className="text-xs text-gray-400 mb-1 px-1">
                                {isOwnMessage
                                    ? "You"
                                    : `${msg.firstName || ""} ${msg.lastName || ""}`.trim()}
                            </span>

                            <div
                                className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl break-words ${isOwnMessage
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>

                            {isOwnMessage && msg._id === lastOwnMessageId && (
                                <span
                                    className={`mt-1 px-1 text-xs ${msg.seen ? "text-blue-400" : "text-gray-400"
                                        }`}
                                >
                                    {msg.seen ? "✓✓ Seen" : "✓"}
                                </span>
                            )}
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex items-center gap-3">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        className="flex-1 min-w-0 bg-gray-900 border border-gray-600
                            text-white placeholder-gray-400 rounded-full px-5 py-3
                            outline-none focus:border-blue-500 focus:ring-1
                            focus:ring-blue-500 transition"
                        placeholder="Type your message..."
                    />

                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                            disabled:cursor-not-allowed text-white font-medium
                            px-5 py-3 rounded-full transition"
                    >
                        Send ➤
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-2 ml-2">
                    Press Enter to send
                </p>
            </div>
        </div>
    );
};

export default Chat;