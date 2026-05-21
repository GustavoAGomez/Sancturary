import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
// Importamos la librería para seleccionar imágenes
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// La imagen que me pasaste por defecto
const DEFAULT_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMPLkmXbBavHoZYAo7SA3xA-swe9Cfy-lTZg&s';

export default function ProfileScreen() {
    // Extraemos el perfil y la nueva función setProfile de nuestra Nube Global
    const { profile, setProfile } = useAuth();

    // 1. Obtenemos el objeto de navegación
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Estado para mostrar un circulito de carga *encima* de la foto mientras se sube a internet
    const [uploading, setUploading] = useState(false);

    // Determinar qué imagen mostrar
    const avatarToShow = profile?.avatar_url ? profile.avatar_url : DEFAULT_AVATAR;

    // --- LA LÓGICA CORE: SELECCIONAR Y SUBIR ---
    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true, // 2. NUEVO: Le pedimos a Expo que nos devuelva la imagen como texto plano
            });

            // Si el usuario cancela o por algún motivo no hay base64, cortamos aquí
            if (result.canceled || !result.assets[0].base64) {
                return;
            }

            setUploading(true);

            // Ya no usamos fetch() ni blob()
            const base64FileData = result.assets[0].base64;
            const fileName = `${profile?.id}/avatar.jpg`;

            // 3. NUEVO: Subimos la imagen usando decode() para transformarla de texto a binario puro
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, decode(base64FileData), {
                    upsert: true,
                    contentType: 'image/jpeg', // Le decimos explícitamente que es un JPG
                });

            if (uploadError) throw uploadError;

            // El resto del código sigue exactamente igual...
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            const publicUrl = data.publicUrl;

            // Un pequeño truco para evitar la caché del navegador de React Native:
            // Le añadimos un timestamp a la URL para que el móvil sepa que es una foto nueva y la refresque
            const urlWithTimestamp = `${publicUrl}?t=${new Date().getTime()}`;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: urlWithTimestamp })
                .eq('id', profile?.id);

            if (updateError) throw updateError;

            if (profile) {
                setProfile({ ...profile, avatar_url: urlWithTimestamp });
            }

            Alert.alert('¡Genial!', 'Tu foto de perfil ha sido actualizada.');

        } catch (error: any) {
            console.log('Error uploading image: ', error);
            Alert.alert('Error', 'No se pudo subir la imagen.');
        } finally {
            setUploading(false);
        }
    };

    // Función para cerrar sesión (la movemos aquí desde el Home para que tenga más sentido)
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mi Perfil</Text>
            </View>

            <View style={styles.content}>
                {/* ZONA DEL AVATAR */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={handleImagePick} disabled={uploading}>
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: avatarToShow }} style={styles.avatarImage} />

                            {/* Overlay oscuro y texto que indica que se puede editar */}
                            <View style={styles.editOverlay}>
                                <Ionicons name="camera" size={24} color="#fff" />
                            </View>

                            {/* Si está subiendo, tapamos la foto con un indicador de carga */}
                            {uploading && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color="#FF5A5F" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.userName}>{profile?.nombre} {profile?.apellidos}</Text>
                    <Text style={styles.userRole}>{profile?.es_anfitrion ? 'Modo Anfitrión' : 'Modo Viajero'}</Text>
                </View>

                {/* BOTÓN HAZTE ANFITRIÓN (Solo se muestra si no lo es ya) */}
                {!profile?.es_anfitrion && (
                    <TouchableOpacity
                        style={styles.hostButton}
                        onPress={() => navigation.navigate('BecomeHost')}
                    >

                        <Text style={styles.hostButtonText}>Hazte Anfitrión</Text>
                    </TouchableOpacity>
                )}

                {/* BOTÓN DE LOGOUT */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
    content: { flex: 1, padding: 20, alignItems: 'center' },

    // Estilos del Avatar
    avatarContainer: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
    imageWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden', // Asegura que todo lo de dentro respete el borde redondo
        position: 'relative',
        backgroundColor: '#f3f4f6',
        borderWidth: 3,
        borderColor: '#FF5A5F',
    },
    avatarImage: { width: '100%', height: '100%' },
    editOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // Fondo oscuro semitransparente
        paddingVertical: 5,
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject, // Ocupa todo el contenedor
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Estilos de Texto
    userName: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 15 },
    userRole: { fontSize: 16, color: '#6b7280', marginTop: 5 },

    hostButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 20,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    hostButtonText: { color: '#1f2937', fontWeight: 'bold', fontSize: 16 },

    // Estilos del Botón
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 'auto', // Empuja el botón hacia abajo
        marginBottom: 20,
        width: '100%',
        justifyContent: 'center',
    },
    logoutButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
});