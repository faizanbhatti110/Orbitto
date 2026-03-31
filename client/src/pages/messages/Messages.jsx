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

  // Get all conversations
  // const { isLoading, error, data } = useQuery({
  //   queryKey: ["conversations"],
  //   queryFn: () => newRequest.get(`/conversations`).then((res) => res.data),
  // });

  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => newRequest.get(`/conversations`).then((res) => res.data),
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Every 3 sec it checks for new messages
  });


  // Mutation to mark as read
  const mutation = useMutation({
    mutationFn: (id) => newRequest.put(`/conversations/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["conversations"]),
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  // Fetch user data for receiver in each conversation
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

  return (
    <div className="messages">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
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


                  // (currentUser._id === c.sellerId && !c.readBySeller) ||
                  // (currentUser._id === c.buyerId && !c.readByBuyer);

                  // (currentUser._id !== c.sellerId && !c.readBySeller) ||
                  // (currentUser._id !== c.buyerId && !c.readByBuyer);

                  // (currentUser._id === c.sellerId && !c.readBySeller) ||
                  // (currentUser._id === c.buyerId && !c.readByBuyer);
                  const isUnread = (
                    (currentUser._id === c.sellerId && !c.readBySeller) ||
                    (currentUser._id === c.buyerId && !c.readByBuyer)
                  );


                  return (
                    <tr key={c.id} className={isUnread ? "active" : ""}>
                      <td>
                        {receiver ? (
                          <Link to={`/message/${c.id}`} className="link">
                            <div className="user-info">
                              <img
                                src={receiver.img}
                                alt=""
                                style={{ width: "32px", borderRadius: "50%", marginRight: "10px" }}
                              />
                              <span>{receiver.username}</span>
                            </div>
                          </Link>
                        ) : (
                          "Loading..."
                        )}
                      </td>
                      <td>
                        <Link to={`/message/${c.id}`} className="link">
                          {c?.lastMessage?.substring(0, 100)}...
                        </Link>
                      </td>
                      <td>{moment(c.updatedAt).fromNow()}</td>
                      <td>{isUnread ? "1" : "0"}</td>
                      <td>
                        {isUnread ? (
                          <button className="read-btn" onClick={() => handleRead(c.id)}>Mark as Read</button>
                        ) : (
                          <span className="read-text">Read</span>
                        )}
                        {/* {isUnread && (
                        <button onClick={() => handleRead(c.id)}>
                          Mark as Read
                        </button>
                      )} */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
