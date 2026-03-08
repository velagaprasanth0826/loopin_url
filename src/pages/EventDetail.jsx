import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  fetchPublicEventData,
  extractCanonicalId,
  formatEventDateTime,
  formatPrice,
  getFirstName
} from "../services/eventService";
import "./EventDetail.css";

export default function EventDetail() {
  const { eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [seo, setSeo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const canonicalId = extractCanonicalId(eventSlug);
        const data = await fetchPublicEventData(canonicalId);
        setEvent(data.event);
        setSeo(data.seo);
        setError(null);
      } catch (err) {
        setError(err);
        setEvent(null);
        setSeo(null);
      } finally {
        setLoading(false);
      }
    };

    if (eventSlug) {
      loadEvent();
    }
  }, [eventSlug]);

  if (loading) {
    return (
      <div className="event-container">
        <div className="loading">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Event Not Found | Loopin</title>
          <meta name="description" content="The event you're looking for is not available." />
        </Helmet>
        <div className="event-container">
          <div className="error-page">
            <h1>Event Not Found</h1>
            <p>The event you're looking for doesn't exist or is not publicly available.</p>
            {error.error_code && <p className="error-code">Error: {error.error_code}</p>}
            <a href="/" className="btn-primary">
              Back to Home
            </a>
          </div>
        </div>
      </>
    );
  }

  if (!event || !seo) {
    return null;
  }

  // Generate JSON-LD Event schema for structured data
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    image: seo.image_url,
    startDate: event.start_time,
    endDate: event.end_time,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venue.address,
        addressLocality: event.venue.city,
        addressCountry: event.venue.country_code.toUpperCase()
      }
    },
    organizer: {
      "@type": "Person",
      name: event.host.full_name
    },
    offers: {
      "@type": "Offer",
      url: seo.canonical_url,
      price: event.is_paid ? event.ticket_price : 0,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString()
    }
  };

  const firstHostName = getFirstName(event.host.full_name);
  const formattedDateTime = formatEventDateTime(event.start_time);
  const priceDisplay = event.is_paid ? formatPrice(event.ticket_price) : "Free";

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{seo.title} | Loopin</title>
        <meta name="title" content={seo.title} />
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.canonical_url} />
        
        {/* OpenGraph / Facebook Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seo.canonical_url} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={seo.image_url} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:site_name" content="Loopin" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={seo.canonical_url} />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={seo.image_url} />

        {/* Additional Meta Tags */}
        <meta name="keywords" content={`event, ${event.interests.join(", ")}, ${seo.city}, loopin`} />
        <meta name="author" content={event.host.full_name} />

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">{JSON.stringify(eventJsonLd)}</script>
      </Helmet>

      <div className="event-container">
        <article className="event-detail">
          {/* Event Header with Image */}
          <div className="event-header">
            <img
              src={event.primary_image_url}
              alt={event.title}
              className="event-image"
              loading="lazy"
            />
            {event.interests && event.interests.length > 0 && (
              <div className="event-header-overlay">
                <span className="event-type">{event.interests[0]}</span>
              </div>
            )}
          </div>

          {/* Event Content */}
          <div className="event-content">
            <div className="event-main">
              {/* Title */}
              <h1 className="event-title">{event.title}</h1>

              {/* Date, Time, Location */}
              <div className="event-meta">
                <div className="meta-item">
                  <span className="icon">📅</span>
                  <span className="meta-text">{formattedDateTime}</span>
                </div>
                <div className="meta-item">
                  <span className="icon">📍</span>
                  <span className="meta-text">
                    {event.venue.name} • {event.venue.city}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="icon">💰</span>
                  <span className="meta-text">{priceDisplay}</span>
                </div>
              </div>

              {/* Interests/Categories */}
              {event.interests && event.interests.length > 0 && (
                <div className="event-interests">
                  {event.interests.map((interest) => (
                    <span key={interest} className="interest-tag">
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="event-description">
                  <h2>About This Event</h2>
                  <p>{event.description}</p>
                </div>
              )}

              {/* Venue Details */}
              {event.venue && (
                <div className="event-venue">
                  <h2>Venue</h2>
                  <div className="venue-details">
                    <p className="venue-name">{event.venue.name}</p>
                    {event.venue.address && <p className="venue-address">{event.venue.address}</p>}
                    {event.venue.city && <p className="venue-city">{event.venue.city}</p>}
                  </div>
                </div>
              )}

              {/* Hosted By */}
              {event.host && (
                <div className="event-host">
                  <h2>Hosted By</h2>
                  <div className="host-card">
                    <img
                      src={event.host.profile_picture_url}
                      alt={event.host.full_name}
                      className="host-avatar"
                      loading="lazy"
                    />
                    <div className="host-info">
                      <p className="host-name">{firstHostName}</p>
                      {event.host.username && <p className="host-username">@{event.host.username}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Share and Actions */}
            <aside className="event-sidebar">
              <div className="share-card">
                <h3>Share This Event</h3>
                <div className="share-url">
                  <input
                    type="text"
                    value={seo.canonical_url}
                    readOnly
                    className="share-input"
                  />
                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(seo.canonical_url);
                      alert("Link copied to clipboard!");
                    }}
                  >
                    Copy
                  </button>
                </div>

                <div className="share-buttons">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${seo.canonical_url}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn whatsapp"
                    aria-label="Share on WhatsApp"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(seo.canonical_url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn facebook"
                    aria-label="Share on Facebook"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(seo.canonical_url)}&text=${encodeURIComponent(seo.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn twitter"
                    aria-label="Share on Twitter"
                  >
                    Twitter
                  </a>
                </div>
              </div>

              {/* Price Card */}
              <div className="price-card">
                <div className="price-display">{priceDisplay}</div>
                <button className="btn-primary btn-register">
                  {event.is_paid ? "Get Tickets" : "Register"}
                </button>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </>
  );
}
