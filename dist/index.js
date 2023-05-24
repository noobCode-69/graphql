import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
const books = [
    {
        title: "The Awakening",
        author: "Kate Chopin",
    },
    {
        title: "City of Glass",
        author: "Paul Auster",
    },
];
// Make typeDef , #graphql is used for syntax highlighting , but not working in my machine
const typeDefs = `#graphql

  type Book {
    title: String
    author: String
  }


  type Query {
    books : [Book]
  }
`;
// resolver is a object , that have two functions only , Query and Mutation
const resolvers = {
    Query: {
        books: () => {
            console.log("inside the function");
            return books;
        },
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);
