import React from "react";
import "./Home.scss";
import Featured from "../../components/featured/Featured";
import { Link } from "react-router-dom";
import Slide from "../../components/slide/Slide";
import ProjectCard from "../../components/projectCard/ProjectCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function Home() {
  const categories = [
    { name: "Programming & Tech", image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/5_wp7wdf.jpg" },
    { name: "Video & Animation", image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722198/6_h2h4p7.jpg" },
    { name: "Graphics & Design", image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/8_x1evqy.jpg" },
    { name: "Business", image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722198/3_an8lsw.jpg" },
    { name: "Tutoring", image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722198/2_nq2wro.jpg" },
    { name: "Digital Marketing", image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/7_vsfotb.jpg" },
    { name: "Writing & Translation", image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722198/1_gtfkxh.jpg" },
    { name: "Music & Audio", image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/4_zayyyh.jpg" },
  ];

  // Fetch latest gigs for the showcase carousel
  const { data: gigs = [] } = useQuery({
    queryKey: ["showcase-gigs"],
    queryFn: () =>
      newRequest.get("/gigs?limit=12").then((res) =>
        Array.isArray(res.data) ? res.data : res.data.gigs || []
      ),
  });

  return (
    <div className="home">
      <Featured />

      {/* ── Categories ── */}
      <section className="categories-section" id="categories">
        <div className="container">
          <h2 className="section-title">
            Choose Different <span className="highlight">Category</span>
          </h2>
          <div className="category-grid">
            {categories.map((cat, index) => (
              <Link key={index} to={`/gigs?cat=${encodeURIComponent(cat.name)}`} className="category-card">
                <img src={cat.image} alt={cat.name} className="category-card__image" />
                <div className="category-card__overlay"></div>
                <h3 className="category-card__name">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features light ── */}
      <div className="features">
        <div className="container">
          <div className="item">
            <h1>Unlock a world of academic and professional opportunities</h1>
            <div className="title"><img src="./img/checkB.png" alt="" />Connecting Skills with Opportunities</div>
            <p>Connect with skilled university students and faculty for academic projects, freelance work, and career-building opportunities.</p>
            <div className="title"><img src="./img/checkB.png" alt="" />The best for every budget</div>
            <p>Find high-quality services at every price point. No hourly rates, just project-based pricing.</p>
            <div className="title"><img src="./img/checkB.png" alt="" />Quality work done quickly</div>
            <p>Find the right freelancer to begin working on your project within minutes.</p>
            <div className="title"><img src="./img/checkB.png" alt="" />24/7 support</div>
            <p>Find high-quality services at every price point. No hourly rates, just project-based pricing.</p>
          </div>
          <div className="item">
            <img src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753723770/working_xknnjt.png" className="feature-image" />
          </div>
        </div>
      </div>

      {/* ── Features dark ── */}
      <div className="features dark">
        <div className="container">
          <div className="item">
            <h1>CampusConnect</h1>
            <h1>A platform designed for <i>students and faculty</i></h1>
            <p style={{ marginLeft: "75px" }}>Upgrade to a seamless experience with opportunities for academic and professional growth.</p>
            <div className="title" style={{ marginLeft: "100px" }}><img src="./img/check.png" alt="" />Find talent for research, tutoring, projects, and freelance work.</div>
            <div className="title" style={{ marginLeft: "110px" }}><img src="./img/check.png" alt="" />Discover jobs and collaborations suited to your expertise.</div>
            <div className="title" style={{ marginLeft: "120px" }}><img src="./img/check.png" alt="" />Post jobs, track applications, and collaborate efficiently.</div>
            <a href="/gigs"><button>Explore CampusConnect</button></a>
          </div>
        </div>
      </div>

      {/* ── Showcase: real gigs from DB ── */}
      {gigs.length > 0 && (
        <Slide slidesToShow={4} arrowsScroll={4}>
          {gigs.map((gig) => (
            <ProjectCard key={gig._id} gig={gig} />
          ))}
        </Slide>
      )}
    </div>
  );
}

export default Home;