const collectFormData = document.getElementById("bookForm");
const incompleteList = document.getElementById("incompleteBookList");
const completeList = document.getElementById("completeBookList");
const searchForm = document.getElementById('searchBook');
const submitButton = document.getElementById("bookFormSubmit");

const storageKey = "STORAGE_KEY";

// Mengecek apakah Storage tersedia di browser
const checkForStorage = () => {
  return typeof(Storage) !== "undefined";
};

// Genereate id
const generateId = () => {
  return Date.now().toString().slice(-5);
};

// Menyimpan data ke localStorage
const insertList = (data) => {
  if (checkForStorage()) {
    let userData = [];
    if (localStorage.getItem(storageKey) !== null) {
      userData = JSON.parse(localStorage.getItem(storageKey));
    }
    userData.push(data);
    localStorage.setItem(storageKey, JSON.stringify(userData));
  }
};

// Ambil data buku dari localStorage
const getUserList = () => {
  if (checkForStorage()) {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } else {
    return [];
  }
};

const renderBooks = () => {
  const userData = getUserList();
  for (let book of userData) {
    renderBook(book);
  }
};

// Menampilkan buku pada page
const renderBook = (book) => {
  const bookElement = document.createElement("div");
  bookElement.setAttribute("data-bookid", book.id);
  bookElement.setAttribute("data-testid", "bookItem");

  const title = document.createElement("h3");
  title.setAttribute("data-testid", "bookItemTitle");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.setAttribute("data-testid", "bookItemAuthor");
  author.textContent = `author: ${book.author}`;

  const year = document.createElement("p");
  year.setAttribute("data-testid", "bookItemYear");
  year.textContent = `year: ${book.year}`;

  const buttonContainer = document.createElement("div");

  const completeBtn = document.createElement("button");
  completeBtn.setAttribute("data-testid", "bookItemIsCompleteButton");
  completeBtn.textContent = book.read ? "Belum selesai dibaca" : "Selesai dibaca";

  const deleteBtn = document.createElement("button");
  deleteBtn.setAttribute("data-testid", "bookItemDeleteButton");
  deleteBtn.textContent = "Hapus Buku";

  const editBtn = document.createElement("button");
  editBtn.setAttribute("data-testid", "bookItemEditButton");
  editBtn.textContent = "Edit Buku";

  buttonContainer.appendChild(completeBtn);
  buttonContainer.appendChild(deleteBtn);
  buttonContainer.appendChild(editBtn);

  bookElement.appendChild(title);
  bookElement.appendChild(author);
  bookElement.appendChild(year);
  bookElement.appendChild(buttonContainer);

  if (book.read) {
    completeList.appendChild(bookElement);
  } else {
    incompleteList.appendChild(bookElement);
  }

  // Tombol Hapus
  deleteBtn.addEventListener("click", () => {
    const bookId = book.id;
    const userData = getUserList();
    const updatedData = userData.filter((item) => item.id !== bookId);
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    bookElement.remove();
  });

  // Tombol Edit
  editBtn.addEventListener("click", () => {
    const bookId = book.id;
    const userData = getUserList();
    const bookToEdit = userData.find(user => user.id === bookId);

    if (bookToEdit) {
      document.getElementById("bookFormTitle").value = bookToEdit.title;
      document.getElementById("bookFormAuthor").value = bookToEdit.author;
      document.getElementById("bookFormYear").value = bookToEdit.year;
      document.getElementById("bookFormIsComplete").checked = bookToEdit.read;

      collectFormData.setAttribute("data-editing-book-id", bookId);
      submitButton.innerHTML = "Perbarui Buku";
    }
  });

  // Tombol Selesai / Belum Selesai Dibaca
  completeBtn.addEventListener("click", () => {
    const bookId = book.id;
    const userData = getUserList();
    const bookToUpdate = userData.find(user => user.id === bookId);

    if (bookToUpdate) {
      bookToUpdate.read = !bookToUpdate.read;
      localStorage.setItem(storageKey, JSON.stringify(userData));

      const completeBtn = bookElement.querySelector("[data-testid='bookItemIsCompleteButton']");
      completeBtn.textContent = bookToUpdate.read ? "Belum selesai dibaca" : "Selesai dibaca";

      if (bookToUpdate.read) {
        completeList.appendChild(bookElement);
      } else {
        incompleteList.appendChild(bookElement);
      }
    }
  });
};

// Fungsi penacarian
const searchBook = (searchQuery) => {
  const userData = getUserList();
  const filteredBooks = userData.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  incompleteList.innerHTML = '';
  completeList.innerHTML = '';

  filteredBooks.forEach(book => renderBook(book));
};

// Event listener untuk form pencarian
searchForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const searchQuery = document.getElementById('searchBookTitle').value;
  searchBook(searchQuery);
});

// Menangani form saat disubmit
collectFormData.addEventListener("submit", (ev) => {
  ev.preventDefault();

  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = document.getElementById("bookFormYear").value;
  const read = document.getElementById("bookFormIsComplete").checked;

  const bookId = collectFormData.getAttribute("data-editing-book-id");

  const data = {
    id: bookId ? bookId : generateId(),
    title,
    author,
    year,
    read
  };

  const userData = getUserList();

  if (bookId) {
    const bookToEdit = userData.find(user => user.id === bookId);
    if (bookToEdit) {
      bookToEdit.title = title;
      bookToEdit.author = author;
      bookToEdit.year = year;
      bookToEdit.read = read;

      localStorage.setItem(storageKey, JSON.stringify(userData));
      location.reload();
    }

    collectFormData.reset();
    collectFormData.removeAttribute("data-editing-book-id");
    submitButton.innerHTML = "Masukkan Buku ke rak <span>Belum selesai dibaca</span>";
  } else {
    insertList(data);
    renderBook(data);
    collectFormData.reset();
  }
});

// Render semua buku yang tersimpan saat halaman dimuat
window.addEventListener('load', function () {
  if (checkForStorage()) {
    if (localStorage.getItem(storageKey) !== null) {
      renderBooks();
    }
  } else {
    alert('Browser yang Anda gunakan tidak mendukung Web Storage');
  }
});