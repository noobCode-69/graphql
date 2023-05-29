import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { GraphQLError } from "graphql";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";

const app = express();

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
  {
    title: "The complete works of William Shakespeare",
    author: "Austen Kutcher",
  },
  {
    title: "Julius Ceaser",
    author: "Willian Shakespeare",
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
  {
    name: "Willian Shakespeare",
    books: ["Julius Ceaser"],
  },

  {
    name: "Austen Kutcher",
    books: ["The complete works of William Shakespeare"],
  },
];

const typeDefs = `#graphql
  

  input AddBookInput {
    title : String,
    author : String
  }


  union SearchResult = Book | Author

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
    search(contains : String) : [SearchResult]
  }


  type Mutation {
    books(book : AddBookInput) : Book
  }

`;

const resolvers = {
  // If you want to query a union or interface you will have to provide a resolveType for it.
  SearchResult: {
    __resolveType(obj) {
      if (obj.name) {
        return "Author";
      }
      if (obj.title) {
        return "Book";
      }
      return null;
    },
  },

  Query: {
    books: (): Book[] => {
      return books;
    },
    author: (): Author[] => {
      return authors;
    },
    search: (parent, { contains }) => {
      const matchingAuthors = authors.filter((author) => {
        if (author.name.includes(contains)) {
          return true;
        }
      });

      const matchingBooks = books.filter((book) => {
        if (book.title.includes(contains)) {
          return true;
        }
      });

      const authorsResult = matchingAuthors.map((author) => ({
        __typename: "Author",
        name: author.name,
      }));

      const booksResult = matchingBooks.map((book) => ({
        __typename: "Book",
        title: book.title,
      }));
      const searchResults = [...booksResult, ...authorsResult];
      return searchResults;
    },
  },

  Mutation: {
    books: (parent, { book }, contextValue): Book => {
      const isAdmin = contextValue.isAdmin;
      if (!isAdmin) {
        throw new GraphQLError("User is not admin");
      }
      const { author, title } = book;
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

await server.start();

app.use(
  "/graphql",
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(server)
);

app.listen(3000, () => {
  console.log("server started at port ", 3000);
});
