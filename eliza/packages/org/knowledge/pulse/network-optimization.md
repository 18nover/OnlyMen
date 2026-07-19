# Network Optimization

## Overview

Network optimization techniques for mobile applications, including request batching, caching, image optimization, prefetching, and offline support.

## This stack's network profile (optimize these, not hypotheticals)

- **All client traffic is XRPC** through `@atproto/api` via the PDS
  (proxied reads to the AppView). Latency wins come from TanStack Query
  cache tuning (`STALE` constants, `persistedVersion`), cursor-page sizes,
  and cache-mutation-over-refetch — not from hand-rolled batching.
  Canonical patterns: Nova's `client.md`.
- **Read-after-write** hides indexing latency for the author; don't add
  refetch loops to "fix" eventual consistency for other viewers.
- **Media**: images/video render via expo-image + the AppView's blob/CDN
  path (`blob-resolver`, image resizing server-side). Prefetch feed media,
  request sized variants, never full blobs for thumbnails.
- **Server side**: AppView hydration fan-out and Postgres query shape
  dominate p95 (Forge's `appview.md` pipeline); **firehose lag** is the
  systemic backpressure metric (Forge's `firehose.md`) — indexing must
  batch and stay idempotent.
- **Web**: the bskyweb Go binary serves an embedded static export —
  standard web-vitals work (bundle size, code-splitting) applies; see
  `bundle-analysis.md`.

## Request Batching

### GraphQL Batching

```javascript
// Batch multiple queries into single request
const batchedQuery = async (queries) => {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queries),
  });
  return response.json();
};

// Use with DataLoader
const dataLoader = new DataLoader(async (ids) => {
  const response = await fetch(`/api/items?ids=${ids.join(',')}`);
  const items = await response.json();
  return ids.map(id => items.find(item => item.id === id));
});
```

### REST Batching

```javascript
// Batch multiple mutations
const batchMutations = async (mutations) => {
  return fetch('/api/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operations: mutations }),
  });
};

// Usage
const results = await batchMutations([
  { type: 'update', entity: 'profile', data: { name: 'New Name' } },
  { type: 'update', entity: 'settings', data: { theme: 'dark' } },
]);
```

## Caching Strategies

### HTTP Cache

```javascript
// Cache-Control headers
// Server should return:
// Cache-Control: max-age=3600, stale-while-revalidate=86400

// Client-side cache configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Cache-Control': 'max-age=300',
  },
});

// Intercept and cache responses
const cache = new Map();

apiClient.interceptors.response.use(async (response) => {
  const key = `${response.config.method}:${response.config.url}`;
  cache.set(key, {
    data: response.data,
    timestamp: Date.now(),
  });
  return response;
});
```

### React Query Caching

```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 30 * 60 * 1000,     // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Usage
function UserProfile({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 10 * 60 * 1000,  // 10 minutes for user data
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorFallback error={error} />;

  return <Profile data={data} />;
}

// Prefetch on hover
const prefetchUser = (userId) => {
  queryClient.prefetchQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 10 * 60 * 1000,
  });
};
```

### Cache Invalidation

```javascript
// Invalidate specific queries
const updateUser = async (userId, data) => {
  const result = await api.updateUser(userId, data);

  // Invalidate user cache
  queryClient.invalidateQueries(['user', userId]);

  // Invalidate all user lists
  queryClient.invalidateQueries(['users']);

  return result;
};

// Optimistic updates
const useUpdateProfile = () => {
  return useMutation(updateProfile, {
    onMutate: async (newData) => {
      await queryClient.cancelQueries(['profile']);
      const previous = queryClient.getQueryData(['profile']);
      queryClient.setQueryData(['profile'], old => ({ ...old, ...newData }));
      return { previous };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['profile'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['profile']);
    },
  });
};
```

## Image Optimization

### WebP Conversion

```javascript
// Server-side: Serve WebP when supported
const acceptHeader = request.headers.get('accept');
if (acceptHeader.includes('image/webp')) {
  // Serve WebP version
  imageUrl = imageUrl.replace(/\.(jpg|png)$/, '.webp');
}
```

### Image Sizing

```javascript
// Request appropriately sized images
const getImageUrl = (baseUrl, width, quality = 80) => {
  return `${baseUrl}?w=${width}&q=${quality}&fmt=webp`;
};

// Use srcset for responsive images
const ResponsiveImage = ({ src, alt }) => (
  <Image
    source={{
      uri: src,
      width: Dimensions.get('window').width,
    }}
    resizeMode="contain"
  />
);
```

### Lazy Loading

```javascript
// React Native lazy image loading
import FastImage from 'react-native-fast-image';

const LazyImage = ({ source, style }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={style}>
      {!loaded && <Placeholder style={style} />}
      <FastImage
        source={{ uri: source.uri, priority: FastImage.priority.normal }}
        style={[style, { opacity: loaded ? 1 : 0 }]}
        onLoad={() => setLoaded(true)}
        resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  );
};
```

### Image Optimization Table

| Format | Size Reduction | Browser Support | Use Case        |
|--------|---------------|-----------------|-----------------|
| WebP   | 25-35%        | All modern      | Default format  |
| AVIF   | 50%+          | Chrome, Firefox | Quality-focused |
| JPEG XL | 60%+         | Limited         | Future-proof    |
| PNG    | Baseline      | All             | Transparency    |

## Prefetching

### Route Prefetching

```javascript
// Prefetch next likely route
const usePrefetch = () => {
  const prefetchProfile = (userId) => {
    queryClient.prefetchQuery({
      queryKey: ['profile', userId],
      queryFn: () => fetchProfile(userId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchFeed = () => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ['feed'],
      queryFn: ({ pageParam }) => fetchFeed(pageParam),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
  };

  return { prefetchProfile, prefetchFeed };
};

// Usage in navigation
<Pressable
  onPress={() => navigation.navigate('Profile')}
  onHoverIn={() => prefetchProfile(userId)}
>
  <Text>View Profile</Text>
</Pressable>
```

### Data Prefetching Strategy

```javascript
// Predictive prefetching based on user behavior
class PredictivePrefetcher {
  constructor() {
    this.userPatterns = new Map();
  }

  recordNavigation(from, to) {
    const key = `${from}:${to}`;
    const count = this.userPatterns.get(key) || 0;
    this.userPatterns.set(key, count + 1);
  }

  getMostLikelyNext(currentScreen) {
    let maxCount = 0;
    let mostLikely = null;

    for (const [key, count] of this.userPatterns) {
      if (key.startsWith(currentScreen + ':') && count > maxCount) {
        maxCount = count;
        mostLikely = key.split(':')[1];
      }
    }

    return mostLikely;
  }
}
```

## Offline Support

### Offline Detection

```javascript
import NetInfo from '@react-native-community/netinfo';

class OfflineManager {
  constructor() {
    this.isOffline = false;
    this.listeners = new Set();
    this.pendingRequests = [];

    NetInfo.addEventListener(state => {
      const wasOffline = this.isOffline;
      this.isOffline = !state.isConnected;

      if (wasOffline && !this.isOffline) {
        this.retryPendingRequests();
      }

      this.listeners.forEach(listener => listener(this.isOffline));
    });
  }

  async retryPendingRequests() {
    while (this.pendingRequests.length > 0) {
      const request = this.pendingRequests.shift();
      try {
        await request.retry();
      } catch (error) {
        this.pendingRequests.push(request);
        break;
      }
    }
  }
}
```

### Offline Queue

```javascript
class OfflineQueue {
  constructor(storage) {
    this.storage = storage;
    this.queue = [];
  }

  async enqueue(operation) {
    const item = {
      id: uuid(),
      operation,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(item);
    await this.storage.save('offlineQueue', this.queue);
    return item.id;
  }

  async processQueue() {
    const processed = [];

    for (const item of this.queue) {
      try {
        await item.operation.execute();
        processed.push(item.id);
      } catch (error) {
        item.retries++;
        if (item.retries >= 3) {
          processed.push(item.id);  // Remove after max retries
        }
      }
    }

    this.queue = this.queue.filter(item => !processed.includes(item.id));
    await this.storage.save('offlineQueue', this.queue);
  }
}
```

### Offline Data Strategy

| Data Type        | Strategy          | Sync Frequency | Conflict Resolution |
|------------------|-------------------|----------------|---------------------|
| User profile     | Cache + queue     | On reconnect   | Server wins         |
| Messages         | Store locally     | Real-time      | Timestamp           |
| Feed items       | Cache first       | Pull to refresh| Server wins         |
| Form data        | Draft locally     | Manual submit  | User decides        |
| Settings         | Cache + sync      | On change      | Server wins         |

## Connection-Aware Loading

```javascript
const useConnectionQuality = () => {
  const [quality, setQuality] = useState('good');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.type === 'wifi') {
        setQuality('good');
      } else if (state.type === 'cellular' && state.details?.cellularGeneration === '4g') {
        setQuality('good');
      } else if (state.type === 'cellular' && state.details?.cellularGeneration === '3g') {
        setQuality('fair');
      } else {
        setQuality('poor');
      }
    });

    return unsubscribe;
  }, []);

  return quality;
};

// Adaptive loading based on connection
const useAdaptiveImageSize = () => {
  const quality = useConnectionQuality();

  const getImageSize = () => {
    switch (quality) {
      case 'good': return { width: 800, quality: 85 };
      case 'fair': return { width: 400, quality: 75 };
      case 'poor': return { width: 200, quality: 60 };
      default: return { width: 400, quality: 75 };
    }
  };

  return getImageSize();
};
```

## Network Optimization Checklist

- [ ] API responses use appropriate cache headers
- [ ] React Query configured with reasonable stale times
- [ ] Images served in WebP format with responsive sizing
- [ ] Non-critical requests batched
- [ ] Prefetching implemented for likely next screens
- [ ] Offline support with queue for mutations
- [ ] Connection-aware loading for images
- [ ] GraphQL batching for multiple queries
- [ ] Cache invalidation on mutations
- [ ] Network monitoring and adaptive behavior
