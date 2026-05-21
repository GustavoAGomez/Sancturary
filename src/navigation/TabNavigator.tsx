import React from 'react';
// Importamos los tipos necesarios de la librería
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

// 1. EL DICCIONARIO DE RUTAS (Best Practice)
// Aquí le decimos a TypeScript qué pantallas existen y qué datos reciben.
// 'undefined' significa que la pantalla no necesita recibir datos extras para abrirse.
export type TabParamList = {
    Buscar: undefined;
    Perfil: undefined;
};

// 2. Le inyectamos el diccionario al creador del navegador
const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            // 3. LA SOLUCIÓN AL ERROR: Le damos un ID único al navegador
            id="MainTabs"

            // Mantenemos tus opciones de diseño exactas
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#FF5A5F',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

                    if (route.name === 'Buscar') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
            })}
        >
            <Tab.Screen name="Buscar" component={HomeScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}