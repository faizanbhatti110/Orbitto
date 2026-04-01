// ── Home.jsx — Orbitto Dark Premium ──
import React from "react";
import "./Home.scss";
import Featured from "../../components/featured/Featured";
import { Link, useNavigate } from "react-router-dom";
import Slide from "../../components/slide/Slide";
import ProjectCard from "../../components/projectCard/ProjectCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function Home() {
  const navigate = useNavigate();

  const categories = [
    { name: "Programming & Tech",   image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/5_wp7wdf.jpg" },
    { name: "Video & Animation",    image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722198/6_h2h4p7.jpg" },
    { name: "Graphics & Design",    image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/8_x1evqy.jpg" },
    { name: "Business",             image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722198/3_an8lsw.jpg" },
    { name: "Consulting",           image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722198/2_nq2wro.jpg" },
    { name: "Digital Marketing",    image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/7_vsfotb.jpg" },
    { name: "Writing & Translation",image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722198/1_gtfkxh.jpg" },
    { name: "Data & Analytics",     image: "https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/4_zayyyh.jpg" },
  ];

  const features = [
    {
      icon: "🔒",
      title: "Trusted Internal Network",
      desc: "Work with colleagues you already know — no risk of hiring strangers from the internet.",
    },
    {
      icon: "⚡",
      title: "Fast Turnaround",
      desc: "Internal professionals respond faster and understand your organization's context already.",
    },
    {
      icon: "💼",
      title: "Any Sector, Any Size",
      desc: "From tech companies to hospitals to law firms — Orbitto works for every kind of organization.",
    },
    {
      icon: "📊",
      title: "Milestone Payments",
      desc: "Pay securely based on milestones. Funds are only released when you approve the work.",
    },
    {
      icon: "🤝",
      title: "Skill Endorsements",
      desc: "Colleagues endorse each other's skills, building a real trust graph inside your org.",
    },
    {
      icon: "🌐",
      title: "SaaS for Organizations",
      desc: "Orbitto is sold to organizations — your internal marketplace, your brand, your rules.",
    },
  ];

  const howItWorks = [
    { step: "01", title: "Your Org Joins", desc: "Your organization subscribes and onboards team members to the private Orbitto workspace." },
    { step: "02", title: "Post or Browse", desc: "Post a service you offer or browse gigs posted by colleagues across your organization." },
    { step: "03", title: "Hire with Trust", desc: "You already know these people — hire confidently based on real relationships, not anonymous reviews." },
    { step: "04", title: "Pay & Grow", desc: "Secure milestone-based payments. Build your internal reputation and unlock new opportunities." },
  ];

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
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Explore by <span className="highlight">Category</span>
            </h2>
            <p className="section-sub">Find the right talent for every kind of project</p>
          </div>
          <div className="category-grid">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/gigs?cat=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <img src={cat.image} alt={cat.name} className="category-card__image" />
                <div className="category-card__overlay" />
                <h3 className="category-card__name">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works">
        <div className="bg-glow" />
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How <span className="highlight">Orbitto</span> Works</h2>
            <p className="section-sub">Four simple steps to unlock your organization's hidden talent</p>
          </div>
          <div className="steps-grid ">
            {howItWorks.map((item, i) => (
              <div className="step-card" key={i}>
                <span className="step-number">{item.step}</span>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-desc">{item.desc}</p>
                {i < howItWorks.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="container">
          <div className="features-left">
            <div className="section-header left-align">
              <h2 className="section-title">
                Why teams choose <br />
                <span className="highlight">Orbitto</span>
              </h2>
              <p className="section-sub">
                Unlike Fiverr or Upwork, Orbitto operates within your organization's trusted network.
                No strangers. No uncertainty. Just colleagues who deliver.
              </p>
            </div>
            <Link to="/gigs">
              <button className="cta-btn">Explore Services →</button>
            </Link>
          </div>
          <div className="features-right">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <h4 className="feature-title">{f.title}</h4>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="cta-glow" />
        <div className="container">
          <h2>Ready to unlock your organization's potential?</h2>
          <p>Join hundreds of organizations already using Orbitto to hire from within.</p>
          <div className="cta-actions">
            <Link to="/register"><button className="cta-btn primary">Get Started Free</button></Link>
            <Link to="/gigs"><button className="cta-btn ghost">Browse Services</button></Link>
          </div>
        </div>
      </section>

      {/* ── Live Gigs Carousel ── */}
      {gigs.length > 0 && (
        <div className="gigs-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Live <span className="highlight">Services</span></h2>
              <p className="section-sub">Real services posted by professionals in your network</p>
            </div>
          </div>
          <Slide slidesToShow={4} arrowsScroll={4}>
            {gigs.map((gig) => (
              <ProjectCard key={gig._id} gig={gig} />
            ))}
          </Slide>
        </div>
      )}
    </div>
  );
}

export default Home;