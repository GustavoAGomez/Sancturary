import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

export default function BecomeHostScreen({ navigation }: any) {
    const { profile } = useAuth();
    const [descripcion, setDescripcion] = useState('');
    const [guardando, setGuardando] = useState(false);

    const handleSiguiente = async () => {
        if (descripcion.trim().length < 10) {
            Alert.alert('Demasiado corto', 'Por favor, escribe al menos 10 caracteres.');
            return;
        }

        setGuardando(true);

        try {
            let propiedadActualId = ''; // Variable para guardar el ID

            const { data: borradorExistente, error: busquedaError } = await supabase
                .from('propiedades')
                .select('id')
                .eq('anfitrion_id', profile?.id)
                .eq('estado', 'borrador')
                .maybeSingle();

            if (busquedaError) throw busquedaError;

            if (borradorExistente) {
                // ACTUALIZAMOS
                const { error: updateError } = await supabase
                    .from('propiedades')
                    .update({ descripcion: descripcion })
                    .eq('id', borradorExistente.id);

                if (updateError) throw updateError;
                propiedadActualId = borradorExistente.id; // Guardamos el ID

            } else {
                // CREAMOS NUEVO (Añadimos .select().single() para que la base de datos nos devuelva el ID recién creado)
                const { data: nuevaPropiedad, error: insertError } = await supabase
                    .from('propiedades')
                    .insert([
                        { anfitrion_id: profile?.id, descripcion: descripcion, estado: 'borrador' }
                    ])
                    .select('id')
                    .single(); // <-- CLAVE: Exigimos que nos devuelva el ID

                if (insertError) throw insertError;
                propiedadActualId = nuevaPropiedad.id; // Guardamos el ID
            }

            // 👈 NUEVO: Viajamos al mapa PASÁNDOLE EL ID EN LA MALETA
            navigation.navigate('MapScreen', { propiedadId: propiedadActualId });

        } catch (error: any) {
            console.log('Error gestionando propiedad:', error);
            Alert.alert('Error', 'No se pudo guardar la descripción.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        // 1. KeyboardAvoidingView empujará el contenido hacia arriba. 
        // Le damos un offset para compensar la barra de navegación superior.
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* 2. TouchableWithoutFeedback detecta si tocamos fuera del TextInput */}
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>

                {/* Este View interno es obligatorio porque TouchableWithoutFeedback solo acepta un hijo */}
                <View style={styles.innerContainer}>

                    <View style={styles.content}>
                        <Text style={styles.title}>Define tu espacio</Text>
                        <Text style={styles.subtitle}>
                            Escribe una breve descripción de lo que hace a tu baño especial.
                            No te preocupes, podrás cambiarlo más adelante.
                        </Text>

                        <TextInput
                            style={styles.textArea}
                            placeholder="Ej: Un baño amplio y luminoso, con una gran bañera, secador y toallas limpias."
                            multiline={true}
                            numberOfLines={6}
                            value={descripcion}
                            onChangeText={setDescripcion}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* 3. El Footer ahora será empujado hacia arriba y se quedará flotando SOBRE el teclado */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, descripcion.length < 10 && styles.buttonDisabled]}
                            onPress={handleSiguiente}
                            disabled={guardando || descripcion.length < 10}
                        >
                            {guardando ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Siguiente</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    innerContainer: { flex: 1 }, // 👈 AÑADE ESTO: Es vital para que el layout no se rompa
    content: { flex: 1, padding: 20 },
    // ... resto de tus estilos
    title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 30, lineHeight: 24 },
    textArea: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        height: 150, // Altura fija para la caja de texto
    },

    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        backgroundColor: '#fff',
    },
    button: { backgroundColor: '#222222', padding: 18, borderRadius: 12, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#9CA3AF' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});