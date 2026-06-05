import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import luxuryHeroCar from "../luxury_hero_car.png";

export default function LandingPage() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-nav-header">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <ShieldCheck size={28} className="brand-icon" />
            <span>
              <strong>ELITE AUTOCARE</strong>
              <small>HUB</small>
            </span>
          </div>
          <nav className="landing-desktop-nav">
            <button onClick={() => scrollToSection("about")} className="nav-link-btn">About</button>
            <button onClick={() => scrollToSection("features")} className="nav-link-btn">Features</button>
            <button onClick={() => scrollToSection("benefits")} className="nav-link-btn">Benefits</button>
            <button onClick={() => scrollToSection("how-it-works")} className="nav-link-btn">How It Works</button>
          </nav>
          <div className="landing-auth-buttons">
            <Link to="/login" className="ghost-button landing-login-btn">
              Sign In
            </Link>
            <Link to="/register" className="primary-button landing-register-btn">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" id="hero">
        <div className="landing-hero-content">
          <span className="hero-badge">Smart Vehicle Servicing System</span>
          <h1>Experience Smarter Vehicle Maintenance & Tracking</h1>
          <p className="hero-lead">
            AutoCare Hub connects you with vetted, certified local garages. Check prices,
            schedule service, and track your vehicle's maintenance status in real-time.
          </p>
          <div className="hero-cta-group">
            <Link to="/register" className="primary-button cta-primary">
              Get Started Now <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="secondary-button cta-secondary">
              Access Account
            </Link>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="visual-wrapper">
            <img src={luxuryHeroCar} alt="Premium Luxury Car" className="hero-car-image" />
            <div className="floating-badge badge-1">
              <CheckCircle2 size={16} />
              <span>Vetted Mechanics</span>
            </div>
            <div className="floating-badge badge-2">
              <Activity size={16} />
              <span>Live Progress Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="landing-about" id="about">
        <div className="section-header">
          <span className="eyebrow">About the System</span>
          <h2>Redefining Auto Care Transparency</h2>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <h3>What is AutoCare Hub?</h3>
            <p>
              AutoCare Hub is a state-of-the-art vehicle service management ecosystem.
              We bridge the gap between discerning vehicle owners and top-tier service garages, 
              offering a centralized platform to manage appointments, keep logs, and review service standards.
            </p>
          </div>
          <div className="about-card">
            <h3>What Problem It Solves</h3>
            <p>
              Traditional vehicle maintenance is plagued by scheduling delays, opaque pricing, 
              and lack of information about repair status. AutoCare Hub eliminates these worries
              by introducing structured status tracking, pre-estimated costs, and transparent reviews.
            </p>
          </div>
          <div className="about-card">
            <h3>Why It Was Created</h3>
            <p>
              Built as a comprehensive final year project, AutoCare Hub aims to digitize
              and standardize the automotive repair industry. We empower users with absolute clarity, 
              allowing drivers to stay safe on the road while keeping automotive expenses predictable.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <div className="section-header">
          <span className="eyebrow">Core Capabilities</span>
          <h2>Designed for Seamless Operations</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Compass size={24} />
            </div>
            <h3>Garage Directory</h3>
            <p>Browse verified garages, view their specialties, operational hours, rating histories, and location maps.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <CalendarDays size={24} />
            </div>
            <h3>Instant Scheduling</h3>
            <p>Book maintenance packages, detailing services, or inspection appointments online with just a few clicks.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Activity size={24} />
            </div>
            <h3>Live Status Tracker</h3>
            <p>Track your vehicle's progress step-by-step from drop-off, diagnostic assessment, repair, to final cleanup.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <TrendingUp size={24} />
            </div>
            <h3>Expense Analytics</h3>
            <p>Monitor your annual maintenance expenses, fuel trackers, and vehicle health metrics on a unified dashboard.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="landing-benefits" id="benefits">
        <div className="section-header">
          <span className="eyebrow">System Benefits</span>
          <h2>Creating Value Across the Board</h2>
        </div>
        <div className="benefits-columns">
          <div className="benefits-col">
            <div className="benefits-header">
              <Users size={32} className="col-icon" />
              <h3>For Society & Drivers</h3>
            </div>
            <ul className="benefits-list">
              <li>
                <strong>Enhanced Road Safety:</strong> Periodic maintenance reminders ensure vehicles run under optimal safety conditions.
              </li>
              <li>
                <strong>Peace of Mind:</strong> Real-time progress updates reduce anxiety regarding vehicle status and drop-off duration.
              </li>
              <li>
                <strong>Time Efficiency:</strong> Avoid waiting in queues. Book in advance and visit only when the garage is ready.
              </li>
            </ul>
          </div>

          <div className="benefits-col">
            <div className="benefits-header">
              <TrendingUp size={32} className="col-icon" />
              <h3>For the Economy & Garages</h3>
            </div>
            <ul className="benefits-list">
              <li>
                <strong>Operational Efficiency:</strong> Vetted booking systems help garages schedule labor efficiently and avoid idle hours.
              </li>
              <li>
                <strong>Business Growth:</strong> Highly rated garages stand out, gaining exposure and traffic without expensive marketing.
              </li>
              <li>
                <strong>Cost Prevention:</strong> Routine diagnostics catch minor faults before they escalate into catastrophic mechanical failures.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-how" id="how-it-works">
        <div className="section-header">
          <span className="eyebrow">Simple Process</span>
          <h2>How It Works</h2>
        </div>
        <div className="how-steps-timeline">
          <div className="how-step">
            <span className="step-number">01</span>
            <h3>Explore & Pick</h3>
            <p>Search for vetted auto-centers by rating, specialty, or distance and view transparent service pricing.</p>
          </div>
          <div className="how-step">
            <span className="step-number">02</span>
            <h3>Book & Monitor</h3>
            <p>Schedule your vehicle's service online and watch its status advance through our step-by-step tracker.</p>
          </div>
          <div className="how-step">
            <span className="step-number">03</span>
            <h3>Collect & Rate</h3>
            <p>Receive a notification when your vehicle is ready for pickup, settle the invoice, and leave feedback.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="landing-cta">
        <div className="cta-container">
          <h2>Ready to Experience Smarter Car Care?</h2>
          <p>Create your free account today and discover trusted service centers with live status tracking.</p>
          <div className="cta-action-row">
            <Link to="/register" className="primary-button cta-btn">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand-column">
            <div className="landing-brand">
              <ShieldCheck size={24} className="brand-icon" />
              <span>
                <strong>ELITE AUTOCARE</strong>
                <small>HUB</small>
              </span>
            </div>
            <p>Connecting vehicle owners with elite local service technicians.</p>
          </div>
          <div className="footer-links-column">
            <h4>Support & Contact</h4>
            <div className="footer-contact-item">
              <PhoneCall size={16} />
              <span>+1 (555) 234-5678</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} />
              <span>support@eliteautocare.com</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={16} />
              <span>123 Elite Auto Lane, Suite 100</span>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} Elite AutoCare Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
