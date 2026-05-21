import { FC } from 'react';

export interface MapWrapperProps {
    selectedLocation: { latitude: number; longitude: number } | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

declare const MapWrapper: FC<MapWrapperProps>;

export default MapWrapper;
