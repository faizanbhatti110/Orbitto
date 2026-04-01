// ── Messages.jsx — Orbitto Dark Premium ──
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [userMap, setUserMap] = useState({});
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => newRequest.get(`/conversations`).then((res) => res.data),
    refetchOnWindowFocus: true,
    refetchInterval: 3000,
  });

  const mutation = useMutation({
    mutationFn: (id) => newRequest.put(`/conversations/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["conversations"]),
  });

  const handleRead = (id) => mutation.mutate(id);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!data) return;
      const ids = data.map((c) =>
        currentUser._id === c.sellerId ? c.buyerId : c.sellerId
      );
      const uniqueIds = [...new Set(ids)];
      const userRequests = await Promise.all(
        uniqueIds.map((id) => newRequest.get(`/users/${id}`))
      );
      const userObj = {};
      userRequests.forEach((res) => {
        userObj[res.data._id] = res.data;
      });
      setUserMap(userObj);
    };
    fetchUsers();
  }, [data, currentUser._id]);

  if (isLoading) return (
    <div className="messages">
      <div className="messages__state">Loading conversations…</div>
    </div>
  );

  if (error) return (
    <div className="messages">
      <div className="messages__state">Something went wrong. Please refresh.</div>
    </div>
  );

  return (
    <div className="messages">
      <div className="container">
        <div className="title">
          <h1>Messages</h1>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Last Message</th>
                <th>Date</th>
                <th>Unread</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => {
                const receiverId =
                  currentUser._id === c.sellerId ? c.buyerId : c.sellerId;
                const receiver = userMap[receiverId];

                const isUnread =
                  (currentUser._id === c.sellerId && !c.readBySeller) ||
                  (currentUser._id === c.buyerId && !c.readByBuyer);

                return (
                  <tr key={c.id} className={isUnread ? "active" : ""}>
                    <td>
                      {receiver ? (
                        <Link to={`/message/${c.id}`} className="link">
                          <div className="user-info">
                            <img src={receiver.img} alt={receiver.username} />
                            <span>{receiver.username}</span>
                          </div>
                        </Link>
                      ) : (
                        <span style={{ color: "var(--orb-muted)", fontSize: "13px" }}>
                          Loading…
                        </span>
                      )}
                    </td>
                    <td>
                      <Link to={`/message/${c.id}`} className="link">
                        {c?.lastMessage?.substring(0, 100)}…
                      </Link>
                    </td>
                    <td style={{ color: "var(--orb-muted)", fontSize: "13px" }}>
                      {moment(c.updatedAt).fromNow()}
                    </td>
                    <td>
                      {isUnread ? (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "20px",
                          height: "20px",
                          background: "linear-gradient(135deg, var(--orb-purple), var(--orb-purple-light))",
                          color: "white",
                          borderRadius: "50%",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}>1</span>
                      ) : (
                        <span className="read-text">—</span>
                      )}
                    </td>
                    <td>
                      {isUnread ? (
                        <button
                          className="read-btn"
                          onClick={() => handleRead(c.id)}
                          disabled={mutation.isPending}
                        >
                          Mark as Read
                        </button>
                      ) : (
                        <span className="read-text">Read</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Messages;
