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

  const { isLoading, error, data } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => newRequest.get(`/messages/${id}`).then((res) => res.data),
  });

  const conversationQuery = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => newRequest.get(`/conversations/${id}`).then((res) => res.data),
  });

  useEffect(() => {
    if (conversationQuery.data) {
      const otherUserId =
        currentUser._id === conversationQuery.data.sellerId
          ? conversationQuery.data.buyerId
          : conversationQuery.data.sellerId;

      newRequest.get(`/users/${otherUserId}`).then((res) => {
        setReceiver(res.data);
      });
    }
  }, [conversationQuery.data, currentUser._id]);

  const mutation = useMutation({
    mutationFn: (message) => newRequest.post(`/messages`, message),
    onSuccess: () => queryClient.invalidateQueries(["messages", id]),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      conversationId: id,
      desc: e.target[0].value,
    });
    e.target[0].value = "";
  };


 const messagesContainerRef = useRef(null);

useEffect(() => {
  if (messagesContainerRef.current) {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }
}, [data]);


  return (
    <div className="message">
      <div className="container">
        {receiver && (
          <div className="chat-header">
            <img src={receiver.img} alt="User" />
            <h2>{receiver.username}</h2>
          </div>
        )}

        {isLoading ? (
          "loading..."
        ) : error ? (
          "Something went wrong"
        ) : (
//           <div className="messages" ref={messagesContainerRef}>
//   {data.map((m) => (
//     <div
//       className={m.userId === currentUser._id ? "owner item" : "item"}
//       key={m._id}
//     >
//       <img
//         src={
//           m.userId === currentUser._id
//             ? currentUser.img
//             : receiver?.img ||
//               "https://randomuser.me/api/portraits/men/76.jpg"
//         }
//         alt="Sender"
//       />
//       <p>{m.desc}</p>
//     </div>
//   ))}
// </div>

<div className="messages" ref={messagesContainerRef}>
  <div className="spacer" /> {/* Pushes messages down if few */}
  {data.map((m) => (
    <div
      className={m.userId === currentUser._id ? "owner item" : "item"}
      key={m._id}
    >
      <img
        src={
          m.userId === currentUser._id
            ? currentUser.img
            : receiver?.img || "https://randomuser.me/api/portraits/men/76.jpg"
        }
        alt="Sender"
      />
      <p>{m.desc}</p>
    </div>
  ))}
</div>

        )}
        <hr />
        <form className="write" onSubmit={handleSubmit}>
          <textarea placeholder="Write a message..." />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
  
};

export default Message;
