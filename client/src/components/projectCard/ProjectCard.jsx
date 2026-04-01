// ── ProjectCard.jsx ──
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./ProjectCard.scss";

function ProjectCard({ gig }) {
  // Fetch the gig owner's info for avatar + username
  const { data: user } = useQuery({
    queryKey: ["gig-user", gig.userId],
    queryFn: () => newRequest.get(`/users/${gig.userId}`).then((res) => res.data),
    enabled: !!gig.userId,
  });

  return (
    <Link to={`/gig/${gig._id}`}>
      <div className="projectCard">
        <img src={gig.cover} alt={gig.title} />
        <div className="info">
          <img src={user?.img || "/img/noavatar.jpg"} alt={user?.username || "seller"} />
          <div className="texts">
            <h2>{gig.cat}</h2>
            <span>{user?.username || "…"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProjectCard;