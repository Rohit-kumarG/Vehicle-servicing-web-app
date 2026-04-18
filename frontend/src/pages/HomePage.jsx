import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";
import { garages, services, stats } from "../data/mockData";

export default function HomePage() {
  return (
    <div className="page-content">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-badge">
            <Sparkles size={14} />
            Modern MERN-based service management
          </span>
          <h1>Book trusted garage services with a cleaner, smarter customer experience.</h1>
          <p>
            AutoCare Hub connects customers, garages, and administrators through one professional
            dashboard for vehicle registration, service booking, tracking, and feedback.
          </p>

          <div className="hero-actions">
            <a href="/bookings" className="primary-button">
              Book a Service
            </a>
            <a href="/garages" className="ghost-button">
              Explore Garages
            </a>
          </div>

          <div className="feature-points">
            <span>
              <CheckCircle2 size={16} />
              Real-time booking flow
            </span>
            <span>
              <CheckCircle2 size={16} />
              Role-based dashboards
            </span>
            <span>
              <CheckCircle2 size={16} />
              Feedback-driven quality
            </span>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-grid">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionTitle
          eyebrow="Service Modules"
          title="Everything your backend supports, presented in one cohesive frontend"
          description="The interface is designed around your API collections and controllers so the frontend feels complete and technically aligned."
        />

        <div className="card-grid three-column">
          {services.map((service) => (
            <article key={service.title} className="info-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button className="text-link">
                Learn more <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionTitle
          eyebrow="Verified Garages"
          title="Top-rated service partners"
          description="These showcase cards can later be replaced with live data from `/api/garages`."
        />

        <div className="card-grid three-column">
          {garages.map((garage) => (
            <article key={garage.id} className="garage-card">
              <div className="card-header-row">
                <h3>{garage.name}</h3>
                <span className="pill">{garage.rating} / 5</span>
              </div>
              <p>{garage.city}</p>
              <p>{garage.specialty}</p>
              <div className="card-footer-row">
                <span>{garage.availability}</span>
                <a href="/bookings" className="text-link">
                  Reserve slot
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
