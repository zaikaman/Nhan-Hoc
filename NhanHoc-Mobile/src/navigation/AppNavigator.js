import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { colors } from '../constants/theme';
import AdditionalFeatures from '../screens/AdditionalFeatures';
import Chat from '../screens/Chat';
import Dashboard from '../screens/Dashboard';
import PdfAnalysisScreen from '../screens/PdfAnalysisScreen';
import Quiz from '../screens/Quiz';
import Recommendations from '../screens/Recommendations';
import RoadmapDetail from '../screens/RoadmapDetail';
import Settings from '../screens/Settings';
import Statistics from '../screens/Statistics';
import UploadDocument from '../screens/UploadDocument';
import ViewResource from '../screens/ViewResource';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = size;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Statistics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'AdditionalFeatures') {
            iconName = focused ? 'rocket' : 'rocket-outline';
          } else if (route.name === 'UploadDocument') {
            iconName = focused ? 'book' : 'book-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: Platform.OS === 'ios' ? 10 : 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard}
      />
      <Tab.Screen 
        name="Statistics" 
        component={Statistics}
      />
      <Tab.Screen 
        name="UploadDocument" 
        component={UploadDocument}
      />
      <Tab.Screen 
        name="AdditionalFeatures" 
        component={AdditionalFeatures}
      />
      <Tab.Screen 
        name="Chat" 
        component={Chat}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* <Stack.Screen name="Login" component={Login} /> */}
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="RoadmapDetail" component={RoadmapDetail} />
      <Stack.Screen name="Quiz" component={Quiz} />
      <Stack.Screen name="ViewResource" component={ViewResource} />
      <Stack.Screen name="UploadDocument" component={UploadDocument} />
      <Stack.Screen name="Recommendations" component={Recommendations} />
      <Stack.Screen name="PdfAnalysis" component={PdfAnalysisScreen} />
    </Stack.Navigator>
  );
}

