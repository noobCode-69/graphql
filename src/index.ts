import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

interface Book {
  title: string;
  author: string;
}

interface Author {
  name: string;
  books: string[];
}

const books: Book[] = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

const authors: Author[] = [
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
    # top-level or root-level queries
    books : [Book]
    author : [Author]
  }


  type Mutation {
    # top-level or root-level mutations
    books(title : String , author : String) : Book
  }

`;

const resolvers = {
  Query: {
    books: (): Book[] => {
      return books;
    },
    author: (): Author[] => {
      return authors;
    },
  },

  Mutation: {
    books: (parent, { title, author }): Book => {
      const existingAuthor = authors.find((a) => a.name === author);
      if (!existingAuthor) {
        authors.push({
          name: author,
          books: [title],
        });
      } else {
        existingAuthor.books.push(title);
      }
      const newBook = {
        title,
        author,
      };
      books.push(newBook);
      return newBook;
    },
  },

  Book: {
    author: (parent: Book): Author => {
      return authors.find((a) => a.name === parent.author);
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
