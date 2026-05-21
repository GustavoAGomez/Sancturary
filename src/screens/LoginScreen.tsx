import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../services/supabase';

interface LoginProps {
    onNavigateToRegister: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert('Error', error.message);
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Iniciar Sesión</Text>

                <TextInput style={styles.input} placeholder="Correo Electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Entrar'}</Text>
                </TouchableOpacity>

                {/* Botón para ir al registro */}
                <TouchableOpacity onPress={onNavigateToRegister} style={{ marginTop: 20 }}>
                    <Text style={styles.linkText}>¿No tienes cuenta? Regístrate aquí</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center' },
    formContainer: { padding: 20, backgroundColor: 'white', marginHorizontal: 20, borderRadius: 15, elevation: 5 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', padding: 15, borderRadius: 8, marginBottom: 15 },
    button: { backgroundColor: '#FF5A5F', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    linkText: { color: '#1E3A8A', textAlign: 'center', fontWeight: '600' }
});