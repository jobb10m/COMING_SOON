import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TrainerDashboardScreen from './src/screens/TrainerDashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#0B0E14' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'My Gym' }} />
        <Stack.Screen
          name="TrainerDashboard"
          component={TrainerDashboardScreen}
          options={{ title: 'Trainer' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// NOTE: This mobile scaffold covers Login + Member dashboard (QR code, membership,
// trainer) + Trainer dashboard (assigned members) against the SAME Express API
// used by the web client. Extend it with the same screen -> endpoint pattern for:
//   Member: Attendance history, Workout Plans, Diet Plans, Payments, Notifications, Profile
//   Trainer: Attendance marking, Workout Plans, Diet Plans, Progress Tracking
