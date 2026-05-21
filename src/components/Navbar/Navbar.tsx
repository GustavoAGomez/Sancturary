import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

// 1. Definimos nuestro "Contrato" de TypeScript
interface NavbarProps {
    title: string;
}

// 2. Le decimos a la función que debe respetar ese contrato
export default function Navbar({ title }: NavbarProps) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.navContainer}>
                {/* Usamos la propiedad title que recibimos */}
                <Text style={styles.logo}>📱 {title}</Text>
                <Text style={styles.hamburger}>☰</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#065F46',
    },
    navContainer: {
        height: 60,
        backgroundColor: '#065F46',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        width: '100%',
    },
    logo: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    hamburger: {
        color: 'white',
        fontSize: 24,
    }
});