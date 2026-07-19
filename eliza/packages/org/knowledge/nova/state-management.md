# State Management — Nova Knowledge Base

## Overview

Effective state management in React Native requires separating state by its
source and lifetime. **In this codebase the stack is TanStack Query (server
state) + React Context (UI/preferences) + a persisted storage layer — there
is no Zustand and no client WebSocket layer**; sections covering those are
general background, not house patterns.

### In this codebase (`app/`)
- Server state: `app/src/state/queries/` — `createQueryKey(root, args)`,
  `use[Name]Query`/`Mutation`/`CacheMutation` naming, `STALE` constants,
  cursor pagination via `useInfiniteQuery`. Canonical file:
  `src/state/queries/feed.ts`. Full pattern: see `client.md`.
- Session: `#/state/session` (`useSession`, `useAgent`).
- Preferences: paired hooks from `#/state/preferences`
  (`useAutoplayDisabled()` / `useSetAutoplayDisabled()`).
- Persistence: `app/src/state/persisted/` and query `persistedVersion`.
- React Compiler is enabled — don't add `useMemo`/`useCallback`
  proactively.

---

## 1. TanStack Query for Server State

### Setup
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30 seconds
      gcTime: 5 * 60_000,       // 5 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'onlymen-query-cache',
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 24 * 60 * 60_000, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success',
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
```

### Query Patterns

#### Basic Query
```tsx
function useMessages(roomId: string) {
  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => api.getMessages(roomId),
    staleTime: 10_000,
  });
}
```

#### Paginated Query
```tsx
function useInfiniteMessages(roomId: string) {
  return useInfiniteQuery({
    queryKey: ['messages', roomId],
    queryFn: ({ pageParam }) => api.getMessages(roomId, { cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    maxPages: 5, // keep only 5 pages in memory
  });
}

// In component
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMessages(roomId);

const messages = useMemo(
  () => data?.pages.flatMap((page) => page.messages) ?? [],
  [data]
);
```

#### Dependent Query
```tsx
function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
  });
}

function useUserRooms(userId: string) {
  const { data: user } = useUserProfile(userId);

  return useQuery({
    queryKey: ['rooms', userId],
    queryFn: () => api.getUserRooms(userId),
    enabled: !!user, // only fetch after user loads
  });
}
```

#### Parallel Queries
```tsx
function useDashboardData() {
  const queries = useQueries({
    queries: [
      { queryKey: ['messages'], queryFn: api.getRecentMessages },
      { queryKey: ['streams'], queryFn: api.getActiveStreams },
      { queryKey: ['notifications'], queryFn: api.getNotifications },
    ],
  });

  return {
    messages: queries[0].data,
    streams: queries[1].data,
    notifications: queries[2].data,
    isLoading: queries.some((q) => q.isLoading),
  };
}
```

### Mutation Patterns

#### Basic Mutation
```tsx
function useSendMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => api.sendMessage(roomId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    },
  });
}
```

#### Optimistic Update
```tsx
function useSendMessageOptimistic(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => api.sendMessage(roomId, text),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ['messages', roomId] });

      const previousMessages = queryClient.getQueryData(['messages', roomId]);

      queryClient.setQueryData(['messages', roomId], (old: Message[]) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          text,
          status: 'sending',
          timestamp: Date.now(),
        },
      ]);

      return { previousMessages };
    },
    onError: (_err, _text, context) => {
      queryClient.setQueryData(['messages', roomId], context?.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    },
  });
}
```

#### Mutation with Loading State
```tsx
function SendMessageInput({ roomId }: { roomId: string }) {
  const [text, setText] = useState('');
  const sendMessage = useSendMessage(roomId);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage.mutate(text.trim(), {
      onSuccess: () => setText(''),
    });
  };

  return (
    <View>
      <TextInput value={text} onChangeText={setText} editable={!sendMessage.isPending} />
      <Button
        onPress={handleSend}
        disabled={sendMessage.isPending || !text.trim()}
        title={sendMessage.isPending ? 'Sending...' : 'Send'}
      />
      {sendMessage.isError && <TextError message="Failed to send. Tap to retry." />}
    </View>
  );
}
```

### Cache Management
```tsx
// Prefetch data
const queryClient = useQueryClient();

// Prefetch on hover/touch
const prefetchMessages = useCallback((roomId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['messages', roomId],
    queryFn: () => api.getMessages(roomId),
    staleTime: 30_000,
  });
}, [queryClient]);

// Invalidate specific queries
await queryClient.invalidateQueries({ queryKey: ['messages'] });

// Remove query from cache
queryClient.removeQueries({ queryKey: ['messages', roomId] });

// Reset entire cache (useful after logout)
queryClient.clear();
```

### Real-Time Updates with WebSockets
```tsx
function useRealtimeMessages(roomId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(`wss://api.onlymen.com/ws/rooms/${roomId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'new_message') {
        queryClient.setQueryData(['messages', roomId], (old: Message[]) => [
          ...(old ?? []),
          data.message,
        ]);
      }

      if (data.type === 'message_updated') {
        queryClient.setQueryData(['messages', roomId], (old: Message[]) =>
          old?.map((m) => (m.id === data.message.id ? data.message : m)) ?? []
        );
      }
    };

    return () => ws.close();
  }, [roomId, queryClient]);
}
```

---

## 2. React Context for UI State

### When to Use Context
- Theme/appearance settings
- Authentication state
- Feature flags
- UI state shared across distant components (modals, sheets)
- Configuration that rarely changes

### When NOT to Use Context
- Frequently changing data (use Zustand or TanStack Query)
- Data used by only 1–2 components (use local state or props)
- Server data (use TanStack Query)
- Complex state with many updates (use Zustand)

### Authentication Context
```tsx
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await api.login(credentials);
    setUser(result.user);
    await SecureStore.setItemAsync('auth-token', result.token);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('auth-token');
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser: (updates: Partial<User>) =>
        setUser((prev) => (prev ? { ...prev, ...updates } : null)),
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

### Theme Context
```tsx
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colors: typeof darkColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const systemColorScheme = useColorScheme();

  const resolvedTheme = useMemo(() => {
    if (theme === 'system') return systemColorScheme === 'dark' ? 'dark' : 'light';
    return theme;
  }, [theme, systemColorScheme]);

  const colors = resolvedTheme === 'dark' ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      colors,
      isDark: resolvedTheme === 'dark',
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

### Context Performance Optimization

#### Splitting Contexts
```tsx
// Bad: single context causes re-renders for all consumers
const AppContext = createContext({ theme: 'dark', user: null, messages: [] });

// Good: split into focused contexts
const ThemeContext = createContext({ theme: 'dark' });
const UserContext = createContext({ user: null });
// Messages should use TanStack Query, not context
```

#### Extracting Provider Value
```tsx
// Bad: inline object creation causes re-renders
<ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
  {children}
</ThemeContext.Provider>

// Good: memoize the value
const value = useMemo(
  () => ({ theme, colors, toggleTheme }),
  [theme, colors, toggleTheme]
);
<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
```

---

## 3. Zustand for Complex Local State

### When to Use Zustand
- Complex UI state with many interdependent values
- State shared between multiple components but not server data
- State that benefits from subscriptions (selective re-renders)
- Form state management across multiple screens
- Offline queue/sync state

### Setup
```bash
npx expo install zustand
```

### Basic Store
```tsx
import { create } from 'zustand';

interface ChatState {
  selectedRoomId: string | null;
  isComposing: boolean;
  draftMessage: string;
  mentionQuery: string | null;

  selectRoom: (roomId: string | null) => void;
  startComposing: () => void;
  cancelComposing: () => void;
  setDraftMessage: (text: string) => void;
  setMentionQuery: (query: string | null) => void;
}

const useChatStore = create<ChatState>()((set) => ({
  selectedRoomId: null,
  isComposing: false,
  draftMessage: '',
  mentionQuery: null,

  selectRoom: (roomId) => set({ selectedRoomId: roomId }),

  startComposing: () => set({ isComposing: true }),

  cancelComposing: () => set({
    isComposing: false,
    draftMessage: '',
    mentionQuery: null,
  }),

  setDraftMessage: (text) => set({ draftMessage: text }),

  setMentionQuery: (query) => set({ mentionQuery: query }),
}));
```

### Persisted Store
```tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PreferencesState {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  messagePreview: boolean;
  fontSize: 'small' | 'medium' | 'large';

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleNotifications: () => void;
  setMessagePreview: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  reset: () => void;
}

const initialState = {
  theme: 'dark' as const,
  notificationsEnabled: true,
  messagePreview: true,
  fontSize: 'medium' as const,
};

const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),
      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      setMessagePreview: (messagePreview) => set({ messagePreview }),
      setFontSize: (fontSize) => set({ fontSize }),
      reset: () => set(initialState),
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Slicing and Selectors
```tsx
// Bad: component re-renders on ANY store change
function RoomList() {
  const store = useChatStore();
  // Re-renders when selectedRoomId, isComposing, draftMessage, etc. change
  return <List rooms={store.rooms} />;
}

// Good: selective subscription — only re-renders when selectedRoomId changes
function RoomList() {
  const selectedRoomId = useChatStore((s) => s.selectedRoomId);
  const rooms = useChatStore((s) => s.rooms);
  return <List rooms={rooms} selectedId={selectedRoomId} />;
}

// Good: computed value with selector
function RoomUnreadBadge({ roomId }: { roomId: string }) {
  const hasUnread = useChatStore((s) => s.unreadCounts[roomId] > 0);
  if (!hasUnread) return null;
  return <Badge />;
}
```

### Middleware
```tsx
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

const useStore = create<MyState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // ...store implementation
      })),
      { name: 'store-key' }
    ),
    { name: 'StoreName' } // for Redux DevTools
  )
);
```

---

## 4. State Colocation Principles

### Decision Framework
```
Where does this state originate?
├── Server/API → TanStack Query
├── URL/Navigation → Route params, query params
├── Form input → React Hook Form / local state
├── UI toggles (modals, drawers) → Local state or Zustand
├── User preferences → Zustand with persist
├── Theme/Auth/Config → React Context
└── Complex cross-cutting state → Zustand
```

### Data Flow Patterns

#### Server Data (TanStack Query)
```
API → useQuery → Component → Render
         ↑
    Cache invalidation ← Mutations
```

#### UI State (Local or Zustand)
```
User Action → Handler → setState/store.update → Re-render
```

#### Shared State (Context or Zustand)
```
Provider → Consumer A
         → Consumer B
         → Consumer C
```

### Common Anti-Patterns

#### Lifting State Too High
```tsx
// Bad: App-level state for screen-specific data
function App() {
  const [messages, setMessages] = useState([]); // only ChatScreen needs this
  return <ChatScreen messages={messages} />;
}

// Good: Screen manages its own state
function ChatScreen() {
  const { data: messages } = useMessages(roomId);
  return <MessageList messages={messages} />;
}
```

#### Duplicating State
```tsx
// Bad: same data in multiple places
const [messages, setMessages] = useState([]);
const [cachedMessages, setCachedMessages] = useState([]); // duplicate

// Good: single source of truth
const { data: messages } = useMessages(roomId); // TanStack Query handles caching
```

#### Over-Using Context
```tsx
// Bad: everything in one context
<AppContext.Provider value={{ user, theme, messages, notifications, rooms }}>
  {children}
</AppContext.Provider>

// Good: separate concerns
<AuthProvider>
  <ThemeProvider>
    <QueryProvider>
      {children}
    </QueryProvider>
  </ThemeProvider>
</AuthProvider>
```

---

## 5. Optimistic Updates

### Pattern
1. Save previous state
2. Update UI immediately
3. Send request to server
4. On success: confirm update (or refetch)
5. On error: roll back to previous state

### Implementation
```tsx
function useToggleReaction(messageId: string, roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emoji: string) => api.toggleReaction(messageId, emoji),

    onMutate: async (emoji) => {
      await queryClient.cancelQueries({ queryKey: ['messages', roomId] });

      const previous = queryClient.getQueryData(['messages', roomId]);

      queryClient.setQueryData(['messages', roomId], (old: Message[]) =>
        old?.map((msg) => {
          if (msg.id !== messageId) return msg;
          const hasReacted = msg.reactions[emoji]?.includes(currentUserId);
          return {
            ...msg,
            reactions: {
              ...msg.reactions,
              [emoji]: hasReacted
                ? msg.reactions[emoji].filter((id) => id !== currentUserId)
                : [...(msg.reactions[emoji] ?? []), currentUserId],
            },
          };
        }) ?? []
      );

      return { previous };
    },

    onError: (_err, _emoji, context) => {
      queryClient.setQueryData(['messages', roomId], context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    },
  });
}
```

### When to Use Optimistic Updates
- **Good for:** Reactions, likes, follows, toggles, message send
- **Avoid for:** Financial transactions, irreversible actions, complex multi-step operations
- **Consider:** Network reliability — on slow connections, rollbacks cause jarring UX

---

## 6. Cache Invalidation Strategies

### TanStack Query Invalidation
```tsx
// Invalidate all queries matching a key prefix
await queryClient.invalidateQueries({ queryKey: ['messages'] });

// Invalidate specific query
await queryClient.invalidateQueries({ queryKey: ['messages', roomId] });

// Invalidate with predicate
await queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === 'messages',
});

// After mutation, invalidate related queries
const sendMessage = useMutation({
  mutationFn: api.sendMessage,
  onSuccess: (_data, variables) => {
    queryClient.invalidateQueries({ queryKey: ['messages', variables.roomId] });
    queryClient.invalidateQueries({ queryKey: ['rooms'] }); // room last message updated
  },
});
```

### Stale Time Strategy
| Data Type | Stale Time | Rationale |
|-----------|------------|-----------|
| User profile | 5 minutes | Changes rarely |
| Chat messages | 10 seconds | Near real-time needed |
| Stream status | 5 seconds | Very time-sensitive |
| Notifications | 30 seconds | Balance freshness vs load |
| Settings | 1 hour | Changes very rarely |
| Static content | 24 hours | Almost never changes |

### Refetch Strategies
```tsx
// Polling for real-time data
useQuery({
  queryKey: ['stream-status', streamId],
  queryFn: () => api.getStreamStatus(streamId),
  refetchInterval: 5_000, // every 5 seconds
  refetchIntervalInBackground: false, // stop when app is in background
});

// Refetch on focus (default behavior)
useQuery({
  queryKey: ['messages'],
  queryFn: api.getMessages,
  refetchOnWindowFocus: true,
});

// Disable refetch for static data
useQuery({
  queryKey: ['app-config'],
  queryFn: api.getAppConfig,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: Infinity,
});
```

---

## 7. Offline Support

### Pattern
```tsx
import NetInfo from '@react-native-community/netinfo';

function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return unsubscribe;
  }, []);

  return isOffline;
}

// Queue mutations when offline
function useSendMessageOffline(roomId: string) {
  const isOffline = useOfflineStatus();
  const sendMessage = useSendMessage(roomId);

  return useCallback(
    (text: string) => {
      if (isOffline) {
        // Store in local queue
        OfflineQueue.enqueue({ type: 'send_message', roomId, text });
        // Optimistically add to UI
        return;
      }
      sendMessage.mutate(text);
    },
    [isOffline, sendMessage, roomId]
  );
}

// Process queue when coming back online
function useOfflineSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected) {
        await OfflineQueue.processAll();
        queryClient.invalidateQueries();
      }
    });
    return unsubscribe;
  }, [queryClient]);
}
```

---

## 8. Performance Guidelines

### Re-render Prevention
```tsx
// 1. Use selectors with Zustand
const selectedId = useStore((s) => s.selectedId); // only re-renders when selectedId changes

// 2. Memoize expensive components
const MessageList = React.memo(function MessageList({ messages }: Props) {
  return <FlatList data={messages} renderItem={renderMessage} />;
});

// 3. Stabilize callbacks passed as props
const handlePress = useCallback((id: string) => {
  setSelected(id);
}, []);

// 4. Avoid creating new objects/arrays in render
// Bad
<View style={{ padding: 16 }}>
// Good
const styles = StyleSheet.create({ container: { padding: 16 } });
```

### State Budget
| Category | Max Items | Tool |
|----------|-----------|------|
| Server cache entries | ~50 active | TanStack Query gcTime |
| Context providers | 5–7 max | React Context |
| Zustand stores | 3–5 stores | Zustand |
| Local state hooks | As needed | useState/useReducer |
| URL params | Keep minimal | React Navigation |

### Debugging
```tsx
// TanStack Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />

// Zustand devtools
import { devtools } from 'zustand/middleware';
const useStore = create(devtools((...) => (...), { name: 'StoreName' }));

// React DevTools Profiler
// Enable "Highlight updates when components render" for visual re-render detection
```
