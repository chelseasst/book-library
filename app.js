const url = "http://localhost:3030/jsonstore/collections/books";

const loadAllBooksBtn = document.querySelector('button#loadBooks');
loadAllBooksBtn.addEventListener('click', loadAllBooks);

const tableBody = document.querySelector('tbody');
tableBody.innerHTML = '';
const nonEmptyStringRegex = /\S/; //there is at least one non white space character 
const form = document.querySelector('form');
const h3 = form.querySelector('h3');
const inputTitle = document.querySelector('input[name=title]');
const inputAuthor = document.querySelector('input[name=author]');
const submitEditBtn = form.querySelector('button');
form.addEventListener('submit', submitBook);

//loading the books
async function loadAllBooks() {
    tableBody.innerHTML = '';
    const allBooks = await getAllBooks();
    Object.entries(allBooks).forEach(([key, value]) => {
        const tr = createElement('tr');
        const title = createElement('td', value.title);
        const author = createElement('td', value.author);
        const tdButtons = createElement('td')

        const editButton = createElement('button', 'Edit');
        editButton.addEventListener('click', onEdit);
        editButton.setAttribute('data-id', key)
        const deleteButton = createElement('button', 'Delete');
        deleteButton.addEventListener('click', onDelete)
        deleteButton.setAttribute('data-id', key)

        tdButtons.appendChild(editButton);
        tdButtons.appendChild(deleteButton);
        tr.appendChild(title);
        tr.appendChild(author);
        tr.appendChild(tdButtons);
        tableBody.appendChild(tr);
    })
}
//fetching all books
async function getAllBooks() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error)
    }
}

function createElement(type, text) {
    const el = document.createElement(type);
    el.textContent = text ? text : '';
    return el;
}
async function submitBook(event) {
    event.preventDefault();
    let curUrl;
    let data;
    //accessing the form data
    const formData = new FormData(form);
    const title = formData.get('title');
    const author = formData.get('author');
    //editing the book
    if (submitEditBtn.textContent === 'Save') {
        const id = submitEditBtn.dataset.id;
        data = {
            method: "PUT",
            headers: { "Content-Type": "applications/json" },
            body: JSON.stringify({ title, author })
        }
        curUrl = `${url}/${id}`;

    } else {  //posting a new book
        data = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, author })
        }
        curUrl = url;
    }
    if (!title || !author || !nonEmptyStringRegex.test(title) || !nonEmptyStringRegex.test(author)) {
        window.alert("Missing fields")
        return;
    }
    accessAllBooks(curUrl, data)
}

async function accessAllBooks(url, data) {
    try {
        const response = await fetch(url, data);
        if (response.status !== 200) {
            throw new Error
        }
        submitEditBtn.textContent = "Submit";
        h3.textContent = 'FORM';
        inputTitle.value = '';
        inputAuthor.value = '';
    } catch (error) {
        console.log(error)
    }
}

async function onEdit(event) {
    h3.textContent = 'Edit FORM';
    submitEditBtn.textContent = 'Save';

    const tr = event.currentTarget.parentElement.parentElement;
    const editButton = tr.querySelector('button');
    const id = editButton.dataset.id;
    submitEditBtn.setAttribute('data-id', id);

    const [titleRef, authorRef, buttons] = tr.querySelectorAll('td');
    inputTitle.value = titleRef.textContent;
    inputAuthor.value = authorRef.textContent;
}

function onDelete(event) {
    const id = event.target.dataset.id;
    fetch(url + '/' + id, {
        method: "Delete"
    })
    loadAllBooks()
}