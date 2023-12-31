import { types, flow} from "mobx-state-tree";
import { createContext} from 'react';
import { fetchBooks } from "../services/api";
import { book_image_default } from "../services/constants";

const BookImage = types.model({
    public_id: types.maybeNull(types.string),
    url: types.optional(types.string, book_image_default),
  });

const Book = types.model({
    _id: types.identifier,
    book_image: types.maybe(BookImage),
    title: types.maybeNull(types.string),
    responsibility: types.maybeNull(types.string),
    uniform_title: types.maybeNull(types.string),
    parallel_title: types.maybeNull(types.string),
    main_author: types.maybeNull(types.string),
    other_author: types.maybeNull(types.string),
    contributors: types.maybeNull(types.string),
    corp_author: types.maybeNull(types.string),
    placePub: types.maybeNull(types.string),
    publisher: types.maybeNull(types.string),
    yearPub: types.maybeNull(types.string),
    edition: types.maybeNull(types.string),
    pages: types.maybeNull(types.string),
    other_details: types.maybeNull(types.string),
    dimension: types.maybeNull(types.string),
    acc_materials: types.maybeNull(types.string),
    series: types.maybeNull(types.string),
    gen_notes: types.maybeNull(types.string),
    isbn: types.maybeNull(types.string),
    call_number: types.maybeNull(types.string),
    accession: types.maybeNull(types.string),
    languange: types.maybeNull(types.string),
    location: types.maybeNull(types.string),
    electronic_access: types.maybeNull(types.string),
    copy: types.maybeNull(types.optional(types.number, 0)),
    on_shelf: types.maybeNull(types.optional(types.number, 0)),
    out: types.maybeNull(types.optional(types.number, 0)),
    date_updated: types.maybeNull(types.string),
    date_entered: types.maybeNull(types.string),
    Fil: types.optional(types.boolean,false),
    Ref: types.optional(types.boolean,false),
    Bio: types.optional(types.boolean,false),
    Fic: types.optional(types.boolean,false),
    Res: types.optional(types.boolean,false),
    subjects: types.optional(types.array(types.string), []),
});
    
const BooksModel = types.model("Books",{
    Books: types.optional(types.array(Book),[]),
    BooksSubjects: types.optional(types.array(types.string),[]),
})
// Actions are functions/actions that directly affect the model.
.actions((self) => ({
    // This action is called to fetch and populate the BooksModel
    fetchBooksModel: flow(function* (){
        try {
            const response = yield fetchBooks();
            response.books.map((book) => {
                const formatted = ({
                    ...book,
                    copy: parseInt(book.copy),
                    on_shelf: parseInt(book.on_shelf),
                    out: parseInt(book.out),
                    })
                self.Books.push(formatted);
            });
            self.BooksSubjects = response.bookSubjects;
        }catch(error){
            console.error("Failed to Fetch Books", error);
        }
    }),
    // This is the action for when someone borrowed a book
    takeoutone(id){
        self.Books.find(book => book._id === id).on_shelf -= 1;
        self.Books.find(book => book._id === id).out += 1;
    },
    // This is the action for when someone returns a book (i.e. the book request is cancelled)
    returnoutone(id){
        self.Books.find(book => book._id === id).on_shelf += 1;
        self.Books.find(book => book._id === id).out -= 1;
    }
}))
// Views are functions/actions that return a view of the model.
.views((self) => ({
    // This is called to fetch data from the model and return it to the client.
    get AllBooks() {
        return self.Books;
    },
    get AllSubjects(){
        return self.BooksSubjects;
    },
    // This is for when someone searches for a book title and returns a list of books.
    // not necessarily needed when all of the data is already fetched from the server and sorted client-side.
    SearchForBookTitle(title){
        return self.Books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    },
    // This is for viewing the book details page.
    // not necessarily needed when all of the data is already fetched from the server and sorted client-side.
    GetBookDetails(id) {
        return self.Books.find(book => book._id === id);
    }
}));

const BooksContext = createContext(BooksModel.create({}));

export default BooksContext;
    