import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
// Importamos los hooks de navegación para poder abrir la maleta
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import MapWrapper from '../components/Map/MapWrapper';


// Definimos el tipo de la maleta que recibimos
type MapScreenRouteProp = RouteProp<RootStackParamList, 'MapScreen'>;

export default function MapScreen({ navigation }: any) {
    // 1. ABRIMOS LA MALETA: Extraemos el ID de la propiedad
    const route = useRoute<MapScreenRouteProp>();
    const { propiedadId } = route.params;

    // 2. ESTADOS
    // selectedLocation empieza en 'null' (nada seleccionado)
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [guardando, setGuardando] = useState(false);

    // 3. EVENTO: Cuando el usuario toca el mapa
    const handleLocationSelect = (lat: number, lng: number) => {
        // Guardamos la latitud y longitud exacta del punto tocado en el estado
        setSelectedLocation({ latitude: lat, longitude: lng });
    };

    // 4. EVENTO: Guardar en Base de Datos
    const handleConfirmLocation = async () => {
        if (!selectedLocation) return; // Si por algún bug entra aquí sin coordenadas, abortamos

        setGuardando(true);

        try {
            // Hacemos el UPDATE en Supabase usando el ID que nos pasaron
            const { error } = await supabase
                .from('propiedades')
                .update({
                    latitud: selectedLocation.latitude,
                    longitud: selectedLocation.longitude,
                })
                .eq('id', propiedadId); // El ID de la maleta

            if (error) throw error;

            Alert.alert('¡Ubicación guardada!', 'Las coordenadas se han registrado con éxito.');
            // En el futuro, aquí navegaremos a "Añadir Precio" o "Añadir Fotos"

        } catch (error) {
            console.log('Error guardando coordenadas:', error);
            Alert.alert('Error', 'No se pudo guardar la ubicación.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <View style={styles.container}>

            {/* 👈 NUEVO: Usamos el componente inteligente. Le pasamos el estado y la función */}
            <MapWrapper
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
            />

            <SafeAreaView style={styles.backButtonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#1f2937" />
                </TouchableOpacity>
            </SafeAreaView>

            <View style={styles.bottomPanel}>
                <Text style={styles.panelTitle}>¿Dónde está tu espacio?</Text>
                <Text style={styles.panelSubtitle}>Toca el mapa para colocar un pin en la ubicación exacta.</Text>

                <TouchableOpacity
                    style={[styles.nextButton, !selectedLocation && styles.disabledButton]}
                    onPress={handleConfirmLocation}
                    disabled={!selectedLocation || guardando}
                >
                    {guardando ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.nextButtonText}>Confirmar ubicación</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    map: { ...StyleSheet.absoluteFillObject },
    backButtonContainer: { position: 'absolute', top: 10, left: 10, zIndex: 10 },
    backButton: {
        backgroundColor: '#fff', width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
    },
    bottomPanel: {
        position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff',
        padding: 24, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 10,
    },
    panelTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
    panelSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
    nextButton: { backgroundColor: '#222222', padding: 18, borderRadius: 12, alignItems: 'center' },
    disabledButton: { backgroundColor: '#E5E7EB' }, // Color gris para indicar que está desactivado
    nextButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});