import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Definimos qué datos necesita nuestro mapa, sin importar la plataforma
interface MapWrapperProps {
    selectedLocation: { latitude: number; longitude: number } | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapWrapper({ selectedLocation, onLocationSelect }: MapWrapperProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>🗺️ Mapa (Versión Web)</Text>
            <Text style={styles.subtitle}>En el móvil verás Google Maps nativo aquí.</Text>

            {/* Simulamos un clic en el centro de Madrid para poder seguir probando la app en la web */}
            <View style={styles.mockButton}>
                <Text
                    style={styles.mockText}
                    onPress={() => onLocationSelect(40.4168, -3.7038)}
                >
                    Haz clic aquí para simular que tocas Madrid
                </Text>
            </View>

            {selectedLocation && (
                <Text style={styles.success}>¡Ubicación simulada seleccionada!</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
    subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
    mockButton: { backgroundColor: '#FF5A5F', padding: 15, borderRadius: 10 },
    mockText: { color: 'white', fontWeight: 'bold' },
    success: { marginTop: 20, color: '#059669', fontWeight: 'bold' }
});