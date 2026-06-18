import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarCheck2, MapPin, Phone, Star, Wrench } from "lucide-react";
import { feedbackService, garageService } from "../api/services";

const hasCoords = (lat, lon) =>
  Number.isFinite(Number(lat)) && Number.isFinite(Number(lon));

const distanceKm = (aLat, aLon, bLat, bLon) => {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Number((R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(1));
};

export default function GarageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garage, setGarage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGarage();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }),
        () => setUserLocation(null),
        { timeout: 8000, maximumAge: 60000 },
      );
    }
  }, [id]);

  const fetchGarage = async () => {
    try {
      const [garageRes, reviewRes] = await Promise.all([
        garageService.getById(id),
        feedbackService.getGarageReviews(id),
      ]);
      setGarage(garageRes.data);
      setReviews(reviewRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Garage details not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-content">Loading garage details...</div>;

  if (!garage) {
    return (
      <div className="page-content">
        <div className="empty-state-card">
          <Wrench size={44} />
          <h2>Garage unavailable</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={() => navigate("/garages")}>
            Back to Garages
          </button>
        </div>
      </div>
    );
  }

  const canShowMap = hasCoords(garage.latitude, garage.longitude);
  const distance =
    canShowMap && userLocation
      ? distanceKm(
          userLocation.lat,
          userLocation.lon,
          Number(garage.latitude),
          Number(garage.longitude),
        )
      : null;

  return (
    <div className="page-content">
      <section className="garage-detail-hero">
        <div>
          <span className="eyebrow">Garage Partner</span>
          <h1>{garage.name}</h1>
          <p>{garage.description || "Verified vehicle service partner."}</p>
          <div className="detail-meta-row">
            <span>
              <MapPin size={15} /> {garage.area}, {garage.city}
            </span>
            <span>
              <Phone size={15} /> {garage.phone}
            </span>
            <span>
              <Star size={15} fill="var(--accent-strong)" /> {garage.rating || 0}
            </span>
            {distance !== null && <span>{distance} km away</span>}
          </div>
        </div>
        <button className="primary-button" onClick={() => navigate(`/bookings?garage=${garage._id}`)}>
          <CalendarCheck2 size={16} /> Book Now
        </button>
      </section>

      <section className="garage-detail-grid">
        <article className="service-tracker-card">
          <h2>Services Offered</h2>
          <div className="badge-group">
            {(garage.services_offered?.length ? garage.services_offered : ["Oil Change", "Diagnostics", "Repair"]).map(
              (service) => (
                <span className="tag-badge" key={service}>
                  {service}
                </span>
              ),
            )}
          </div>
          <hr />
          <h2>Garage Information</h2>
          <p>{garage.address}</p>
          <p>Bookings completed: {garage.total_bookings || 0}</p>
          <p>Average wait time: {garage.average_wait_time || 0} mins</p>

        </article>

        <article className="analytics-card">
          <h2>Map View</h2>
          {canShowMap ? (
            <iframe
              title={`${garage.name} map`}
              className="garage-map-frame"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(garage.longitude) - 0.02}%2C${Number(garage.latitude) - 0.02}%2C${Number(garage.longitude) + 0.02}%2C${Number(garage.latitude) + 0.02}&layer=mapnik&marker=${garage.latitude}%2C${garage.longitude}`}
            />
          ) : (
            <div className="empty-map-state">Location coordinates are not saved for this garage.</div>
          )}
        </article>
      </section>

      <section className="analytics-card">
        <h2>Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="review-list">
            {reviews.map((review) => (
              <div className="review-row" key={review._id}>
                <strong>{review.customer_id?.full_name || "Customer"}</strong>
                <span>{review.rating}/5</span>
                <p>{review.comment || "No comment provided."}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
