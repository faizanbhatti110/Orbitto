// ── Message.jsx — Orbitto Dark Premium ──
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Message.scss";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [receiver, setReceiver] = useState(null);
  const queryClient = useQueryClient();
  const messagesContainerRef = useRef(null);

  // ── Fetch messages ──
  const { isLoading, error, data } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => newRequest.get(`/messages/${id}`).then((res) => res.data),
  });

  // ── Fetch conversation to identify the other user ──
  const { data: conversationData } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => newRequest.get(`/conversations/${id}`).then((res) => res.data),
  });

  // ── Resolve the other user ──
  useEffect(() => {
    if (!conversationData) return;
    const otherUserId =
      currentUser._id === conversationData.sellerId
        ? conversationData.buyerId
        : conversationData.sellerId;
    newRequest.get(`/users/${otherUserId}`).then((res) => setReceiver(res.data));
  }, [conversationData, currentUser._id]);

  // ── Auto-scroll to latest message ──
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [data]);

  // ── Send message ──
  const mutation = useMutation({
    mutationFn: (message) => newRequest.post(`/messages`, message),
    onSuccess: () => queryClient.invalidateQueries(["messages", id]),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = e.target[0].value.trim();
    if (!val) return;
    mutation.mutate({ conversationId: id, desc: val });
    e.target[0].value = "";
  };

  return (
    <div className="message">
      <div className="container">

        {/* ── Chat header ── */}
        {receiver && (
          <div className="chat-header">
            <img
              src={receiver.img || "/img/noavatar.jpg"}
              alt={receiver.username}
            />
            <h2>{receiver.username}</h2>
          </div>
        )}

        {/* ── Message list ── */}
        {isLoading ? (
          <div className="messages messages--loading">
            <div className="msg-spinner" />
          </div>
        ) : error ? (
          <div className="messages messages--error">
            <p>Something went wrong loading messages.</p>
          </div>
        ) : (
          <div className="messages" ref={messagesContainerRef}>
            <div className="spacer" />
            {data.map((m) => (
              <div
                key={m._id}
                className={m.userId === currentUser._id ? "item owner" : "item"}
              >
                <img
                  src={
                    m.userId === currentUser._id
                      ? currentUser.img || "/img/noavatar.jpg"
                      : receiver?.img || "/img/noavatar.jpg"
                  }
                  alt="sender"
                />
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        )}

        <hr />

        {/* ── Compose area ── */}
        <form className="write" onSubmit={handleSubmit}>
          <textarea placeholder="Write a message…" />
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending…" : "Send"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Message;