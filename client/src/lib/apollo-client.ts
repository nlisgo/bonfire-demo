import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink } from "@apollo/client";

function getGraphQLEndpoint(mode: "mock" | "real"): string {
  if (mode === "real") {
    return "https://discussions.sciety.org/api/graphql";
  }
  return "/api/graphql";
}

function getStoredMode(): "mock" | "real" {
  const stored = localStorage.getItem("bonfire_api_mode");
  return (stored === "real" || stored === "mock") ? stored : "mock";
}

function createApolloClient(mode: "mock" | "real") {
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

// Create initial client using stored mode
let apolloClient = createApolloClient(getStoredMode());

export function getApolloClient() {
  return apolloClient;
}

export function resetApolloClient(mode: "mock" | "real") {
  apolloClient = createApolloClient(mode);
  return apolloClient;
}
