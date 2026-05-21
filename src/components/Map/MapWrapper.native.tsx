import React from 'react';
import { StyleSheet } from 'react-native';
// ¡Solo el móvil intentará leer esta librería!
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

interface MapWrapperProps {
    selectedLocation: { latitude: number; longitude: number } | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapWrapper({ selectedLocation, onLocationSelect }: MapWrapperProps) {
    const initialRegion = {
        latitude: 40.4168,
        longitude: -3.7038,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    const handlePress = (event: MapPressEvent) => {
        onLocationSelect(event.nativeEvent.coordinate.latitude, event.nativeEvent.coordinate.longitude);
    };

    return (
        <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={initialRegion}
            showsUserLocation={true}
            onPress={handlePress}
        >
            {selectedLocation && (
                <Marker
                    coordinate={selectedLocation}
                    title="Tu alojamiento"
                    pinColor="#FF5A5F"
                />
            )}
        </MapView>
    );
}