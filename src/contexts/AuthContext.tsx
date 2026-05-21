import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';

// 1. Definimos qué datos va a guardar nuestra "Nube"
interface UserProfile {
    id: string;
    nombre: string;
    apellidos: string;
    avatar_url: string | null;
    es_anfitrion: boolean;
}

interface AuthContextType {
    session: Session | null;
    profile: UserProfile | null;
    isLoading: boolean;
    setProfile: (profile: UserProfile | null) => void;
}

// 2. Creamos el Contexto (La Nube)
const AuthContext = createContext<AuthContextType>({
    session: null,
    profile: null,
    isLoading: true,
    setProfile: () => { },
});

// 3. Creamos el Proveedor (El motor que llena la nube de datos)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // A. Miramos si hay sesión activa al abrir la app
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else setIsLoading(false);
        });

        // B. Nos quedamos escuchando (Semáforo de Login/Logout)
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null); // Si cierra sesión, borramos los datos de la nube
                setIsLoading(false);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Función que descarga los datos UNA SOLA VEZ
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*') // Aquí sí traemos todo, porque se usará en toda la app
                .eq('id', userId)
                .single();

            if (!error && data) {
                setProfile(data);
            }
        } catch (error) {
            console.log('Error fetching profile:', error);
        } finally {
            setIsLoading(false); // Ya terminamos de cargar sesión y perfil
        }
    };

    return (
        <AuthContext.Provider value={{ session, profile, isLoading, setProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Un "Hook" personalizado para que las pantallas puedan chupar datos de la nube fácilmente
export const useAuth = () => useContext(AuthContext);