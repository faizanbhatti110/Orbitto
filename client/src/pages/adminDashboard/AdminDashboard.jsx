// ── AdminDashboard.jsx — Orbitto Dark Premium ──
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiChevronLeft, FiChevronRight, FiPieChart, FiUsers, FiPackage, FiGlobe,
    FiLogOut, FiShoppingBag, FiSearch, FiZap, FiEdit2, FiTrash2,
    FiCheckCircle, FiClock, FiDollarSign, FiInbox, FiEye, FiCornerUpLeft, FiCheck,
    FiX, FiActivity, FiClipboard, FiFileText, FiChevronDown, FiTag, FiUser
} from "react-icons/fi";
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import newRequest from "../../utils/newRequest";
import "./AdminDashboard.scss";

const CATEGORIES = [
    "Programming & Tech",
    "Video & Animation",
    "Graphics & Design",
    "Business",
    "Consulting",
    "Digital Marketing",
    "Writing & Translation",
    "Data & Analytics",
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const categoryDropdownRef = useRef(null);

    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalSellers: 0, totalBuyers: 0, totalGigs: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState(null);
    const [orderStats, setOrderStats] = useState({ totalOrders: 0, completedOrders: 0, pendingOrders: 0, totalRevenue: 0 });
    const [orderSearch, setOrderSearch] = useState("");
    const [orderStatusFilter, setOrderStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [gigs, setGigs] = useState([]);
    const [gigsLoading, setGigsLoading] = useState(true);
    const [gigsError, setGigsError] = useState(null);
    const [gigSearch, setGigSearch] = useState("");
    const [gigCategoryFilter, setGigCategoryFilter] = useState("all");
    const [catDropdownOpen, setCatDropdownOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const [editUser, setEditUser] = useState(null);
    const [viewGigTarget, setViewGigTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteGigTarget, setDeleteGigTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState("users");

    useEffect(() => {
        const handler = (e) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target))
                setCatDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!currentUser || !currentUser.isAdmin) navigate("/");
    }, []);

    const fetchStats = async () => {
        try {
            const res = await newRequest.get("/admin/stats");
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (roleFilter !== "all") params.role = roleFilter;
            if (searchTerm.trim()) params.search = searchTerm.trim();
            const res = await newRequest.get("/admin/users", { params });
            setUsers(res.data);
            setError(null);
        } catch (err) { setError("Failed to fetch users."); }
        finally { setLoading(false); }
    };

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const allRes = await newRequest.get("/admin/orders");
            const allOrders = Array.isArray(allRes.data) ? allRes.data : [];
            const completed = allOrders.filter((o) => o.isCompleted);
            const revenue = completed.reduce((sum, o) => sum + (o.price || 0), 0);
            setOrderStats({ totalOrders: allOrders.length, completedOrders: completed.length, pendingOrders: allOrders.length - completed.length, totalRevenue: revenue });
            const params = {};
            if (orderStatusFilter !== "all") params.status = orderStatusFilter;
            if (orderSearch.trim()) params.search = orderSearch.trim();
            const filteredRes = await newRequest.get("/admin/orders", { params });
            setOrders(Array.isArray(filteredRes.data) ? filteredRes.data : []);
            setOrdersError(null);
        } catch (err) { setOrdersError("Failed to fetch orders."); }
        finally { setOrdersLoading(false); }
    };

    const fetchGigs = async () => {
        try {
            setGigsLoading(true);
            const params = {};
            if (gigCategoryFilter !== "all") params.cat = gigCategoryFilter;
            if (gigSearch.trim()) params.search = gigSearch.trim();
            const res = await newRequest.get("/admin/gigs", { params });
            setGigs(Array.isArray(res.data) ? res.data : []);
            setGigsError(null);
        } catch (err) { setGigsError("Failed to fetch gigs."); }
        finally { setGigsLoading(false); }
    };

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchUsers(); }, [roleFilter, searchTerm]);
    useEffect(() => { if (activeNav === "orders" || activeNav === "overview") fetchOrders(); }, [activeNav, orderStatusFilter, orderSearch]);
    useEffect(() => { if (activeNav === "gigs" || activeNav === "overview") fetchGigs(); }, [activeNav, gigCategoryFilter, gigSearch]);

    const handleEditSave = async () => {
        try {
            setSaving(true);
            await newRequest.put(`/admin/users/${editUser._id}`, {
                username: editUser.username, email: editUser.email, country: editUser.country,
                phone: editUser.phone || "", isSeller: editUser.isSeller, isAdmin: editUser.isAdmin, desc: editUser.desc || "",
            });
            setEditUser(null); fetchUsers(); fetchStats();
        } catch (err) {
            alert("Failed to update user: " + (err.response?.data?.message || err.message));
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await newRequest.delete(`/admin/users/${deleteTarget._id}`);
            setDeleteTarget(null); fetchUsers(); fetchStats();
        } catch (err) { alert("Failed to delete user."); }
        finally { setDeleting(false); }
    };

    const handleDeleteGig = async () => {
        try {
            setDeleting(true);
            await newRequest.delete(`/admin/gigs/${deleteGigTarget._id}`);
            setDeleteGigTarget(null); fetchGigs(); fetchStats();
        } catch (err) { alert("Failed to delete gig."); }
        finally { setDeleting(false); }
    };

    const handleLogout = async () => {
        try {
            await newRequest.post("/auth/logout");
            localStorage.setItem("currentUser", null);
            navigate("/");
        } catch (err) { console.log(err); }
    };

    const handleUpdateOrderStatus = async (orderId, isCompleted) => {
        try {
            await newRequest.put(`/admin/orders/${orderId}`, { isCompleted });
            fetchOrders();
        } catch (err) { alert("Failed to update order status."); }
    };

    const formatCurrency = (n) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

    const filteredOrders = orders.filter((o) => {
        const q = orderSearch.toLowerCase();
        const matchSearch = !q || o.buyerId?.username?.toLowerCase().includes(q) || o.sellerId?.username?.toLowerCase().includes(q) || o.gigId?.title?.toLowerCase().includes(q) || o._id?.toLowerCase().includes(q);
        const matchStatus = orderStatusFilter === "all" || (orderStatusFilter === "completed" && o.isCompleted) || (orderStatusFilter === "pending" && !o.isCompleted);
        return matchSearch && matchStatus;
    });

    // ── Role badge: isSeller → Freelancer, else → Member ──
    const roleBadge = (u) => {
        if (!u) return null;
        if (u.isAdmin) return <span className="badge badge-admin"><FiZap className="icon-sm" /> Admin</span>;
        if (u.isSeller) return <span className="badge badge-freelancer"><FiShoppingBag className="icon-sm" /> Freelancer</span>;
        return <span className="badge badge-member"><FiUser className="icon-sm" /> Member</span>;
    };

    // ── Chart data ──
    const userBreakdown = [
        { name: "Freelancers", value: stats.totalSellers || 0, color: "#a78bfa" },
        { name: "Members",     value: stats.totalBuyers  || 0, color: "#7c3aed" },
    ];
    const gigsPerCategory = CATEGORIES.map((cat) => ({
        name: cat.split(" & ")[0].split(" ")[0],
        fullName: cat,
        gigs: gigs.filter((g) => g.cat === cat).length,
    }));
    const orderBreakdown = [
        { name: "Completed",  value: orderStats.completedOrders, color: "#34d399" },
        { name: "In Progress", value: orderStats.pendingOrders,   color: "#fbbf24" },
    ];
    const topGigs = [...gigs]
        .sort((a, b) => (b.sales || 0) - (a.sales || 0))
        .slice(0, 5)
        .map((g) => ({ name: g.title?.length > 20 ? g.title.slice(0, 20) + "…" : g.title, sales: g.sales || 0 }));
    const hasSalesData = topGigs.some((g) => g.sales > 0);
    const topByReviews = [...gigs]
        .sort((a, b) => (b.starNumber || 0) - (a.starNumber || 0))
        .slice(0, 5)
        .map((g) => ({ name: g.title?.length > 20 ? g.title.slice(0, 20) + "…" : g.title, reviews: g.starNumber || 0 }));
    const hasReviewData = topByReviews.some((g) => g.reviews > 0);
    const topRated = [...gigs]
        .filter((g) => g.starNumber > 0)
        .sort((a, b) => (b.totalStars / b.starNumber) - (a.totalStars / a.starNumber))
        .slice(0, 5)
        .map((g) => ({ name: g.title?.length > 20 ? g.title.slice(0, 20) + "…" : g.title, rating: parseFloat((g.totalStars / g.starNumber).toFixed(1)) }));

    const RADIAN = Math.PI / 180;
    const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.06) return null;
        const r = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + r * Math.cos(-midAngle * RADIAN);
        const y = cy + r * Math.sin(-midAngle * RADIAN);
        return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
    };

    // shared chart styles
    const chartTooltipStyle = { borderRadius: 10, border: "1px solid rgba(124,58,237,0.2)", background: "#1a1a2e", color: "#f0eeff", fontSize: 13 };
    const chartGridColor = "rgba(255,255,255,0.05)";
    const chartTickStyle = { fontSize: 11, fill: "rgba(240,238,255,0.4)" };

    return (
        <div className="admin-layout">

            {/* ── Sidebar ── */}
            <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        {sidebarOpen
                            ? <span className="logo-text">Orb<span className="logo-accent">itto</span></span>
                            : <span className="logo-icon">O</span>}
                    </div>
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {[
                        { key: "overview", icon: <FiPieChart />,  label: "Overview" },
                        { key: "users",    icon: <FiUsers />,     label: "Users" },
                        { key: "gigs",     icon: <FiFileText />,  label: "Services" },
                        { key: "orders",   icon: <FiPackage />,   label: "Orders" },
                    ].map(({ key, icon, label }) => (
                        <button key={key} className={`nav-item ${activeNav === key ? "active" : ""}`} onClick={() => setActiveNav(key)}>
                            <span className="nav-icon">{icon}</span>
                            {sidebarOpen && <span className="nav-label">{label}</span>}
                        </button>
                    ))}
                    <Link to="/" className="nav-item nav-link">
                        <span className="nav-icon"><FiGlobe /></span>
                        {sidebarOpen && <span className="nav-label">View Site</span>}
                    </Link>
                </nav>

                <div className="sidebar-bottom">
                    <div className="admin-profile">
                        <img src={currentUser?.img || "/img/noavatar.jpg"} alt="admin" className="admin-avatar" />
                        {sidebarOpen && (
                            <div className="admin-info">
                                <p className="admin-name">{currentUser?.username}</p>
                                <p className="admin-role">Administrator</p>
                            </div>
                        )}
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="nav-icon"><FiLogOut /></span>
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h1 className="page-title">
                            {activeNav === "overview" && <><FiPieChart /> Overview</>}
                            {activeNav === "users"    && <><FiUsers /> User Management</>}
                            {activeNav === "gigs"     && <><FiFileText /> Service Management</>}
                            {activeNav === "orders"   && <><FiPackage /> Order Management</>}
                        </h1>
                        <p className="page-subtitle">
                            {activeNav === "overview" && "Platform statistics at a glance"}
                            {activeNav === "users"    && "Manage all registered users"}
                            {activeNav === "gigs"     && "Browse and manage platform services"}
                            {activeNav === "orders"   && "Track orders, revenue & fulfilment status"}
                        </p>
                    </div>
                </header>

                {/* ── Stats ── */}
                <div className="stats-grid">
                    <div className="stat-card stat-total">
                        <div className="stat-icon"><FiUsers /></div>
                        <div className="stat-content"><h2 className="stat-number">{stats.totalUsers}</h2><p className="stat-label">Total Users</p></div>
                        <div className="stat-bg-icon"><FiUsers /></div>
                    </div>
                    <div className="stat-card stat-sellers">
                        <div className="stat-icon"><FiShoppingBag /></div>
                        <div className="stat-content"><h2 className="stat-number">{stats.totalSellers}</h2><p className="stat-label">Freelancers</p></div>
                        <div className="stat-bg-icon"><FiShoppingBag /></div>
                    </div>
                    <div className="stat-card stat-buyers">
                        <div className="stat-icon"><FiUser /></div>
                        <div className="stat-content"><h2 className="stat-number">{stats.totalBuyers}</h2><p className="stat-label">Members</p></div>
                        <div className="stat-bg-icon"><FiUser /></div>
                    </div>
                    <div className="stat-card stat-rate">
                        <div className="stat-icon"><FiFileText /></div>
                        <div className="stat-content"><h2 className="stat-number">{stats.totalGigs || 0}</h2><p className="stat-label">Total Services</p></div>
                        <div className="stat-bg-icon"><FiFileText /></div>
                    </div>
                </div>

                {/* ── Users ── */}
                {activeNav === "users" && (
                    <div className="table-section">
                        <div className="table-toolbar">
                            <div className="search-box">
                                <span className="search-icon"><FiSearch /></span>
                                <input type="text" placeholder="Search by username or email…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="filter-pills">
                                {[
                                    { key: "all",        label: "All Users" },
                                    { key: "freelancer", label: "Freelancers" },
                                    { key: "member",     label: "Members" },
                                ].map(({ key, label }) => (
                                    <button key={key} className={`pill ${roleFilter === key ? "active" : ""}`} onClick={() => setRoleFilter(key)}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="empty-state"><div className="spinner" /><p>Loading users…</p></div>
                        ) : error ? (
                            <div className="empty-state error-state"><p>{error}</p><button onClick={fetchUsers} className="retry-btn">Retry</button></div>
                        ) : users.length === 0 ? (
                            <div className="empty-state"><p>No users found.</p></div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="user-table">
                                    <thead>
                                        <tr><th>User</th><th>Email</th><th>Country</th><th>Role</th><th>Admin</th><th>Joined</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id}>
                                                <td><div className="user-cell"><img src={u.img || "/img/noavatar.jpg"} alt={u.username} className="user-thumb" /><span className="user-name">{u.username}</span></div></td>
                                                <td className="email-cell">{u.email}</td>
                                                <td>{u.country || "—"}</td>
                                                <td>{roleBadge(u)}</td>
                                                <td>{u.isAdmin ? <span className="badge badge-admin"><FiZap className="icon-sm" /> Admin</span> : <span className="badge badge-member"><FiUser className="icon-sm" /> User</span>}</td>
                                                <td className="date-cell">{new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                                                <td>
                                                    <div className="action-btns">
                                                        <button className="action-btn edit-btn" title="Edit" onClick={() => setEditUser({ ...u })}><FiEdit2 /></button>
                                                        <button className="action-btn delete-btn" title="Delete" onClick={() => setDeleteTarget(u)} disabled={u._id === currentUser?._id}><FiTrash2 /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="table-footer">Showing <strong>{users.length}</strong> user{users.length !== 1 && "s"}</div>
                    </div>
                )}

                {/* ── Overview ── */}
                {activeNav === "overview" && (
                    <div className="overview-section">
                        <div className="chart-row">
                            <div className="chart-card">
                                <h3 className="chart-title"><FiUsers /> User Breakdown</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={userBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={renderPieLabel}>
                                            {userBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={chartTooltipStyle} />
                                        <Legend wrapperStyle={{ fontSize: 12, color: "rgba(240,238,255,0.6)" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="chart-sub-row">
                                    <span className="chart-sub" style={{ color: "#a78bfa" }}>Freelancers: <strong>{stats.totalSellers}</strong></span>
                                    <span className="chart-sub" style={{ color: "#7c3aed" }}>Members: <strong>{stats.totalBuyers}</strong></span>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3 className="chart-title"><FiPackage /> Order Status</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={orderBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={renderPieLabel}>
                                            {orderBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={chartTooltipStyle} />
                                        <Legend wrapperStyle={{ fontSize: 12, color: "rgba(240,238,255,0.6)" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="chart-sub-row">
                                    <span className="chart-sub" style={{ color: "#34d399" }}>Completed: <strong>{orderStats.completedOrders}</strong></span>
                                    <span className="chart-sub" style={{ color: "#fbbf24" }}>Pending: <strong>{orderStats.pendingOrders}</strong></span>
                                </div>
                            </div>

                            <div className="chart-card overview-actions-card">
                                <h3 className="chart-title"><FiClipboard /> Quick Actions</h3>
                                <div className="quick-actions-vertical">
                                    <button className="quick-btn" onClick={() => setActiveNav("users")}><FiUsers /> Manage Users</button>
                                    <button className="quick-btn" onClick={() => setActiveNav("gigs")}><FiFileText /> View Services</button>
                                    <button className="quick-btn" onClick={() => setActiveNav("orders")}><FiPackage /> View Orders</button>
                                </div>
                                <div className="platform-health">
                                    <FiActivity className="health-icon" />
                                    <span>All systems operational</span>
                                </div>
                            </div>
                        </div>

                        <div className="chart-card chart-card-full">
                            <h3 className="chart-title"><FiTag /> Services per Category</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={gigsPerCategory} margin={{ top: 8, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                    <XAxis dataKey="name" tick={chartTickStyle} />
                                    <YAxis allowDecimals={false} tick={chartTickStyle} />
                                    <Tooltip
                                        formatter={(v) => [v, "Services"]}
                                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                                        contentStyle={chartTooltipStyle}
                                    />
                                    <Bar dataKey="gigs" radius={[6, 6, 0, 0]} fill="#7c3aed" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-row">
                            <div className="chart-card chart-card-half">
                                <h3 className="chart-title"><FiShoppingBag /> {hasSalesData ? "Top Services by Sales" : "Top Services by Reviews"}</h3>
                                {!hasSalesData && !hasReviewData ? (
                                    <p className="chart-empty">No activity data yet.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={hasSalesData ? topGigs : topByReviews} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                                            <XAxis type="number" allowDecimals={false} tick={chartTickStyle} />
                                            <YAxis type="category" dataKey="name" width={110} tick={chartTickStyle} />
                                            <Tooltip contentStyle={chartTooltipStyle} />
                                            <Bar dataKey={hasSalesData ? "sales" : "reviews"} radius={[0, 6, 6, 0]} fill="#a78bfa" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            <div className="chart-card chart-card-half">
                                <h3 className="chart-title">⭐ Top Rated Services</h3>
                                {topRated.length === 0 ? (
                                    <p className="chart-empty">No review data yet.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={topRated} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                                            <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={chartTickStyle} />
                                            <YAxis type="category" dataKey="name" width={110} tick={chartTickStyle} />
                                            <Tooltip formatter={(v) => [v + " ★", "Avg Rating"]} contentStyle={chartTooltipStyle} />
                                            <Bar dataKey="rating" radius={[0, 6, 6, 0]} fill="#fbbf24" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Services (Gigs) ── */}
                {activeNav === "gigs" && (
                    <div className="table-section">
                        <div className="table-toolbar">
                            <div className="search-box">
                                <span className="search-icon"><FiSearch /></span>
                                <input type="text" placeholder="Search by title or username…" value={gigSearch} onChange={(e) => setGigSearch(e.target.value)} />
                            </div>
                            <div className="cat-dropdown-wrapper" ref={categoryDropdownRef}>
                                <button className="cat-dropdown-trigger" onClick={() => setCatDropdownOpen(!catDropdownOpen)}>
                                    <span>{gigCategoryFilter === "all" ? "All Categories" : gigCategoryFilter}</span>
                                    <FiChevronDown className={`cat-chevron ${catDropdownOpen ? "open" : ""}`} />
                                </button>
                                {catDropdownOpen && (
                                    <div className="cat-dropdown-menu">
                                        <div className={`cat-dropdown-item ${gigCategoryFilter === "all" ? "active" : ""}`} onClick={() => { setGigCategoryFilter("all"); setCatDropdownOpen(false); }}>All Categories</div>
                                        {CATEGORIES.map((cat) => (
                                            <div key={cat} className={`cat-dropdown-item ${gigCategoryFilter === cat ? "active" : ""}`} onClick={() => { setGigCategoryFilter(cat); setCatDropdownOpen(false); }}>{cat}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {gigsLoading ? <div className="empty-state"><div className="spinner" /><p>Loading services…</p></div>
                            : gigsError ? <div className="empty-state error-state"><p>{gigsError}</p><button onClick={fetchGigs} className="retry-btn">Retry</button></div>
                            : gigs.length === 0 ? <div className="empty-state"><div className="empty-icon"><FiInbox /></div><p>No services found.</p></div>
                            : (
                                <div className="table-wrapper">
                                    <table className="user-table">
                                        <thead><tr><th>Service</th><th>Category</th><th>Creator</th><th>Role</th><th>Price</th><th>Sales</th><th>Date</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {gigs.map((g) => (
                                                <tr key={g._id}>
                                                    <td>
                                                        <div className="gig-cell">
                                                            {g.cover && <img src={g.cover} alt="gig" className="gig-thumb" />}
                                                            <div>
                                                                <span className="gig-title" title={g.title}>{g.title || "—"}</span>
                                                                <span className="gig-sub">{g.shortTitle || ""}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className="badge badge-cat">{g.cat || "—"}</span></td>
                                                    <td>
                                                        <div className="user-cell">
                                                            <img src={g.userId?.img || "/img/noavatar.jpg"} alt="creator" className="user-thumb" />
                                                            <div>
                                                                <span className="user-name">{g.userId?.username || "—"}</span>
                                                                <span className="user-sub">{g.userId?.email || ""}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{roleBadge(g.userId)}</td>
                                                    <td><span className="price-cell">{formatCurrency(g.price)}</span></td>
                                                    <td>{g.sales || 0}</td>
                                                    <td className="date-cell">{new Date(g.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                                                    <td>
                                                        <div className="action-btns">
                                                            <button className="action-btn view-btn" title="View Service" onClick={() => setViewGigTarget(g)}><FiEye /></button>
                                                            <button className="action-btn delete-btn" title="Delete Service" onClick={() => setDeleteGigTarget(g)}><FiTrash2 /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        <div className="table-footer">Showing <strong>{gigs.length}</strong> service{gigs.length !== 1 && "s"}</div>
                    </div>
                )}

                {/* ── Orders ── */}
                {activeNav === "orders" && (
                    <>
                        <div className="order-stats-grid">
                            <div className="order-stat-card osc-total"><div className="osc-icon"><FiPackage /></div><div className="osc-body"><h2>{orderStats.totalOrders}</h2><p>Total Orders</p></div></div>
                            <div className="order-stat-card osc-completed"><div className="osc-icon"><FiCheckCircle /></div><div className="osc-body"><h2>{orderStats.completedOrders}</h2><p>Completed</p></div></div>
                            <div className="order-stat-card osc-pending"><div className="osc-icon"><FiClock /></div><div className="osc-body"><h2>{orderStats.pendingOrders}</h2><p>In Progress</p></div></div>
                            <div className="order-stat-card osc-revenue"><div className="osc-icon"><FiDollarSign /></div><div className="osc-body"><h2>{formatCurrency(orderStats.totalRevenue)}</h2><p>Total Revenue</p></div></div>
                        </div>
                        <div className="table-section">
                            <div className="table-toolbar">
                                <div className="search-box">
                                    <span className="search-icon"><FiSearch /></span>
                                    <input type="text" placeholder="Search by buyer, seller, service or order ID…" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
                                </div>
                                <div className="filter-pills">
                                    {["all", "completed", "pending"].map((f) => (
                                        <button key={f} className={`pill ${orderStatusFilter === f ? "active" : ""}`} onClick={() => setOrderStatusFilter(f)}>
                                            {f === "all" ? "All Orders" : f === "completed" ? <><FiCheckCircle /> Completed</> : <><FiClock /> In Progress</>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {ordersLoading ? <div className="empty-state"><div className="spinner" /><p>Loading orders…</p></div>
                                : ordersError ? <div className="empty-state error-state"><p>{ordersError}</p><button onClick={fetchOrders} className="retry-btn">Retry</button></div>
                                : filteredOrders.length === 0 ? <div className="empty-state"><div className="empty-icon"><FiInbox /></div><p>No orders found.</p></div>
                                : (
                                    <div className="table-wrapper">
                                        <table className="user-table orders-table">
                                            <thead><tr><th>Order ID</th><th>Service</th><th>Buyer</th><th>Seller</th><th>Price</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {filteredOrders.map((o) => (
                                                    <tr key={o._id}>
                                                        <td><span className="order-id" title={o._id}>#{o._id?.slice(-6).toUpperCase()}</span></td>
                                                        <td><div className="gig-cell">{o.img && <img src={o.img} alt="gig" className="gig-thumb" />}<span className="gig-title">{o.gigId?.title || o.title || "—"}</span></div></td>
                                                        <td><div className="user-cell"><img src={o.buyerId?.img || "/img/noavatar.jpg"} alt="buyer" className="user-thumb" /><div><span className="user-name">{o.buyerId?.username || "—"}</span>{o.buyerId?.email && <span className="user-sub">{o.buyerId.email}</span>}</div></div></td>
                                                        <td><div className="user-cell"><img src={o.sellerId?.img || "/img/noavatar.jpg"} alt="seller" className="user-thumb" /><div><span className="user-name">{o.sellerId?.username || "—"}</span>{o.sellerId?.email && <span className="user-sub">{o.sellerId.email}</span>}</div></div></td>
                                                        <td><span className="price-cell">{formatCurrency(o.price)}</span></td>
                                                        <td><span className={`status-badge ${o.isCompleted ? "status-done" : "status-pending"}`}>{o.isCompleted ? <><FiCheckCircle className="icon-sm" /> Completed</> : <><FiClock className="icon-sm" /> In Progress</>}</span></td>
                                                        <td className="date-cell">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                                                        <td>
                                                            <div className="action-btns">
                                                                <button className="action-btn view-btn" title="View Details" onClick={() => setSelectedOrder(o)}><FiEye /></button>
                                                                <button className={`action-btn ${o.isCompleted ? "undo-btn" : "complete-btn"}`} title={o.isCompleted ? "Mark Pending" : "Mark Completed"} onClick={() => handleUpdateOrderStatus(o._id, !o.isCompleted)}>{o.isCompleted ? <FiCornerUpLeft /> : <FiCheck />}</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            <div className="table-footer">
                                Showing <strong>{filteredOrders.length}</strong> order{filteredOrders.length !== 1 && "s"}
                                {orderStats.totalRevenue > 0 && <span className="footer-revenue"> · Revenue from completed: <strong>{formatCurrency(orderStats.totalRevenue)}</strong></span>}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* ── Edit User Modal ── */}
            {editUser && (
                <div className="modal-overlay" onClick={() => setEditUser(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2><FiEdit2 /> Edit User</h2><button className="modal-close" onClick={() => setEditUser(null)}><FiX /></button></div>
                        <div className="modal-body">
                            <div className="modal-avatar-row">
                                <img src={editUser.img || "/img/noavatar.jpg"} alt="avatar" className="modal-avatar" />
                                <div><p className="modal-user-id">ID: {editUser._id}</p><p className="modal-user-joined">Joined: {new Date(editUser.createdAt).toLocaleDateString()}</p></div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group"><label>Username</label><input type="text" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} /></div>
                                <div className="form-group"><label>Email</label><input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} /></div>
                                <div className="form-group"><label>Country</label><input type="text" value={editUser.country} onChange={(e) => setEditUser({ ...editUser, country: e.target.value })} /></div>
                                <div className="form-group"><label>Phone</label><input type="text" value={editUser.phone || ""} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} /></div>
                                <div className="form-group full-width"><label>Bio / Description</label><textarea rows={3} value={editUser.desc || ""} onChange={(e) => setEditUser({ ...editUser, desc: e.target.value })} /></div>
                                <div className="form-group checkbox-group"><label className="checkbox-label"><input type="checkbox" checked={editUser.isSeller} onChange={(e) => setEditUser({ ...editUser, isSeller: e.target.checked })} /><span>Is Freelancer</span></label></div>
                                <div className="form-group checkbox-group"><label className="checkbox-label"><input type="checkbox" checked={editUser.isAdmin} onChange={(e) => setEditUser({ ...editUser, isAdmin: e.target.checked })} /><span>Is Admin</span></label></div>
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setEditUser(null)}>Cancel</button><button className="btn-primary" onClick={handleEditSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button></div>
                    </div>
                </div>
            )}

            {/* ── View Gig Modal ── */}
            {viewGigTarget && (
                <div className="modal-overlay" onClick={() => setViewGigTarget(null)}>
                    <div className="modal modal-gig-edit" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2><FiEye /> Service Details</h2><button className="modal-close" onClick={() => setViewGigTarget(null)}><FiX /></button></div>
                        <div className="modal-body">
                            <div className="gig-edit-preview">
                                {viewGigTarget.cover
                                    ? <img src={viewGigTarget.cover} alt="cover" className="gig-edit-cover" />
                                    : <div className="gig-edit-cover gig-no-cover"><FiFileText /></div>}
                                <div className="gig-edit-meta">
                                    <p className="gig-edit-id">ID: <span className="mono">{viewGigTarget._id}</span></p>
                                    <p className="gig-edit-creator">By <strong>{viewGigTarget.userId?.username || "—"}</strong><span className="gig-creator-role">{roleBadge(viewGigTarget.userId)}</span></p>
                                    <p className="gig-edit-dates">Created: {new Date(viewGigTarget.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                                </div>
                            </div>
                            <div className="gig-view-grid">
                                <div className="gig-view-item full"><span className="gig-view-label">Service Title</span><span className="gig-view-value large">{viewGigTarget.title || "—"}</span></div>
                                <div className="gig-view-item full"><span className="gig-view-label">Short Title</span><span className="gig-view-value">{viewGigTarget.shortTitle || "—"}</span></div>
                                <div className="gig-view-item"><span className="gig-view-label">Category</span><span className="badge badge-cat">{viewGigTarget.cat || "—"}</span></div>
                                <div className="gig-view-item"><span className="gig-view-label">Price</span><span className="gig-view-value purple">{formatCurrency(viewGigTarget.price)}</span></div>
                                <div className="gig-view-item"><span className="gig-view-label">Delivery Time</span><span className="gig-view-value">{viewGigTarget.deliveryTime || "—"} day{viewGigTarget.deliveryTime !== 1 ? "s" : ""}</span></div>
                                <div className="gig-view-item"><span className="gig-view-label">Revisions</span><span className="gig-view-value">{viewGigTarget.revisionNumber ?? "—"}</span></div>
                                <div className="gig-view-item"><span className="gig-view-label">Sales</span><span className="gig-view-value">{viewGigTarget.sales || 0}</span></div>
                                <div className="gig-view-item full"><span className="gig-view-label">Short Description</span><span className="gig-view-value">{viewGigTarget.shortDesc || "—"}</span></div>
                                <div className="gig-view-item full"><span className="gig-view-label">Full Description</span><p className="gig-view-desc">{viewGigTarget.desc || "—"}</p></div>
                                {viewGigTarget.features?.length > 0 && (
                                    <div className="gig-view-item full"><span className="gig-view-label">Features</span><div className="gig-features-list">{viewGigTarget.features.map((f) => <span key={f} className="gig-feature-tag">{f}</span>)}</div></div>
                                )}
                                {viewGigTarget.images?.length > 0 && (
                                    <div className="gig-view-item full"><span className="gig-view-label">Additional Images</span><div className="gig-view-images">{viewGigTarget.images.map((img, i) => <img key={i} src={img} alt="" className="gig-view-thumb" />)}</div></div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setViewGigTarget(null)}>Close</button>
                            <button className="btn-danger" onClick={() => { setDeleteGigTarget(viewGigTarget); setViewGigTarget(null); }}><FiTrash2 /> Delete Service</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete User Modal ── */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header danger"><h2><FiTrash2 /> Delete User</h2><button className="modal-close" onClick={() => setDeleteTarget(null)}><FiX /></button></div>
                        <div className="modal-body"><p className="confirm-text">Are you sure you want to permanently delete <strong>{deleteTarget.username}</strong>? This action cannot be undone.</p></div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete User"}</button></div>
                    </div>
                </div>
            )}

            {/* ── Delete Service Modal ── */}
            {deleteGigTarget && (
                <div className="modal-overlay" onClick={() => setDeleteGigTarget(null)}>
                    <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header danger"><h2><FiTrash2 /> Delete Service</h2><button className="modal-close" onClick={() => setDeleteGigTarget(null)}><FiX /></button></div>
                        <div className="modal-body"><p className="confirm-text">Are you sure you want to permanently delete <strong>{deleteGigTarget.title}</strong>? This action cannot be undone.</p></div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={() => setDeleteGigTarget(null)}>Cancel</button><button className="btn-danger" onClick={handleDeleteGig} disabled={deleting}>{deleting ? "Deleting…" : "Delete Service"}</button></div>
                    </div>
                </div>
            )}

            {/* ── Order Detail Modal ── */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal modal-order" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2><FiPackage /> Order Details</h2><button className="modal-close" onClick={() => setSelectedOrder(null)}><FiX /></button></div>
                        <div className="modal-body">
                            <div className="order-detail-header">
                                <div><p className="order-detail-id">Order #{selectedOrder._id?.slice(-6).toUpperCase()}</p><p className="order-detail-date">Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p></div>
                                <span className={`status-badge ${selectedOrder.isCompleted ? "status-done" : "status-pending"}`}>{selectedOrder.isCompleted ? <><FiCheckCircle className="icon-sm" /> Completed</> : <><FiClock className="icon-sm" /> In Progress</>}</span>
                            </div>
                            <div className="order-detail-section">
                                <h4 className="detail-section-title"><FiFileText /> Service</h4>
                                <div className="order-gig-row">{selectedOrder.img && <img src={selectedOrder.img} alt="gig" className="order-gig-img" />}<div><p className="order-gig-title">{selectedOrder.gigId?.title || selectedOrder.title || "—"}</p><p className="order-gig-price">{formatCurrency(selectedOrder.price)}</p></div></div>
                            </div>
                            <div className="order-detail-people">
                                <div className="order-detail-section"><h4 className="detail-section-title"><FiUser /> Buyer</h4><div className="order-person-row"><img src={selectedOrder.buyerId?.img || "/img/noavatar.jpg"} alt="buyer" className="order-person-avatar" /><div><p className="order-person-name">{selectedOrder.buyerId?.username || "—"}</p><p className="order-person-email">{selectedOrder.buyerId?.email || "—"}</p><p className="order-person-country">{selectedOrder.buyerId?.country || ""}</p></div></div></div>
                                <div className="order-detail-section"><h4 className="detail-section-title"><FiShoppingBag /> Seller</h4><div className="order-person-row"><img src={selectedOrder.sellerId?.img || "/img/noavatar.jpg"} alt="seller" className="order-person-avatar" /><div><p className="order-person-name">{selectedOrder.sellerId?.username || "—"}</p><p className="order-person-email">{selectedOrder.sellerId?.email || "—"}</p><p className="order-person-country">{selectedOrder.sellerId?.country || ""}</p></div></div></div>
                            </div>
                            <div className="order-detail-section order-payment-row">
                                <div className="payment-item"><span className="payment-label">Payment Intent</span><span className="payment-value mono">{selectedOrder.payment_intent || "—"}</span></div>
                                <div className="payment-item"><span className="payment-label">Amount Paid</span><span className="payment-value payment-amount">{formatCurrency(selectedOrder.price)}</span></div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
                            <button className={selectedOrder.isCompleted ? "btn-warning" : "btn-primary"} onClick={() => { handleUpdateOrderStatus(selectedOrder._id, !selectedOrder.isCompleted); setSelectedOrder({ ...selectedOrder, isCompleted: !selectedOrder.isCompleted }); }}>
                                {selectedOrder.isCompleted ? <><FiCornerUpLeft /> Mark as Pending</> : <><FiCheck /> Mark as Completed</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;