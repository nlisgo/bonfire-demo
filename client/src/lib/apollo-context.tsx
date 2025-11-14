import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink } from "@apollo/client";
import { ApiMode } from "@shared/schema";

function getGraphQLEndpoint(mode: ApiMode): string {
  if (mode === "real") {
    return "https://discussions.sciety.org/api/graphql";
  }
  return "/api/graphql";
}

function createApolloClient(mode: ApiMode) {
  const httpLink = createHttpLink({
    uri: getGraphQLEndpoint(mode),
  });

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem("bonfire_jwt_token");
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    });
    return forward(operation);
  });

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
}

interface ApolloClientContextType {
  client: ApolloClient<any>;
  recreateClient: (mode: ApiMode) => void;
}

const ApolloClientContext = createContext<ApolloClientContextType | undefined>(undefined);

export function ApolloClientProvider({ children, initialMode }: { children: ReactNode; initialMode: ApiMode }) {
  const [client, setClient] = useState(() => createApolloClient(initialMode));

  const recreateClient = (mode: ApiMode) => {
    const newClient = createApolloClient(mode);
    setClient(newClient);
  };

  return (
    <ApolloClientContext.Provider value={{ client, recreateClient }}>
      {children}
    </ApolloClientContext.Provider>
  );
}

export function useApolloClientContext() {
  const context = useContext(ApolloClientContext);
  if (!context) {
    throw new Error("useApolloClientContext must be used within ApolloClientProvider");
  }
  return context;
}
