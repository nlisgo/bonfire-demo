import { useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import * as ApolloClientReact from "@apollo/client/react/index.js";
const { ApolloProvider } = ApolloClientReact;
import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink } from "@apollo/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ApiModeProvider } from "@/lib/api-mode-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { ApiModeToggle } from "@/components/api-mode-toggle";
import Login from "@/pages/login";
import Chat from "@/pages/chat";
import Feed from "@/pages/feed";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import type { ApiMode } from "@shared/schema";

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

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Login} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <ApiModeToggle />
        </header>
        <main className="flex-1 overflow-hidden">
          <Switch>
            <Route path="/chat" component={() => <ProtectedRoute component={Chat} />} />
            <Route path="/feed" component={() => <ProtectedRoute component={Feed} />} />
            <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
            <Route path="/">
              <Redirect to="/chat" />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const storedMode = localStorage.getItem("bonfire_api_mode");
  const initialMode: ApiMode = (storedMode === "real" || storedMode === "mock") ? storedMode : "mock";
  
  const [apolloClient, setApolloClient] = useState(() => createApolloClient(initialMode));

  const recreateClient = (mode: ApiMode) => {
    const newClient = createApolloClient(mode);
    setApolloClient(newClient);
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ApiModeProvider initialMode={initialMode} onModeChange={recreateClient}>
            <AuthProvider>
              <SidebarProvider style={style as React.CSSProperties}>
                <Router />
              </SidebarProvider>
            </AuthProvider>
          </ApiModeProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
