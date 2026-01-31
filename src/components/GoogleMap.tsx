/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Loader2, ExternalLink } from 'lucide-react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
    googleMapsLoaded: boolean;
    initGoogleMaps: () => void;
  }
}

interface Activity {
  name: string;
  description: string;
  duration: number;
  estimatedCost: number;
  category: string;
  startTime: string;
  endTime: string;
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
  };
}

interface Hotel {
  name: string;
  rating: number;
  priceLevel: number;
  vicinity: string;
  placeId: string;
  photos?: string[];
}

interface GoogleMapProps {
  activities: Activity[];
  destination: string;
  budget: number;
  transportMode: string;
  dayNumber: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  activities, 
  destination, 
  budget, 
  transportMode, 
  dayNumber 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [showHotels, setShowHotels] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.googleMapsLoaded && window.google && window.google.maps) {
        console.log('✅ Google Maps API loaded');
        setMapLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) {
      return;
    }

    console.log('⏳ Waiting for Google Maps API to load...');
    
    // Wait for Google Maps to load
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    // Timeout after 15 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.error('❌ Google Maps API failed to load');
      setMapError('Google Maps failed to load. Please check your internet connection and refresh the page.');
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Initialize map when Google Maps is loaded
  const initializeMap = useCallback(async () => {
    try {
      console.log('🗺️ Initializing Google Maps...');
      
      // Default center (will be updated with geocoding)
      let center = { lat: 40.7128, lng: -74.0060 }; // New York default

      // Try to geocode the destination
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        
        try {
          const geocodeResult: any = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: destination }, (results: any, status: any) => {
              if (status === 'OK' && results && results[0]) {
                resolve(results[0]);
              } else {
                console.warn('Geocoding failed:', status);
                resolve(null);
              }
            });
          });

          if (geocodeResult) {
            center = {
              lat: geocodeResult.geometry.location.lat(),
              lng: geocodeResult.geometry.location.lng()
            };
            console.log('✅ Geocoded destination:', center);
          }
        } catch (error) {
          console.warn('Geocoding error:', error);
        }

        // Create the map
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: center,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        setMap(mapInstance);
        console.log('✅ Map created successfully');

        // Add markers for activities
        addActivityMarkers(mapInstance, center);
      }
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setMapError('Failed to initialize map. Please try again.');
    }
  }, [destination, activities]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || map) return;
    initializeMap();
  }, [mapLoaded, initializeMap, map]);

  const addActivityMarkers = (mapInstance: any, defaultCenter: any) => {
    if (!activities || activities.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    const markers: any[] = [];

    activities.forEach((activity, index) => {
      let position;

      // Use activity coordinates if available, otherwise use default center with offset
      if (activity.location?.coordinates) {
        position = new window.google.maps.LatLng(
          activity.location.coordinates.lat,
          activity.location.coordinates.lng
        );
      } else {
        // Create a slight offset from center for each activity
        const offset = 0.005;
        const angle = (index * 2 * Math.PI) / activities.length;
        position = new window.google.maps.LatLng(
          defaultCenter.lat + offset * Math.cos(angle),
          defaultCenter.lng + offset * Math.sin(angle)
        );
      }

      // Create marker
      const marker = new window.google.maps.Marker({
        position: position,
        map: mapInstance,
        title: activity.name,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: getActivityColor(activity.category),
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 280px; font-family: system-ui;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${activity.name}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; line-height: 1.4;">${activity.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px;">
              <span style="display: flex; align-items: center; gap: 4px;">
                <span>⏰</span>
                <span>${activity.startTime} - ${activity.endTime}</span>
              </span>
              <span style="display: flex; align-items: center; gap: 4px; font-weight: 600; color: #059669;">
                <span>💰</span>
                <span>$${activity.estimatedCost}</span>
              </span>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });

      markers.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers
    if (markers.length > 0) {
      mapInstance.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
        if (mapInstance.getZoom() > 16) mapInstance.setZoom(16);
        window.google.maps.event.removeListener(listener);
      });
    }

    console.log(`✅ Added ${markers.length} activity markers`);
  };

  const getActivityColor = (category: string) => {
    switch (category) {
      case 'food': return '#F97316'; // Orange
      case 'transport': return '#3B82F6'; // Blue
      case 'activity': return '#8B5CF6'; // Purple
      case 'sightseeing': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  const searchNearbyHotels = async () => {
    if (!map || !window.google) {
      console.error('Map or Google not available for hotel search');
      return;
    }

    setLoadingHotels(true);
    console.log('🏨 Searching for nearby hotels...');

    try {
      const service = new window.google.maps.places.PlacesService(map);
      const center = map.getCenter();

      const request = {
        location: center,
        radius: 5000, // 5km radius
        type: 'lodging',
        minPriceLevel: 0,
        maxPriceLevel: getBudgetPriceLevel(budget)
      };

      service.nearbySearch(request, (results: any, status: any) => {
        console.log('Hotel search status:', status);
        console.log('Hotel search results:', results);

        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const hotelData = results.slice(0, 6).map((place: any) => ({
            name: place.name || 'Unknown Hotel',
            rating: place.rating || 0,
            priceLevel: place.price_level || 1,
            vicinity: place.vicinity || 'Location not available',
            placeId: place.place_id || '',
            photos: place.photos ? [place.photos[0].getUrl({ maxWidth: 200 })] : []
          }));
          
          console.log('✅ Found hotels:', hotelData);
          setHotels(hotelData);
        } else {
          console.warn('No hotels found or search failed:', status);
          setHotels([]);
        }
        setLoadingHotels(false);
      });
    } catch (error) {
      console.error('❌ Error searching hotels:', error);
      setLoadingHotels(false);
    }
  };

  const getBudgetPriceLevel = (budget: number) => {
    if (budget < 500) return 1; // Budget
    if (budget < 1500) return 2; // Moderate  
    if (budget < 3000) return 3; // Expensive
    return 4; // Very Expensive
  };

  const getPriceLevelText = (level: number) => {
    switch (level) {
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return '$';
    }
  };

  if (mapError) {
    return (
      <Card className="rounded-2xl border-border/50 p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Map Loading Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{mapError}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Refresh Page
          </Button>
        </div>
      </Card>
    );
  }

  if (!mapLoaded) {
    return (
      <Card className="rounded-2xl border-border/50 p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Loading Google Maps</h3>
          <p className="text-sm text-muted-foreground">Please wait while we load the map...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="rounded-2xl overflow-hidden border-border/50">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Day {dayNumber} Route</h3>
            <p className="text-sm text-muted-foreground">
              {activities.length} activities • {transportMode === 'flight' ? '✈️ Flight routes' : '🚄 Train routes'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowHotels(!showHotels);
              if (!showHotels && hotels.length === 0) {
                searchNearbyHotels();
              }
            }}
            disabled={loadingHotels}
          >
            {loadingHotels ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            {showHotels ? 'Hide Hotels' : 'Show Hotels'}
          </Button>
        </div>
        
        <div 
          ref={mapRef} 
          className="w-full h-96 bg-gray-100"
          style={{ minHeight: '400px' }}
        />
      </Card>

      {/* Hotels Section */}
      {showHotels && (
        <Card className="rounded-2xl border-border/50">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground">Recommended Hotels</h3>
            <p className="text-sm text-muted-foreground">
              Within your budget • Near your activities
            </p>
          </div>
          
          {loadingHotels ? (
            <div className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Finding hotels...</p>
            </div>
          ) : hotels.length > 0 ? (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotels.map((hotel, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-foreground">{hotel.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {getPriceLevelText(hotel.priceLevel)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{hotel.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{hotel.vicinity}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      window.open(`https://www.google.com/maps/place/?q=place_id:${hotel.placeId}`, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Maps
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No hotels found in your area</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={searchNearbyHotels}
              >
                Try Again
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default GoogleMap;