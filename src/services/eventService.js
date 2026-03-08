/**
 * Event API Service
 * Fetches public event data from the real API
 * Handles both full URLs and paths for images
 */

const API_BASE_URL = "https://app.loopinsocial.in";

/**
 * Convert image URL to full URL if needed
 * If string starts with http:// or https:// → use as-is
 * If it starts with / → prepend the API base URL
 * @param {string} imageUrl - Image URL or path
 * @returns {string} Full image URL
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  
  // Already a full URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  
  // Path only - prepend API base URL
  if (imageUrl.startsWith("/")) {
    return API_BASE_URL + imageUrl;
  }
  
  return imageUrl;
};

/**
 * Extract canonical ID from event slug
 * Extracts the part after -- in the slug
 * Example: "tech-meetup--a9x3k" → "a9x3k"
 * @param {string} eventSlug - Full event slug from URL
 * @returns {string} Canonical ID
 */
export const extractCanonicalId = (eventSlug) => {
  const parts = eventSlug.split("--");
  return parts[parts.length - 1];
};

/**
 * Fetch public event data from API
 * Endpoint: GET /api/events/public-share/{canonical_id}
 * @param {string} canonicalId - Event canonical ID (Base62)
 * @returns {Promise<Object>} Event data with share_url, event details, and SEO metadata
 * @throws {Error} If event not found or API error
 */
export const fetchPublicEventData = async (canonicalId) => {
  try {
    const url = `${API_BASE_URL}/api/events/public-share/${canonicalId}`;
    
    const response = await fetch(url);
    
    if (response.status === 404) {
      throw {
        success: false,
        error: `Event with canonical ID '${canonicalId}' not found or not publicly visible.`,
        error_code: "EVENT_NOT_FOUND",
        details: {}
      };
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert image URLs to full URLs
    if (data.event && data.event.primary_image_url) {
      data.event.primary_image_url = getFullImageUrl(data.event.primary_image_url);
    }
    
    if (data.event && data.event.host && data.event.host.profile_picture_url) {
      data.event.host.profile_picture_url = getFullImageUrl(data.event.host.profile_picture_url);
    }
    
    if (data.seo && data.seo.image_url) {
      data.seo.image_url = getFullImageUrl(data.seo.image_url);
    }
    
    return data;
  } catch (error) {
    console.error("Event fetch error:", error);
    throw error;
  }
};

/**
 * Format event date and time with weekday
 * Example: "2026-04-20T14:00:00Z" → "20 Apr 2026, 2:00 PM (Sun)"
 * @param {string} isoDateString - ISO format date string
 * @returns {string} Formatted date with weekday
 */
export const formatEventDateTime = (isoDateString) => {
  try {
    const date = new Date(isoDateString);
    
    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC"
    };
    
    const formatted = date.toLocaleDateString("en-IN", options);
    const weekday = date.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" });
    
    return `${formatted} (${weekday})`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return isoDateString;
  }
};

/**
 * Format price for display
 * @param {number} price - Price in currency units
 * @param {string} currency - Currency code (default: "INR")
 * @returns {string} Formatted price (e.g., "₹499")
 */
export const formatPrice = (price, currency = "INR") => {
  if (currency === "INR") {
    return `₹${Math.round(price)}`;
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2
  }).format(price);
};

/**
 * Extract first name from full name
 * @param {string} fullName - Full name
 * @returns {string} First name
 */
export const getFirstName = (fullName) => {
  if (!fullName) return "";
  return fullName.split(" ")[0];
};
