import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ApiModeProvider>
          <AuthProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <Router />
            </SidebarProvider>
          </AuthProvider>
        </ApiModeProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
