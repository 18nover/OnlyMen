# Navigation Patterns — Nova Knowledge Base

## Overview

React Navigation 7 is the navigation library for OnlyMen. **The app does
NOT use Expo Router** — treat any Expo Router material below as general
background only.

### In this codebase (`app/`)
- Config: `app/src/Navigation.tsx`; route strings: `app/src/routes.ts`;
  param types: `app/src/lib/routes/types.ts`.
- Type a screen with
  `NativeStackScreenProps<CommonNavigatorParams, 'X'>`; navigate with
  `useNavigation()` or the `navigate` helper from `#/Navigation`.
- New screens go in `app/src/screens/` (not the legacy `view/screens/`);
  complex screens use a `ScreenName/` directory with `index.tsx` +
  `components/`.
- Shell (tabs, nav bars) lives in `app/src/view/shell/`.

---

## 1. Stack Navigators

### Basic Stack Setup
```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Chat: { roomId: string };
  Profile: { userId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ route }) => ({
            title: `Chat: ${route.params.roomId}`,
          })}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Nested Stacks
```tsx
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="ChatRoom" component={ChatScreen} />
      <Stack.Screen name="UserProfile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationSettings} />
      <Stack.Screen name="Privacy" component={PrivacySettings} />
    </Stack.Navigator>
  );
}
```

### Screen Options Patterns
```tsx
// Static options
<Stack.Screen
  name="Chat"
  component={ChatScreen}
  options={{
    title: 'Chat Room',
    headerBackTitle: 'Back',
    headerRight: () => <HeaderButton />,
  }}
/>

// Dynamic options based on params
<Stack.Screen
  name="Chat"
  component={ChatScreen}
  options={({ route, navigation }) => ({
    title: route.params.roomName,
    headerRight: () => (
      <IconButton
        icon="settings"
        onPress={() => navigation.navigate('ChatSettings', { roomId: route.params.roomId })}
      />
    ),
  })}
/>

// Hide header
<Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />

// Custom header
<Stack.Screen
  name="Chat"
  component={ChatScreen}
  options={{
    header: ({ navigation, route }) => (
      <CustomHeader
        title={route.params.roomName}
        onBack={navigation.goBack}
      />
    ),
  }}
/>
```

### Passing and Receiving Params
```tsx
// Navigate with params
navigation.navigate('Chat', { roomId: 'room-123', roomName: 'General' });

// Type-safe params
type ChatScreenParams = {
  roomId: string;
  roomName?: string;
};

function ChatScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Chat'>) {
  const { roomId, roomName } = route.params;

  return <ChatView roomId={roomId} title={roomName ?? roomId} />;
}

// Update params
navigation.setParams({ roomName: 'Updated Name' });

// Get current params
const params = route.params;
```

---

## 2. Tab Navigators

### Bottom Tabs
```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#666',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Feed': iconName = focused ? 'chatbubbles' : 'chatbubbles-outline'; break;
            case 'Streams': iconName = focused ? 'videocam' : 'videocam-outline'; break;
            case 'Explore': iconName = focused ? 'compass' : 'compass-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
            default: iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedStack} />
      <Tab.Screen name="Streams" component={StreamsScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
```

### Tab with Badge
```tsx
function FeedTabBadge({ unreadCount }: { unreadCount: number }) {
  if (unreadCount === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
    </View>
  );
}

// In tab navigator
<Tab.Screen
  name="Feed"
  component={FeedStack}
  options={{
    tabBarBadge: () => <FeedTabBadge unreadCount={unreadCount} />,
  }}
/>
```

### Material Top Tabs (for in-screen tabbed content)
```tsx
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const TopTab = createMaterialTopTabNavigator();

function ChatRoom() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6C63FF',
        tabBarIndicatorStyle: { backgroundColor: '#6C63FF' },
        tabBarStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      <TopTab.Screen name="Messages" component={MessagesList} />
      <TopTab.Screen name="Members" component={MembersList} />
      <TopTab.Screen name="Media" component={MediaGallery} />
    </TopTab.Navigator>
  );
}
```

---

## 3. Drawer Navigators

### Basic Drawer
```tsx
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#6C63FF',
        drawerStyle: { backgroundColor: '#1a1a2e', width: 280 },
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
    </Drawer.Navigator>
  );
}
```

### Custom Drawer Content
```tsx
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';

function CustomDrawerContent(props: DrawerContentScrollViewProps) {
  return (
    <DrawerContentScrollView {...props} style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <Avatar uri={user.avatarUrl} size={64} />
        <Text style={styles.username}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <DrawerItem
        label="Home"
        icon={({ color, size }) => <Ionicons name="home" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Main')}
      />
      <DrawerItem
        label="Settings"
        icon={({ color, size }) => <Ionicons name="settings" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Settings')}
      />
      <DrawerItem
        label="Sign Out"
        icon={({ color, size }) => <Ionicons name="log-out" size={size} color={color} />}
        onPress={handleSignOut}
      />
    </DrawerContentScrollView>
  );
}
```

---

## 4. Deep Linking

### Configuration
```tsx
const linking = {
  prefixes: ['onlymen://', 'https://onlymen.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Feed: 'feed',
          Streams: 'streams',
          Explore: 'explore',
          Profile: 'profile/:userId',
        },
      },
      Chat: 'chat/:roomId',
      Settings: 'settings',
    },
  },
};

function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {/* ... */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Handling Deep Links
```tsx
// In a screen
function ChatScreen({ route }: Props) {
  const { roomId } = route.params;

  // Handle deep link params
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      const parsed = Linking.parse(url);
      // Handle parsed deep link
    }
  }, [url]);

  return <ChatView roomId={roomId} />;
}
```

### Universal Links (iOS) / App Links (Android)
```json
// app.json
{
  "expo": {
    "scheme": "onlymen",
    "ios": {
      "associatedDomains": ["applinks:onlymen.com"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "https", "host": "onlymen.com" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## 5. Navigation State Management

### Accessing Navigation State
```tsx
// Get current route
function getCurrentRouteName(state: NavigationState): string | undefined {
  const route = state.routes[state.index];
  if (route.state) {
    return getCurrentRouteName(route.state as NavigationState);
  }
  return route.name;
}

// Listen to state changes
function NavigationTracker() {
  const navigation = useNavigationContainerRef();

  return (
    <NavigationContainer
      ref={navigation}
      onStateChange={(state) => {
        const routeName = getCurrentRouteName(state);
        analytics.track('screen_view', { screen: routeName });
      }}
    >
      {/* ... */}
    </NavigationContainer>
  );
}
```

### Persisting Navigation State
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const NAVIGATION_STATE_KEY = 'navigation-state';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
        if (savedState) {
          setInitialState(JSON.parse(savedState));
        }
      } finally {
        setIsReady(true);
      }
    };
    restoreState();
  }, []);

  if (!isReady) return <SplashScreen />;

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={(state) => {
        AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
      }}
    >
      {/* ... */}
    </NavigationContainer>
  );
}
```

### Resetting Navigation State
```tsx
// Full reset (e.g., after logout)
navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  })
);

// Replace current screen (no back button)
navigation.dispatch(
  StackActions.replace('NewScreen', { param: 'value' })
);

// Push without duplicate
navigation.dispatch(
  StackActions.push('Chat', { roomId: '123' })
);

// Pop to top
navigation.dispatch(StackActions.popToTop());
```

---

## 6. Typed Navigation

### Type Definitions
```tsx
// types/navigation.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: { roomId: string; roomName?: string };
  Profile: { userId: string };
  Settings: undefined;
};

export type TabParamList = {
  Feed: undefined;
  Streams: undefined;
  Explore: undefined;
  Profile: undefined;
};

// Screen props types
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export type FeedScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Feed'>,
  NativeStackScreenProps<RootStackParamList>
>;
```

### Using Typed Navigation
```tsx
function ChatScreen({ navigation, route }: ChatScreenProps) {
  // navigation is typed — autocomplete works
  navigation.navigate('Profile', { userId: '123' }); // ✅
  // navigation.navigate('NonExistent'); // ❌ TypeScript error

  // route.params is typed
  const { roomId, roomName } = route.params; // ✅
}
```

### Declaring Navigation in Components
```tsx
// For components that need navigation but aren't screens
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

function HeaderRight({ navigation }: Props) {
  return (
    <IconButton
      icon="settings"
      onPress={() => navigation.navigate('Settings')}
    />
  );
}
```

---

## 7. Expo Router Integration

### File-Based Routing Structure
```
app/
├── _layout.tsx           # Root layout
├── (auth)/
│   ├── _layout.tsx       # Auth stack layout
│   ├── login.tsx         # /login
│   └── register.tsx      # /register
├── (tabs)/
│   ├── _layout.tsx       # Tab layout
│   ├── index.tsx         # / (feed)
│   ├── streams.tsx       # /streams
│   ├── explore.tsx       # /explore
│   └── profile.tsx       # /profile
├── chat/
│   └── [roomId].tsx      # /chat/:roomId
├── settings.tsx          # /settings
└── +not-found.tsx        # 404 page
```

### Root Layout
```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[roomId]" options={{ title: 'Chat' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}
```

### Tab Layout
```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6C63FF',
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="streams"
        options={{
          title: 'Streams',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="videocam" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Dynamic Routes
```tsx
// app/chat/[roomId].tsx
import { useLocalSearchParams, Stack } from 'expo-router';

export default function ChatRoom() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  return (
    <>
      <Stack.Screen options={{ title: `Chat: ${roomId}` }} />
      <ChatView roomId={roomId} />
    </>
  );
}
```

### Navigation from Expo Router
```tsx
import { router, useRouter } from 'expo-router';

// Programmatic navigation
router.push('/chat/room-123');
router.replace('/(tabs)');
router.back();
router.dismiss(); // dismiss modal

// With params
router.push({
  pathname: '/chat/[roomId]',
  params: { roomId: '123', roomName: 'General' },
});

// In component
function SomeComponent() {
  const router = useRouter();
  return <Button onPress={() => router.push('/settings')} title="Settings" />;
}
```

### Shared Routes (Modals)
```tsx
// app/_layout.tsx
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen
    name="modal"
    options={{ presentation: 'modal', title: 'Modal' }}
  />
</Stack>

// Navigate to modal
router.push('/modal');
```

### Protected Routes
```tsx
// app/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;

  return (
    <Stack>
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" />
        </>
      )}
    </Stack>
  );
}
```
