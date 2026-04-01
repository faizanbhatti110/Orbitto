// ── Gigs.jsx — Orbitto Dark Premium ──
import React, { useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";

function Gigs() {
  const [sort, setSort] = useState("sales");
  const [open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();
  const menuRef = useRef();

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const category = queryParams.get("cat");
  const searchTerm = queryParams.get("search");

  const [page, setPage] = useState(1);
  const gigsPerPage = 12;

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs", search, sort, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (category) params.set("cat", category);
      if (searchTerm) params.set("search", searchTerm);
      params.set("min", minRef.current?.value || 0);
      params.set("max", maxRef.current?.value || 100000);
      params.set("sort", sort);
      params.set("page", page);
      params.set("limit", gigsPerPage);
      return newRequest.get(`/gigs?${params.toString()}`).then((res) => res.data);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  const apply = () => {
    setPage(1);
    refetch();
  };

  const totalPages = data ? Math.ceil(data.total / gigsPerPage) : 1;

  const pageHeading = category || (searchTerm ? `Results for "${searchTerm}"` : "All Services");

  return (
    <div className="gigsModern">
      <div className="container">
        <div className="categoryHeader">
          <h1>{pageHeading}</h1>
          <p>
            {category
              ? `Explore ${category} talent on Orbitto`
              : searchTerm
                ? `Showing services matching "${searchTerm}"`
                : "Browse all available services on Orbitto"}
          </p>
        </div>

        <div className="filterSortPanel">
          <div className="filterInputs">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="Min" />
            <input ref={maxRef} type="number" placeholder="Max" />
            <button onClick={apply}>Apply</button>
          </div>

          <div className="sortMenu" ref={menuRef}>
            <span className="sortLabel">Sort by:</span>
            <div className="sortToggle" onClick={() => setOpen(!open)}>
              <span className="sortValue">
                {sort === "sales" ? "Best Selling" : "Newest"}
              </span>
              <img src="/img/down.png" alt="sort" />
            </div>
            {open && (
              <div className="dropdownMenu">
                {sort !== "sales" && (
                  <span onClick={() => reSort("sales")}>Best Selling</span>
                )}
                {sort !== "createdAt" && (
                  <span onClick={() => reSort("createdAt")}>Newest</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="gigCards">
          {isLoading ? (
            <p className="loading-msg">Loading services…</p>
          ) : error ? (
            <p className="error-msg">Something went wrong. Please try again.</p>
          ) : data?.gigs?.length === 0 ? (
            <div className="empty-state">
              <p>No services found{category ? ` in "${category}"` : ""}.</p>
            </div>
          ) : (
            data?.gigs?.map((gig) => <GigCard key={gig._id} item={gig} />)
          )}
        </div>

        {!isLoading && data?.total > gigsPerPage && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Gigs;