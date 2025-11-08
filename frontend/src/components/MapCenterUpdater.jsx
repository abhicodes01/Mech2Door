// MapCenterUpdater.js
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

function MapCenterUpdater({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default MapCenterUpdater;
