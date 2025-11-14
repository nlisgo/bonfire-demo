import type { Express } from "express";
import { createServer, type Server } from "http";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { createContext } from "./graphql/context";
import { initializeMockData } from "./mock-data";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize mock data on startup
  await initializeMockData();

  // Create Apollo Server for mock GraphQL endpoint
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    introspection: true,
    csrfPrevention: false,
  });

  await apolloServer.start();

  // Mount Apollo Server on /api/graphql
  apolloServer.applyMiddleware({
    app,
    path: "/api/graphql",
  });

  console.log(`🚀 Mock GraphQL server ready at /api/graphql`);

  const httpServer = createServer(app);

  return httpServer;
}
