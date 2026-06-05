import { useEffect, useMemo, useState } from "react";
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
  const [garages, setGarages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState(null);
  const [dataStatus, setDataStatus] = useState("");

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
      serviceCost: activeBooking?.estimated_cost || activeBooking?.actual_cost || 245.5,
      progress:
        activeBooking?.status === "completed" ? 100 : activeBooking ? 65 : 60,
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
      value: `$${Number(dashboardStats.serviceCost).toFixed(2)}`,
      icon: Wallet,
      chart: [180, 220, 210, 245, 230, dashboardStats.serviceCost],
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

  return (
    <div className="page-content dashboard-page">
      <section className="dashboard-intro-card">
        <div>
          <span className="hero-badge">MERN Stack Final Year Project</span>
          <h1>Book trusted garage services with a smarter experience.</h1>
          <p>
            AutoCare Hub brings garage discovery, booking, vehicle tracking, and
            feedback into one professional service dashboard.
          </p>
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
            Service Status - {vehicle.make} {vehicle.model} (
            {vehicle.registration_number})
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
                {vehicle.make} {vehicle.model} ({vehicle.year}) -{" "}
                {vehicle.registration_number}
              </p>
            </div>
            <span className="status-badge in_progress">
              {activeBooking?.status?.replace("_", " ") || "In Progress"}
            </span>
          </div>

          <div className="tracker-line">
            {trackerSteps.map((step) => (
              <div
                className={`tracker-step ${step.done ? "done" : ""} ${
                  step.active ? "active" : ""
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
              <p>Brake Inspection</p>
              <p>Tire Rotation</p>
            </div>
            <div>
              <h3>Garage Info</h3>
              <p>{topGarage?.name || "The Workshop"}</p>
              <p>
                <MapPin size={14} /> {topGarage?.area || "Location"},{" "}
                {topGarage?.city || "Karachi"}
              </p>
              <p>
                <Star size={14} fill="var(--accent-strong)" />{" "}
                {topGarage?.rating || "4.8"}
              </p>
            </div>
          </div>
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
              valuePrefix="$"
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
          <strong className="gold-chip">READY FOR FINISHING</strong>
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
          <h2>Active Service</h2>
          <h3>{activeBooking?.service_type || "Ultimate Luxury Detailing Package"}</h3>
          <ul>
            <li>Full Wash</li>
            <li>Paint Correction</li>
            <li>Ceramic Coating</li>
            <li>Interior</li>
          </ul>
          <p>
            Duration: <strong>5h 30m</strong>
          </p>
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
            {(bookings.length
              ? bookings.slice(0, 2)
              : [{ service_type: "Oil Service" }, { service_type: "Winter Tire Swap" }]
            ).map((booking, index) => (
              <div className="appointment-row" key={booking._id || booking.service_type}>
                <span>
                  <small>{index === 0 ? "Sep" : "Oct"}</small>
                  <b>{index === 0 ? "15" : "10"}</b>
                </span>
                <strong>{booking.service_type}</strong>
              </div>
            ))}
          </article>

          <article className="mini-card">
            <h2>Recent Activities</h2>
            <h3>Completed</h3>
            <p>
              <CheckCircle2 size={14} /> Engine Cleaning
            </p>
            <p>
              <CheckCircle2 size={14} /> Tyre Shine
            </p>
            <p>
              <CarFront size={14} /> {vehicles.length || 1} vehicle profile
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
