import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

interface Book {
  title: string;
  newTitle : string;
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
    newTitle : "The Awakening but new."
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
    newTitle : "City of Glass but new."
  },
  {
    title: "The complete works of William Shakespeare",
    author: "Austen Kutcher",
    newTitle : "The complete works of William Shakespeare but new."
  },
  {
    title: "Julius Ceaser",
    author: "Willian Shakespeare",
    newTitle : "Julius Ceaser but new."
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
    title : String  @deprecated(reason: "Use 'newField'."),
    newTitle : String
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
    books: (parent, { book }): Book => {
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
        newTitle : `${title} but new.`
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
