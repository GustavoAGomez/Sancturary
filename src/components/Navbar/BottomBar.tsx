import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
// Importamos la librería de iconos de Expo
import { Ionicons } from '@expo/vector-icons';

export default function BottomBar() {
    return (
        <View style={styles.container}>
            {/* Botón de Buscar */}
            <TouchableOpacity style={styles.tab}>
                <Ionicons name="search" size={24} color="#FF5A5F" />
                <Text style={styles.tabText}>Buscar</Text>
            </TouchableOpacity>
        </View>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: {
        width: '100%', // <-- ¡MUY IMPORTANTE! Fuerza a la barra a ocupar toda la pantalla
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 10,
        // iOS necesita más espacio inferior por la barra de inicio del sistema
        paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontSize: 10,
        color: '#FF5A5F',
        marginTop: 4,
        fontWeight: '600',
    }
});