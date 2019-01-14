// generate new id based on the greatest id existing in the local storage
const generateId = function() {
    const prefix = '_id_book_';
    let max = -1;

    const books = JSON.parse(localStorage.getItem('books'));
    if(books === null || !books.length){
        max = 1;
    }else {
        books.forEach(book => {
            const id = book.id.substring(prefix.length);
            if(Number.parseInt(id) >= max){
                max = Number.parseInt(id) + 1;
            }
        });
    }

    const id = prefix + max;
    return id;
}

class Book {

    constructor(title, description, author) {
        this.id = generateId();
        this.title = title;
        this.description = description;
        this.author = author;
    }

}

class Store {

    constructor() {
        this.books = [];
        if(localStorage.getItem('books') !== null){
            this.books = JSON.parse(localStorage.getItem('books'));
        }
    }

    // get all the books of the store
    getBooks() {
        return this.books;
    }

    /**
     * @param {Book} book the book to be added
     * 
     * add new book to the store
    */
    addBook(book) {
        if(!book) return;
        this.books.push(book);
        this.updateStorage();
    }

    /**
     * @param {Book} book the book to be removed
     * 
     * remove a book from the store
    */
    removeBook(book) {
        if(!book) return;
        this.books = this.books.filter((b) => b.id !== book.id);
        this.updateStorage();
    }

    /**
     * @param {Book} book the book to be updated
     * 
     * update a book in the store
    */
    updateBook(book) {
        if(!book) return;
        this.books.forEach((b) => {
            if(b.id === book.id){
                b.title = book.title;
                b.description = book.description;
                b.author = book.author;
            }
        });

        this.updateStorage();
    }

    /**
     * @param {String} id id of the book
     * 
     * return a book whose id property matches the argument
    */
    getBook(id) {
        const [book] = this.books.filter((book) => book.id === id);
        return book;
    }

    // stock data in the local storage
    updateStorage() {
        localStorage.setItem('books', JSON.stringify(this.books));
    }

}

class UI {

    /**
     * @param {Array<Book>} books the books to be displayed
     * 
     * display all the books
    */
    static displayBooks(books) {
        books.forEach((book) => UI.displayBookRow(book));
    }
    
    /**
     * @param {Book} book the book to be displayed
     * 
     * display a book
    */
    static displayBookRow(book) {
        const bookList = document.querySelector('#book-list');
    
        const bookRow = document.createElement('tr');
    
        bookRow.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.description}</td>
            <td>
                <button class="btn btn-danger btn-sm delete" id="${book.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="btn btn-secondary btn-sm update disabled">
                    <i class="fas fa-pen"></i>
                </button>
            </td>
        `;
    
        bookList.appendChild(bookRow);
    }
    
    // this function hide book row
    static hideBookRow(bookRow) {
        bookRow.remove();
    }
    
    // clear all the field
    static clearFields() {
        document.querySelector('#title').value = '';
        document.querySelector('#author').value = '';
        document.querySelector('#description').value = '';
    }
    
    /**
     * @param {String} message   the message to be displayed
     * @param {String} type      type of the alert
     * 
     * this function show a costume alert 
    */
    static showAlert(message = "you've made an error", type = 'danger') {
        const alerDiv = document.createElement('div');
        alerDiv.className = `alert alert-${type}`;
        alerDiv.appendChild(document.createTextNode(message));
        
        const messageContainer = document.querySelector('#message-container');
        messageContainer.appendChild(alerDiv);

        // dismiss the alert after 3 seconds
        setTimeout(() => { alerDiv.remove() }, 3000);
    }

}

class EventHandler {

    constructor() {

        this.store = new Store();
        UI.displayBooks(this.store.getBooks());
        this.formListener();
        this.deleteListener();

    }

    /**
     * this is the form listener
     * each time the user click add, this function take action
     *  - validate the input
     *  - create new instance of Book
     *  - add the new book to the store
     *  - add the new book to the UI
    */
    formListener() {

        const addBookForm = document.querySelector('#add-book-form');
        addBookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.querySelector('#title').value;
            const description = document.querySelector('#description').value;
            const author = document.querySelector('#author').value;

            if(!title.length || !description.length || !author.length){
                UI.showAlert('Please fill in all fields');
                return;
            }

            UI.clearFields();

            const book = new Book(title, description, author);

            this.store.addBook(book);

            UI.displayBookRow(book);
            UI.showAlert('book has been added successfully', 'success');

        });
    }

    deleteListener() {
        const bookList = document.querySelector('#book-list');
        bookList.addEventListener('click', (e) => {
            const deleteButton = e.target.nodeName === 'I' ? e.target.parentElement : e.target;
            
            if(!deleteButton.classList.contains('delete')) return;

            if(!confirm('do you really want to delete this book ?')) return;

            const id = deleteButton.id;
            const book = this.store.getBook(id);
            this.store.removeBook(book);

            const bookRow = deleteButton.parentElement.parentElement;
            UI.hideBookRow(bookRow);
            UI.showAlert('book has been removed successfully', 'success')
        });
    }

}

new EventHandler();