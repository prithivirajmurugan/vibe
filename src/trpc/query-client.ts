import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';

import superjson from 'superjson';

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30 * 1000
                // Use superjson for serialization
                },
                dehydrate: {
                    serializeData: (data) => superjson.serialize(data),
                    shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
                },
                hydrate: {
                    deserializeData: (data) => superjson.deserialize(data),

                }
            },
        })
    }