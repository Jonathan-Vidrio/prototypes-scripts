import * as fs from 'fs';

function generateISBN(existingISBNs: Set<string>): string {
    let isbn: string;
    do {
        isbn = `${Math.floor(Math.random() * (999 - 978 + 1) + 978)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 100000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10)}`;
    } while (existingISBNs.has(isbn));
    return isbn;
}

interface Book {
    ISBN: string;
    Title: string;
    Subtitle: string;
    PublishDate: string;
    Pages: number;
    Description: string;
    AuthorId: number;
    EditorialId: number;
    CategoryId: number;
    LanguageId: number;
}

function generateJson(): Book[] {
    const existingISBNs = new Set<string>();
    const books: Book[] = [];

    for (let i = 0; i < 10000; i++) {
        const isbn = generateISBN(existingISBNs);
        existingISBNs.add(isbn);

        const book: Book = {
            ISBN: isbn,
            Title: `Generated Book Title ${i}`,
            Subtitle: `Generated Book Subtitle ${i}`,
            PublishDate: "2024-01-01",
            Pages: Math.floor(Math.random() * 900 + 100), // Random number between 100 and 1000
            Description: "Generated Description",
            AuthorId: Math.floor(Math.random() * 100 + 1),
            EditorialId: Math.floor(Math.random() * 30 + 1),
            CategoryId: Math.floor(Math.random() * 30 + 1),
            LanguageId: Math.floor(Math.random() * 30 + 1)
        };

        books.push(book);
    }

    return books;
}

const books = generateJson();
fs.writeFileSync('books.json', JSON.stringify(books, null, 4));