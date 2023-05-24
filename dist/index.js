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
const author = [
    {
        name: "Kate Chopin",
        books: ["The Awakening"],
    },
    {
        name: "Paul Auster",
        books: ["City of Glass"],
    },
];
// Make typeDef , #graphql is used for syntax highlighting , but not working in my machine
const typeDefs = `#graphql
  
  type Book {
    title : String
    author : Author
  }

  type Author {
    name : String
    books : [Book]
  }


  type Query {
    books : [Book]
    author : [Author]
  }
`;
// resolver is a object , that have two properties functions only , Query and Mutation
const resolvers = {
    Query: {
        books: () => {
            return books;
        },
        author: () => {
            return author;
        },
    },
    Book: {
        author: (parent) => {
            // console.log(parent.title);
            return author.find((a) => a.name === parent.author);
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
