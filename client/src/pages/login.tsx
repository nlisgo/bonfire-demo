import { useState } from "react";
import { useLocation } from "wouter";
import * as ApolloClientReact from "@apollo/client/react/index.js";
const { useMutation } = ApolloClientReact;
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginCredentials } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useApiMode } from "@/lib/api-mode-context";
import { ApiModeToggle } from "@/components/api-mode-toggle";
import { LOGIN_MUTATION } from "@/lib/graphql/queries";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { apiMode, isRealApi } = useApiMode();
  const { toast } = useToast();

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      setAuth(data.login.user, data.login.token);
      toast({
        title: "Welcome back!",
        description: `Logged in successfully as ${data.login.user.displayName}`,
      });
      setLocation("/chat");
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    if (isRealApi) {
      toast({
        title: "Real API not available",
        description: "Real Bonfire API authentication is not yet implemented. Please use mock mode.",
        variant: "destructive",
      });
      return;
    }

    await loginMutation({
      variables: {
        username: data.username,
        password: data.password,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
              B
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold">Bonfire Integration</h1>
              <p className="text-sm text-muted-foreground">Sign in to continue</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <ApiModeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access Bonfire features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  placeholder="Enter your username"
                  {...register("username")}
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-xs text-destructive" data-testid="error-username">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-xs text-destructive" data-testid="error-password">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                data-testid="button-login"
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Demo Credentials:</p>
              <code className="text-xs font-mono block">
                username: demo / password: demo123
              </code>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>GraphQL Endpoint:</p>
          <code className="font-mono bg-muted px-2 py-1 rounded">
            {apiMode === "real"
              ? "https://discussions.sciety.org/api/graphql"
              : "/api/graphql"}
          </code>
        </div>
      </div>
    </div>
  );
}
