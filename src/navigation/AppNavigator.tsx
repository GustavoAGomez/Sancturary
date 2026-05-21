import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import BecomeHostScreen from '../screens/BecomeHostScreen';
import MapScreen from '../screens/MapScreen';

// 1. Diccionario de Rutas del Stack (Best Practice)
export type RootStackParamList = {
    MainTabs: undefined; // Nuestra barra de pestañas normal
    BecomeHost: undefined; // Pantalla de descripción del baño
    MapScreen: { propiedadId: string }; // Pantalla del mapa
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            id="MainAppNavigator">
            {/* 2. La pantalla base es TODO tu sistema de pestañas */}
            <Stack.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{ headerShown: false }}
            />

            {/* 3. La pantalla de creación. Al estar aquí, tapará la barra inferior */}
            <Stack.Screen
                name="BecomeHost"
                component={BecomeHostScreen}
                options={{
                    title: 'Hazte Anfitrión', // Título nativo superior
                    headerBackTitle: 'Atrás', // Botón de volver para iOS
                }}
            />
            <Stack.Screen
                name="MapScreen"
                component={MapScreen}
                options={{ headerShown: false }} // 👈 Ocultamos la barra de arriba
            />
        </Stack.Navigator>
    );
}