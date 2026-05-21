import { StyleSheet, Text, View } from 'react-native';

interface NavbarProps {
    title: string;
}

export default function Navbar({ title }: NavbarProps) {
    return (
        <View style={styles.navContainer}>
            <Text style={styles.logo}>{title}</Text>
            <View style={styles.menu}>
                <Text style={styles.menuItem}>Inicio</Text>
                <Text style={styles.menuItem}>Perfil</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    navContainer: {
        height: 60,
        backgroundColor: '#1E3A8A', // Azul oscuro para web
        flexDirection: 'row',       // Elementos en fila
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        width: '100%',
    },
    logo: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    menu: {
        flexDirection: 'row',
        gap: 20, // Espacio entre elementos del menú
    },
    menuItem: {
        color: 'white',
        fontSize: 16,
    }
});