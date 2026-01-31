# 🗺️ Google Maps Integration Troubleshooting Guide

## Quick Test
1. Open: http://localhost:8080/test-maps-page.html
2. Check if you see "✅ Google Maps API loaded successfully!"
3. Click the test buttons to verify functionality

## Common Issues & Solutions

### 1. Map Not Showing
**Symptoms:** Gray box instead of map, or loading spinner forever

**Solutions:**
- Check browser console for errors (F12 → Console)
- Verify API key is working: http://localhost:8080/test-maps-page.html
- Check internet connection
- Clear browser cache and refresh

### 2. Hotel Search Not Working
**Symptoms:** "No hotels found" or loading forever

**Solutions:**
- Ensure Places API is enabled for your API key
- Check browser console for API errors
- Try different locations (some areas have limited hotel data)
- Verify API key has Places API permissions

### 3. Markers Not Appearing
**Symptoms:** Map loads but no activity markers

**Solutions:**
- Check if activities have coordinate data
- Verify geocoding is working (test page)
- Check browser console for JavaScript errors

## API Key Verification
Current API Key: `AIzaSyC8zTjtFNz-aACgGDE4utlb1fMhBJO82dE`

Required APIs:
- ✅ Maps JavaScript API
- ✅ Places API  
- ✅ Geocoding API

## Debug Steps

### Step 1: Test Basic API
```
Open: http://localhost:8080/test-maps-page.html
Expected: Map loads with Paris view
```

### Step 2: Test Geocoding
```
Click "Test Geocoding" button
Expected: Map centers on Tokyo with marker
```

### Step 3: Test Places API
```
Click "Test Places API" button  
Expected: Finds hotels near map center
```

### Step 4: Test in VibeVoyage
```
1. Go to http://localhost:8080
2. Create a trip or go to existing itinerary
3. Click "Map" tab (mobile) or check desktop sidebar
4. Look for activity markers and "Show Hotels" button
```

## Browser Console Messages
**Good signs:**
- ✅ Google Maps API loaded successfully
- ✅ Map created successfully  
- ✅ Added X activity markers
- ✅ Found hotels: [hotel data]

**Bad signs:**
- ❌ Google Maps API failed to load
- ❌ Geocoding failed
- ❌ Places search failed
- ❌ Error initializing map

## Component Integration
The GoogleMap component is used in:
- `src/pages/Itinerary.tsx` (both mobile and desktop views)
- Receives props: activities, destination, budget, transportMode, dayNumber

## Files Modified
- `index.html` - Added Google Maps script with callback
- `src/components/GoogleMap.tsx` - Main map component
- `src/pages/Itinerary.tsx` - Integrated map component
- `src/pages/CreateTrip.tsx` - Added transport mode selection

## Features Implemented
✅ Interactive Google Maps
✅ Activity markers with info windows
✅ Geocoding for destinations
✅ Hotel search with ratings
✅ Budget-based hotel filtering
✅ Transport mode selection
✅ Mobile responsive design
✅ Loading states and error handling

## If Still Not Working
1. Check API key permissions in Google Cloud Console
2. Verify billing is enabled for the project
3. Check API quotas and usage limits
4. Try a different browser or incognito mode
5. Check network/firewall restrictions