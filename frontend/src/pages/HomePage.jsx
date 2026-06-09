import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck2,
  CarFront,
  Check,
  CheckCircle2,
  Gauge,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Wallet,
  Wrench,
  Users,
  Shield,
  FileText,
  Warehouse,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import {
  adminService,
  bookingService,
  garageService,
  vehicleService,
} from "../api/services";
import luxuryHeroCar from "../luxury_hero_car.png";
import { useAuth } from "../context/AuthContext";
import LandingPage from "./LandingPage";

const fallbackVehicle = {
  make: "Range Rover",
  model: "Autobiography",
  registration_number: "NYJ 5543",
  year: "2023",
};

const trackerSteps = [
  { title: "Booking Confirmed", status: "Done", done: true, date: "04/09/2026" },
  { title: "Vehicle Drop-off", status: "Done", done: true, date: "04/10/2026" },
  { title: "Diagnosis & Inspection", status: "In Progress", active: true, date: "04/11/2026" },
  { title: "Service / Repair", status: "Pending", date: "04/12/2026" },
  { title: "Ready for Pickup", status: "Pending", date: "04/13/2026" },
];

const chartLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const fallbackExpenseData = [24, 36, 30, 58, 42, 50];
const fallbackMileageData = [80, 175, 165, 230, 246, 318];

const buildMonthlyExpenseData = (bookings) => {
  const values = Array(6).fill(0);

  bookings.forEach((booking) => {
    const rawDate = booking.scheduled_date || booking.createdAt;
    const date = rawDate ? new Date(rawDate) : null;
    const month = date && !Number.isNaN(date.getTime()) ? date.getMonth() : -1;

    if (month >= 0 && month < 6) {
      values[month] += Number(booking.actual_cost || booking.estimated_cost || 0);
    }
  });

  return values.some(Boolean) ? values : fallbackExpenseData;
};

const buildMileageData = (vehicles, bookings) => {
  if (!vehicles.length && !bookings.length) return fallbackMileageData;

  const vehicleBase = Math.max(vehicles.length, 1) * 55;
  return chartLabels.map((_, index) => vehicleBase + bookings.length * 18 + index * 38);
};

const Sparkline = ({ data, height = 54 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = height - ((value - min) / (max - min || 1)) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="mini-chart" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline points={points} />
    </svg>
  );
};

const AreaChart = ({ data, labels, valuePrefix = "" }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const chartHeight = 150;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = chartHeight - ((value - min) / (max - min || 1)) * 112 - 20;
    return { x, y, value };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const fillPoints = `0,${chartHeight} ${linePoints} 100,${chartHeight}`;

  return (
    <div className="chart-box">
      <svg viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none">
        <polygon points={fillPoints} />
        <polyline points={linePoints} />
        {points.map((point) => (
          <circle key={`${point.x}-${point.value}`} cx={point.x} cy={point.y} r="1.8" />
        ))}
      </svg>
      <div className="chart-labels">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <strong className="chart-value">
        {valuePrefix}
        {data[data.length - 1]}
      </strong>
    </div>
  );
};

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [garages, setGarages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState(null);
  const [dataStatus, setDataStatus] = useState("");
  const [myGarage, setMyGarage] = useState(null);
  const [garageBookings, setGarageBookings] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminGarages, setAdminGarages] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) {
    return <LandingPage />;
  }

  const fetchDashboardData = async () => {
    try {
      if (user.role === "garage") {
        const [myGarageRes, bookingsRes] = await Promise.all([
          garageService.getMyGarage(),
          bookingService.getGarageBookings()
        ]);
        setMyGarage(myGarageRes.data);
        setGarageBookings(bookingsRes.data);
        return;
      }

      if (user.role === "admin") {
        const [statsRes, usersRes, garagesRes, bookingsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(),
          adminService.getGarages(),
          adminService.getBookings()
        ]);
        setStats(statsRes.data);
        setAdminUsers(usersRes.data);
        setAdminGarages(garagesRes.data);
        setAdminBookings(bookingsRes.data);
        return;
      }

      const [garageRes, statsRes] = await Promise.allSettled([
        garageService.getAll(),
        adminService.getStats(),
      ]);

      if (garageRes.status === "fulfilled") {
        setGarages(garageRes.value.data);
      }

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }

      const [bookingRes, vehicleRes] = await Promise.allSettled([
        bookingService.getMyBookings(),
        vehicleService.getAll(),
      ]);

      if (bookingRes.status === "fulfilled") {
        setBookings(bookingRes.value.data);
      }

      if (vehicleRes.status === "fulfilled") {
        setVehicles(vehicleRes.value.data);
      }

      if (garageRes.status === "rejected") {
        setDataStatus(
          "Backend data is not reachable. Start backend on port 5000 to load live database records.",
        );
      }
    } catch {
      setDataStatus(
        "Backend data is not reachable. Start backend on port 5000 to load live database records.",
      );
    }
  };

  const hasRealVehicle = vehicles.length > 0 || !!bookings[0]?.vehicle_id;
  const vehicle = vehicles[0] || bookings[0]?.vehicle_id || fallbackVehicle;
  const activeBooking = bookings.find((booking) =>
    ["confirmed", "in_progress", "pending"].includes(booking.status),
  );
  const topGarage = garages[0];

  const dashboardStats = useMemo(
    () => ({
      activeBookings:
        stats?.bookings?.pending + (stats?.bookings?.confirmed || 0) ||
        bookings.filter((booking) =>
          ["pending", "confirmed", "in_progress"].includes(booking.status),
        ).length ||
        12,
      vehicleHealth: vehicles.length ? 96 : 98,
      serviceCost: activeBooking?.estimated_cost || activeBooking?.actual_cost || 3500,
      progress:
        activeBooking?.status === "completed" ? 100 :
          activeBooking?.status === "in_progress" ? 75 :
            activeBooking?.status === "confirmed" ? 40 :
              activeBooking?.status === "pending" ? 15 : 0,
      activeGarages: stats?.garages?.active ?? garages.length,
      completedBookings: stats?.bookings?.completed ?? 0,
      users: stats?.users?.total ?? 0,
    }),
    [activeBooking, bookings, garages.length, stats, vehicles.length],
  );

  const monthlyExpense = useMemo(
    () => buildMonthlyExpenseData(bookings),
    [bookings],
  );
  const mileageData = useMemo(
    () => buildMileageData(vehicles, bookings),
    [vehicles, bookings],
  );

  const dynamicTrackerSteps = useMemo(() => {
    if (!activeBooking) {
      return [
        { title: "Submit Booking", status: "Done", done: true, date: "Ready" },
        { title: "Awaiting Confirmation", status: "Pending", done: false, date: "-" },
        { title: "Undergoing Service", status: "Pending", done: false, date: "-" },
        { title: "Ready for Pickup", status: "Pending", done: false, date: "-" },
      ];
    }

    const status = activeBooking.status;
    const isPending = status === "pending";
    const isConfirmed = status === "confirmed";
    const isInProgress = status === "in_progress";
    const isCompleted = status === "completed";

    const dateStr = activeBooking.scheduled_date || new Date(activeBooking.createdAt).toLocaleDateString();

    return [
      {
        title: "Booking Submitted",
        status: "Completed",
        done: true,
        date: new Date(activeBooking.createdAt).toLocaleDateString(),
      },
      {
        title: "Confirmed by Garage",
        status: isPending ? "In Progress" : "Completed",
        done: !isPending,
        active: isPending,
        date: isPending ? "Pending review" : dateStr,
      },
      {
        title: "Service / Repair",
        status: isPending || isConfirmed ? "Pending" : isInProgress ? "In Progress" : "Completed",
        done: isCompleted,
        active: isInProgress,
        date: isInProgress ? "Active now" : isCompleted ? dateStr : "Scheduled",
      },
      {
        title: "Ready for Pickup",
        status: isCompleted ? "Completed" : "Pending",
        done: isCompleted,
        active: false,
        date: isCompleted ? dateStr : "Awaiting completion",
      },
    ];
  }, [activeBooking]);

  const kpis = [
    {
      label: "Active Bookings",
      value: dashboardStats.activeBookings,
      icon: CalendarCheck2,
      chart: [12, 16, 13, 20, 18, 24],
      note: "Live queue",
    },
    {
      label: "Vehicle Health Status",
      value: `${dashboardStats.vehicleHealth}%`,
      icon: ShieldCheck,
      chart: [72, 78, 85, 88, 94, dashboardStats.vehicleHealth],
      note: "Inspection score",
    },
    {
      label: "Est. Service Costs",
      value: `Rs. ${Number(dashboardStats.serviceCost).toLocaleString()}`,
      icon: Wallet,
      chart: [1800, 2200, 2100, 2450, 2300, dashboardStats.serviceCost],
      note: "Trend",
    },
    {
      label: "Verified Garages",
      value: dashboardStats.activeGarages,
      icon: Wrench,
      chart: [1, 2, 2, 3, 3, dashboardStats.activeGarages || 3],
      note: "Active centers",
    },
  ];

  // Calculate garage statistics
  const garageStats = useMemo(() => {
    return garageBookings.reduce(
      (acc, booking) => {
        const actual = Number(booking.actual_cost || 0);
        const estimated = Number(booking.estimated_cost || 0);
        const cost = actual || estimated;
        if (booking.status === "completed") {
          acc.completedRevenue += cost;
          acc.completed += 1;
        } else if (booking.status !== "cancelled") {
          acc.pipelineRevenue += cost;
          acc.active += 1;
        }
        return acc;
      },
      { completedRevenue: 0, pipelineRevenue: 0, completed: 0, active: 0 }
    );
  }, [garageBookings]);

  if (user?.role === "garage") {
    const garageName = myGarage?.name || "GARAGE WALA";
    const totalEarnings = garageStats.completedRevenue;
    const activeJobs = garageStats.active;

    return (
      <div className="page-content dashboard-page">
        <section className="dashboard-intro-card" style={{ background: "linear-gradient(135deg, #1e2229 0%, #bd8e4e 150%)" }}>
          <div>
            <span className="hero-badge">Garage Partner Portal</span>
            <h1>Welcome back to {garageName}</h1>
            <p>
              Manage incoming detailing bookings, track technician status, and review active client queues in real-time.
            </p>
            <div className="intro-actions">
              <button onClick={() => navigate("/garage/bookings")} className="primary-button">
                Manage Bookings
              </button>
              <button onClick={() => navigate("/garage/profile")} className="ghost-button">
                Update Profile
              </button>
            </div>
          </div>
          <div className="intro-visual">
            <div style={{ textAlign: "center", color: "#fff" }}>
              <strong style={{ fontSize: "2.4rem", display: "block", color: "var(--accent)" }}>{activeJobs}</strong>
              <span>active work orders</span>
            </div>
          </div>
        </section>

        <section className="kpi-grid">
          <article className="kpi-card">
            <div>
              <p>Completed Revenue</p>
              <strong>Rs. {totalEarnings.toLocaleString()}</strong>
              <span>Settled payments</span>
            </div>
            <div className="kpi-visual">
              <Wallet size={18} />
              <Sparkline data={[12000, 15000, 18000, 24000, 22000, totalEarnings || 25000]} />
            </div>
          </article>

          <article className="kpi-card">
            <div>
              <p>Active Work Queue</p>
              <strong>{activeJobs} Orders</strong>
              <span>Pending & In-Progress</span>
            </div>
            <div className="kpi-visual">
              <CalendarCheck2 size={18} />
              <Sparkline data={[2, 4, 3, 5, 4, activeJobs || 6]} />
            </div>
          </article>

          <article className="kpi-card">
            <div>
              <p>Completed Bookings</p>
              <strong>{garageStats.completed} Services</strong>
              <span>Total jobs delivered</span>
            </div>
            <div className="kpi-visual">
              <CheckCircle2 size={18} />
              <Sparkline data={[5, 8, 12, 14, 18, garageStats.completed || 20]} />
            </div>
          </article>

          <article className="kpi-card">
            <div>
              <p>Client Rating Score</p>
              <strong>{myGarage?.rating || "5.0"} Stars</strong>
              <span>Verified feedback</span>
            </div>
            <div className="kpi-visual">
              <Star size={18} fill="var(--accent-strong)" />
              <Sparkline data={[4.5, 4.7, 4.8, 4.9, 5.0, myGarage?.rating || 5.0]} />
            </div>
          </article>
        </section>

        <section className="dashboard-main-grid">
          <article className="service-tracker-card" style={{ gridColumn: "1 / -1" }}>
            <div className="card-title-row">
              <div>
                <h2>Active Workshop Queue</h2>
                <p>Real-time booking list for {garageName}</p>
              </div>
            </div>

            <div className="table-wrap" style={{ marginTop: "16px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Services Required</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {garageBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "var(--muted)" }}>
                        No bookings assigned to your workshop yet.
                      </td>
                    </tr>
                  ) : (
                    garageBookings.slice(0, 5).map((booking) => (
                      <tr key={booking._id}>
                        <td><strong>{booking.customer_id?.full_name}</strong></td>
                        <td>{booking.vehicle_id ? `${booking.vehicle_id.make} ${booking.vehicle_id.model}` : "Valet customer"}</td>
                        <td>{booking.service_type}</td>
                        <td>{booking.scheduled_date} at {booking.scheduled_time}</td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status.replace("_", " ")}
                          </span>
                        </td>
                        <td><strong>Rs. {(booking.actual_cost || booking.estimated_cost || 0).toLocaleString()}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    );
  }

  if (user?.role === "admin") {
    return (
      <div className="page-content dashboard-page">
        <section className="dashboard-intro-card" style={{ background: "linear-gradient(135deg, #1e2229 0%, #bd8e4e 150%)" }}>
          <div>
            <span className="hero-badge">Administration Portal</span>
            <h1>Welcome to the Command Console</h1>
            <p>
              Supervise registered customer profiles, verify partner garages, and audit all system-wide bookings in real-time.
            </p>
            <div className="intro-actions">
              <button onClick={() => navigate("/admin")} className="primary-button">
                Open Admin Panel
              </button>
            </div>
          </div>
          <div className="intro-visual">
            <div style={{ textAlign: "center", color: "#fff" }}>
              <strong style={{ fontSize: "2.4rem", display: "block", color: "var(--accent)" }}>{adminBookings.length}</strong>
              <span>total bookings processed</span>
            </div>
          </div>
        </section>

        <section className="kpi-grid">
          <article className="kpi-card">
            <div>
              <p>Active Clients</p>
              <strong>{stats?.users?.total || adminUsers.length} Users</strong>
              <span>Registered accounts</span>
            </div>
            <div className="kpi-visual">
              <Users size={18} />
              <Sparkline data={[10, 15, 20, 25, 30, stats?.users?.total || adminUsers.length || 35]} />
            </div>
          </article>

          <article className="kpi-card">
            <div>
              <p>Servicing Hubs</p>
              <strong>{stats?.garages?.active || adminGarages.filter(g => g.is_active).length} Active</strong>
              <span>{stats?.garages?.total || adminGarages.length} total hubs</span>
            </div>
            <div className="kpi-visual">
              <Warehouse size={18} />
              <Sparkline data={[2, 3, 4, 4, 5, stats?.garages?.total || adminGarages.length || 6]} />
            </div>
          </article>

          <article className="kpi-card">
            <div>
              <p>System Bookings</p>
              <strong>{adminBookings.length} Orders</strong>
              <span>All time records</span>
            </div>
            <div className="kpi-visual">
              <FileText size={18} />
              <Sparkline data={[20, 30, 45, 50, 58, adminBookings.length || 60]} />
            </div>
          </article>

          <article className="kpi-card">
            <div>
              <p>Platform Feedbacks</p>
              <strong>{stats?.feedbacks?.total || 0} Reviews</strong>
              <span>User satisfaction</span>
            </div>
            <div className="kpi-visual">
              <Star size={18} fill="var(--accent-strong)" />
              <Sparkline data={[5, 10, 12, 15, 18, stats?.feedbacks?.total || 20]} />
            </div>
          </article>
        </section>

        <section className="dashboard-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <article className="service-tracker-card" style={{ flex: 1 }}>
            <div className="card-title-row">
              <div>
                <h2>Recent System Bookings</h2>
                <p>Latest active work orders across all partner garages</p>
              </div>
              <button onClick={() => navigate("/admin")} className="ghost-button" style={{ padding: "6px 12px", minHeight: "auto" }}>
                View Bookings
              </button>
            </div>

            <div className="table-wrap" style={{ marginTop: "16px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Garage</th>
                    <th>Service Type</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--muted)" }}>
                        No system bookings recorded.
                      </td>
                    </tr>
                  ) : (
                    adminBookings.slice(0, 5).map((booking) => (
                      <tr key={booking._id}>
                        <td><strong>{booking.customer_id?.full_name || "Customer"}</strong></td>
                        <td>{booking.garage_id?.name || "Garage"}</td>
                        <td>{booking.service_type}</td>
                        <td>{booking.scheduled_date}</td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status?.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="service-tracker-card" style={{ flex: 1 }}>
            <div className="card-title-row">
              <div>
                <h2>Partner Garages Overview</h2>
                <p>Manage and monitor garage activation status</p>
              </div>
              <button onClick={() => navigate("/admin")} className="ghost-button" style={{ padding: "6px 12px", minHeight: "auto" }}>
                Verify Garages
              </button>
            </div>

            <div className="table-wrap" style={{ marginTop: "16px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Garage Name</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Security Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {adminGarages.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", color: "var(--muted)" }}>
                        No registered garages found.
                      </td>
                    </tr>
                  ) : (
                    adminGarages.slice(0, 5).map((g) => (
                      <tr key={g._id}>
                        <td><strong>{g.name}</strong></td>
                        <td>{g.city}</td>
                        <td>
                          <span className={`status-badge ${g.is_active ? "completed" : "cancelled"}`}>
                            {g.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={async () => {
                              try {
                                await adminService.toggleGarageStatus(g._id);
                                fetchDashboardData();
                              } catch {
                                alert("Failed to toggle garage status");
                              }
                            }}
                            style={{
                              background: g.is_active ? "rgba(153, 27, 27, 0.08)" : "rgba(61, 92, 75, 0.08)",
                              color: g.is_active ? "var(--danger)" : "var(--success)",
                              border: g.is_active ? "1px solid rgba(153, 27, 27, 0.15)" : "1px solid rgba(61, 92, 75, 0.15)",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "10.5px",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {g.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    );
  }

  return (
    <div className="page-content dashboard-page">
      <section className="dashboard-intro-card">
        <div>
          <span className="hero-badge">NEXT-GEN AUTOMOTIVE DASHBOARD</span>
          <h3>Real-time vehicle insights, seamless service booking, and expert care—all powered by smart technology.

            Designed to enhance performance, simplify maintenance, and deliver a premium, connected driving experience like never before.
          </h3>
          <div className="intro-actions">
            <a href="/garages" className="primary-button">
              Find Garages
            </a>
            <a href="/bookings" className="ghost-button">
              View Bookings
            </a>
          </div>
        </div>
        <div className="intro-visual">
          <img src={luxuryHeroCar} alt="Vehicle service preview" />
          <div>
            <strong>{dashboardStats.activeGarages}</strong>
            <span>trusted partner garages</span>
          </div>
        </div>
      </section>

      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">Dashboard Overview</span>
          <h1>
            {hasRealVehicle ? (
              `Service Status - ${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`
            ) : (
              "Service Status - Welcome to AutoCare Hub"
            )}
          </h1>
        </div>
        <div className="dashboard-search">
          <Search size={18} />
          <input placeholder="Search garages, vehicles, bookings..." />
        </div>
      </section>

      {dataStatus && <div className="soft-alert">{dataStatus}</div>}

      <section className="kpi-grid">
        {kpis.map(({ label, value, icon: Icon, chart, note }) => (
          <article className="kpi-card" key={label}>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
              <span>{note}</span>
            </div>
            <div className="kpi-visual">
              <Icon size={18} />
              <Sparkline data={chart} />
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-main-grid">
        <article className="service-tracker-card">
          <div className="card-title-row">
            <div>
              <h2>Active Vehicle Service Tracker</h2>
              <p>
                {activeBooking ? (
                  `${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.registration_number}`
                ) : (
                  "No active services at this time"
                )}
              </p>
            </div>
            {activeBooking && (
              <span className={`status-badge ${activeBooking.status}`}>
                {activeBooking.status?.replace("_", " ")}
              </span>
            )}
          </div>

          {!activeBooking ? (
            <div style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "3rem", marginBottom: "12px" }}>🚗</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>No Active Appointments</h3>
              <p style={{ color: "var(--muted)", maxWidth: "360px", marginBottom: "20px", fontSize: "13.5px" }}>
                Keep your vehicle in pristine condition. Discover nearby garages and book premium service and detailing appointments.
              </p>
              <button onClick={() => navigate("/garages")} className="primary-button" style={{ minHeight: "38px" }}>
                Find Partner Garages
              </button>
            </div>
          ) : (
            <>
              <div className="tracker-line">
                {dynamicTrackerSteps.map((step) => (
                  <div
                    className={`tracker-step ${step.done ? "done" : ""} ${step.active ? "active" : ""
                      }`}
                    key={step.title}
                  >
                    <span>
                      {step.done ? <Check size={16} /> : step.active ? <Gauge size={16} /> : <Wrench size={16} />}
                    </span>
                    <strong>{step.title}</strong>
                    <small>{step.status}</small>
                    <em>{step.date}</em>
                  </div>
                ))}
              </div>

              <div className="wide-progress">
                <span style={{ width: `${dashboardStats.progress}%` }} />
                <b>{dashboardStats.progress}%</b>
              </div>

              <div className="tracker-details">
                <div>
                  <h3>Service Details</h3>
                  <p>{activeBooking?.service_type || "Full Synthetic Oil Change"}</p>
                  <p>{activeBooking?.service_description || "Standard vehicle multi-point health check & servicing."}</p>
                </div>
                <div>
                  <h3>Garage Info</h3>
                  <p>{activeBooking?.garage_id?.name || topGarage?.name || "GARAGE WALA"}</p>
                  <p>
                    <MapPin size={14} /> {activeBooking?.garage_id?.area || topGarage?.area || "Location"},{" "}
                    {activeBooking?.garage_id?.city || topGarage?.city || "Karachi"}
                  </p>
                  <p>
                    <Star size={14} fill="var(--accent-strong)" />{" "}
                    {activeBooking?.garage_id?.rating || topGarage?.rating || "4.8"}
                  </p>
                </div>
              </div>
            </>
          )}
        </article>

        <div className="chart-column">
          <article className="analytics-card">
            <div className="card-title-row">
              <h2>Monthly Service Expenses</h2>
              <span className="gold-chip">Live Trend</span>
            </div>
            <AreaChart
              data={monthlyExpense}
              labels={chartLabels}
              valuePrefix="Rs. "
            />
          </article>

          <article className="analytics-card">
            <div className="card-title-row">
              <h2>Vehicle Mileage Tracking</h2>
              <span className="gold-chip">Updated</span>
            </div>
            <AreaChart
              data={mileageData}
              labels={chartLabels}
            />
          </article>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="vehicle-status-card">
          <div className="card-title-row">
            <h2>Vehicle Status</h2>
            <span className="round-check">
              <Check size={14} />
            </span>
          </div>
          <span className="field-label">State</span>
          <strong className="gold-chip">
            {activeBooking?.status === "pending" ? "AWAITING CONFIRMATION" :
              activeBooking?.status === "confirmed" ? "CONFIRMED & SCHEDULED" :
                activeBooking?.status === "in_progress" ? "IN WORKSHOP REPAIR" :
                  activeBooking?.status === "completed" ? "SERVICE COMPLETED" : "NO ACTIVE SERVICE"}
          </strong>
          <div className="progress-row">
            <div>
              <span style={{ width: `${dashboardStats.vehicleHealth}%` }} />
            </div>
            <b>{dashboardStats.vehicleHealth}%</b>
          </div>
          <p>{dashboardStats.vehicleHealth}% health score</p>
          <img src={luxuryHeroCar} alt="Luxury vehicle service preview" />
        </article>

        <article className="service-card">
          <h2>{activeBooking ? "Active Service" : "Latest Package Info"}</h2>
          <h3>{activeBooking?.service_type || "Premium Detailing & Diagnostics"}</h3>
          {activeBooking?.service_description ? (
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "8px", lineHeight: "1.5" }}>
              {activeBooking.service_description}
            </p>
          ) : (
            <ul>
              <li>Comprehensive Diagnostics</li>
              <li>Engine Health Check</li>
              <li>Fluid Replacements</li>
              <li>Road Test Verification</li>
            </ul>
          )}
          {activeBooking && (
            <p style={{ marginTop: "12px" }}>
              Scheduled: <strong>{activeBooking.scheduled_date} at {activeBooking.scheduled_time}</strong>
            </p>
          )}
          <hr />
          <h2>System Details</h2>
          <div className="vehicle-meta">
            <span>
              Users <b>{dashboardStats.users}</b>
            </span>
            <span>
              Garages <b>{dashboardStats.activeGarages}</b>
            </span>
            <span>
              Completed <b>{dashboardStats.completedBookings}</b>
            </span>
          </div>
        </article>

        <div className="side-stack">
          <article className="mini-card">
            <h2>Upcoming Appointments</h2>
            {bookings.filter(b => ["pending", "confirmed"].includes(b.status)).length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "12.5px", marginTop: "8px" }}>No upcoming appointments scheduled.</p>
            ) : (
              bookings.filter(b => ["pending", "confirmed"].includes(b.status)).slice(0, 2).map((booking) => {
                const dateObj = new Date(booking.scheduled_date);
                const displayMonth = !isNaN(dateObj.getTime()) ? dateObj.toLocaleString("en-US", { month: "short" }) : "Sep";
                const displayDay = !isNaN(dateObj.getTime()) ? dateObj.getDate() : "15";
                return (
                  <div className="appointment-row" key={booking._id}>
                    <span>
                      <small>{displayMonth}</small>
                      <b>{displayDay}</b>
                    </span>
                    <strong>{booking.service_type}</strong>
                  </div>
                );
              })
            )}
          </article>

          <article className="mini-card">
            <h2>Recent Activities</h2>
            <h3>Completed Services</h3>
            {bookings.filter(b => b.status === "completed").length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "12.5px", marginTop: "4px" }}>No completed jobs recorded yet.</p>
            ) : (
              bookings.filter(b => b.status === "completed").slice(0, 2).map((b) => (
                <p key={b._id} style={{ display: "flex", alignItems: "center", gap: "6px", margin: "6px 0", fontSize: "12.5px" }}>
                  <CheckCircle2 size={14} color="var(--success)" /> {b.service_type}
                </p>
              ))
            )}
            <p style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "8px", fontSize: "12px", color: "var(--muted)" }}>
              <CarFront size={14} /> {vehicles.length} vehicle profile{vehicles.length !== 1 ? "s" : ""} registered
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
