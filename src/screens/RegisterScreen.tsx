import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
// Importamos nuestro cliente de Supabase
import { supabase } from '../services/supabase';

interface RegisterProps {
    onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterProps) {
    // 1. Estados para guardar lo que escribe el usuario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');

    // Estado para mostrar un "Cargando..." mientras esperamos al servidor
    const [loading, setLoading] = useState(false);

    // 2. La función que se ejecuta al pulsar el botón
    const handleRegister = async () => {
        // --- LA ADUANA (Validación Frontend) ---
        if (!email || !password || !nombre) {
            Alert.alert('Error', 'El email, la contraseña y el nombre son obligatorios.');
            return; // Cortamos la ejecución aquí, no llamamos al servidor
        }

        setLoading(true);

        try {
            // --- LA LLAMADA AL BACKEND ---
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        nombre: nombre,
                        apellidos: apellidos, // Si está vacío, no pasa nada, en BD no es NOT NULL
                    }
                }
            });

            if (error) {
                // Si Supabase nos devuelve un error (ej: el correo ya existe)
                Alert.alert('Error de registro', error.message);
            } else {
                // ¡ÉXITO!
                Alert.alert(
                    '¡Registro Exitoso!',
                    'Revisa tu base de datos para ver la magia. Ahora podrías navegar a la app.'
                );
                // Aquí en el futuro meteremos el código para navegar al árbol privado
            }
        } catch (error) {
            Alert.alert('Error inesperado', 'Ha ocurrido un problema de conexión.');
        } finally {
            setLoading(false);
        }
    };

    // 3. La Interfaz Visual (UI)
    return (
        // KeyboardAvoidingView evita que el teclado del móvil tape los inputs
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>Crear Cuenta</Text>
                <Text style={styles.subtitle}>Únete a nuestra APP</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nombre *"
                    value={nombre}
                    onChangeText={setNombre}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Apellidos (Opcional)"
                    value={apellidos}
                    onChangeText={setApellidos}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Correo Electrónico *"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña *"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry // Oculta la contraseña con asteriscos
                />

                {/* Botón de Registro */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading} // Desactiva el botón si está cargando
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Registrarse</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onNavigateToLogin} style={{ marginTop: 20 }}>
                    <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
    },
    formContainer: {
        padding: 20,
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, // Sombra para Android
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#FF5A5F', // Color tipo Airbnb
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    linkText: { color: '#1E3A8A', textAlign: 'center', fontWeight: '600' }
});