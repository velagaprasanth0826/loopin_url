
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import eventImage from "./assets/Event Picture (1).png";
import calendarIcon from "./assets/icons/Calendar.png";
import mapIcon from "./assets/icons/Point On Map.png";
import rupeeIcon from "./assets/icons/Rupee (INR).png";
import arrowIcon from "./assets/icons/Vector (Stroke).png";
import medalIcon from "./assets/icons/Medal Star.png";
import newEventIcon from "./assets/icons/New event.svg";

const API_BASE_URL = "https://app.loopinsocial.in";

// Convert image URL to full URL
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  // Rule 1: If starts with http:// or https:// → use as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  // Rule 2: If starts with / → prepend API base URL
  if (imageUrl.startsWith("/")) {
    return API_BASE_URL + imageUrl;
  }
  return imageUrl;
};

// Extract canonical ID from slug (part after --)
const extractCanonicalId = (slug) => {
  const parts = slug.split("--");
  return parts[parts.length - 1];
};

// Preload image to start download immediately
const preloadImage = (url) => {
  if (url) {
    const img = new Image();
    img.src = url;
  }
};

// Event Detail Page Component
function EventPage() {
  const { eventSlug } = useParams();
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState({ event: false, host: false });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const canonicalId = extractCanonicalId(eventSlug);
        console.log("Fetching:", canonicalId);
        
        const url = `/api/events/public-share/${canonicalId}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Response:", response.status);
        
        const data = await response.json();
        console.log("Data:", data);
        
        if (!response.ok) {
          throw new Error(data.detail || "Event not found");
        }
        
        // Log raw image URLs from API
        console.log("Raw primary_image_url:", data.event.primary_image_url);
        console.log("Raw profile_picture_url:", data.event.host.profile_picture_url);
        
        // Format data for display
        const eventImageUrl = getFullImageUrl(data.event.primary_image_url);
        const hostImageUrl = getFullImageUrl(data.event.host.profile_picture_url);
        
        console.log("Processed event image URL:", eventImageUrl);
        console.log("Processed host image URL:", hostImageUrl);
        
        const formatted = {
          title: data.event.title,
          category: data.event.interests?.length > 0 ? data.event.interests[0].charAt(0) + data.event.interests[0].slice(1).toLowerCase() : "Event",
          date: new Date(data.event.start_time).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }),
          venue: data.event.venue.name,
          price: data.event.is_paid ? data.event.ticket_price : "Free",
          hostName: data.event.host.full_name.split(" ")[0],
          about: data.event.description,
          image: eventImageUrl,
          hostImage: hostImageUrl
        };
        
        // Preload images to start download immediately
        preloadImage(eventImageUrl);
        preloadImage(hostImageUrl);
        
        setEventData(formatted);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      }
    };

    fetchEvent();
  }, [eventSlug]);

  // Use mock data as fallback during loading
  const displayData = eventData || {
    title: "Alist Drive",
    date: "Sat Dec 27, 8:00PM",
    venue: "Suzy Q, Bengaluru",
    price: "5,354",
    hostName: "Senan",
    about: "AHMEDABAD EYE OF DUNE 🌵 is a one day EDM festival 🎶 where multiple EDM genres will be performed by talented DJs 🎧 it's the ultimate place for Gen Z to come together and party in full energy ✨ inside Eye of Dune you'll experience the best of electronic music with amazing visuals and an unforgettable atmosphere."
  };

  if (error) {
    return (
      <div className="mobile-container">
        <div className="event-content">
          <h1>Error: {error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <div className="event-content">
        {/* Event Image with Category Badge */}
        <div className="image-container">
          <div className={`image-skeleton ${imagesLoaded.event ? 'loaded' : ''}`}></div>
          <img 
            src={displayData.image || eventImage} 
            alt="Event" 
            className="event-image" 
            onLoad={() => setImagesLoaded(prev => ({ ...prev, event: true }))}
          />
          <div className="category-badge">
            <img src={newEventIcon} alt="Category" className="category-icon" />
            <span className="category-name">{displayData.category}</span>
          </div>
        </div>
        
        {/* Blur Container */}
        <div className="blur-container">
          {/* Event Title */}
          <h1 className="event-title">{displayData.title}</h1>
          
          {/* Event Details */}
          <div className="event-details">
            <div className="detail-item">
              <img src={calendarIcon} alt="Calendar" className="detail-icon" />
              <span className="detail-text">{displayData.date}</span>
            </div>
            
            <div className="detail-item">
              <img src={mapIcon} alt="Location" className="detail-icon" />
              <span className="detail-text">{displayData.venue}</span>
            </div>
            
            <div className="detail-item">
              <img src={rupeeIcon} alt="Price" className="detail-icon" />
              <span className="detail-text">
                {displayData.price === "Free" ? "Free" : `₹${displayData.price}`}
              </span>
            </div>
          </div>
          
          {/* Join Experience Button */}
          <button className="join-button">
            <span>Join Experience</span>
            <img src={arrowIcon} alt="Arrow" className="arrow-icon" />
          </button>
          
          {/* Hosted By Section */}
          <div className="hosted-by">
            <div className={`image-skeleton-small ${imagesLoaded.host ? 'loaded' : ''}`}></div>
            <img 
              src={displayData.hostImage || medalIcon} 
              alt="Host" 
              className="host-icon" 
              onLoad={() => setImagesLoaded(prev => ({ ...prev, host: true }))}
            />
            <div className="host-info">
              <span className="host-label">Hosted by</span>
              <span className="host-name">{displayData.hostName}</span>
            </div>
          </div>
          
          {/* About Event Section */}
          <div className="about-section">
            <h2 className="about-title">About event</h2>
            <p className="about-text">{displayData.about}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Event Share Route */}
        <Route path="/in/:city_slug/events/:eventSlug" element={<EventPage />} />
        <Route path="/events/:eventSlug" element={<EventPage />} />
      </Routes>
    </Router>
  );
}

export default App;
