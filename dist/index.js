import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";
const books = [
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
const authors = [
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
        books: () => {
            return books;
        },
        author: () => {
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
        books: (parent, { book }, contextValue) => {
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
            }
            else {
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
        author: (parent) => {
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
    context: async ({ req }) => {
        return { isAdmin: true };
    },
});
console.log(`🚀  Server ready at: ${url}`);
