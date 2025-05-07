const ambilDataForm = document.getElementById("bookForm");
const storageKey = "STORAGE_KEY";

// Mengecek apakah Storage tersedia di browser
const checkForStorage = () => {
  return typeof(Storage) !== "undefined";
};

// Menghasilkan ID unik
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

// Menampilkan buku pada halaman
const renderBook = (book) => {
  const bookElement = document.createElement("div");
  bookElement.setAttribute("data-bookid", book.id);
  bookElement.setAttribute("data-testid", "bookItem");

  // Judul buku
  const title = document.createElement("h3");
  title.setAttribute("data-testid", "bookItemTitle");
  title.textContent = book.judul;

  // Penulis buku
  const author = document.createElement("p");
  author.setAttribute("data-testid", "bookItemAuthor");
  author.textContent = `Penulis: ${book.penulis}`;

  // Tahun buku
  const year = document.createElement("p");
  year.setAttribute("data-testid", "bookItemYear");
  year.textContent = `Tahun: ${book.tahun}`;

  // Tombol untuk setiap buku
  const buttonContainer = document.createElement("div");

  const completeBtn = document.createElement("button");
  completeBtn.setAttribute("data-testid", "bookItemIsCompleteButton");
  // Adjust button text based on the book's status
  completeBtn.textContent = book.selesaiDiBaca ? "Belum selesai dibaca" : "Selesai dibaca"; // Corrected button text

  const deleteBtn = document.createElement("button");
  deleteBtn.setAttribute("data-testid", "bookItemDeleteButton");
  deleteBtn.textContent = "Hapus Buku";

  const editBtn = document.createElement("button");
  editBtn.setAttribute("data-testid", "bookItemEditButton");
  editBtn.textContent = "Edit Buku";

  buttonContainer.appendChild(completeBtn);
  buttonContainer.appendChild(deleteBtn);
  buttonContainer.appendChild(editBtn);

  // Gabungkan semua elemen
  bookElement.appendChild(title);
  bookElement.appendChild(author);
  bookElement.appendChild(year);
  bookElement.appendChild(buttonContainer);

  // Tentukan di mana buku akan ditampilkan
  const incompleteList = document.getElementById("incompleteBookList");
  const completeList = document.getElementById("completeBookList");

  if (book.selesaiDiBaca) {
    completeList.appendChild(bookElement);
  } else {
    incompleteList.appendChild(bookElement);
  }

  // Event Listener untuk tombol hapus
  deleteBtn.addEventListener("click", () => {
    const bookId = book.id;

    // Ambil data dari localStorage
    const userData = getUserList();

    // Filter buku yang tidak memiliki id yang akan dihapus
    const updatedData = userData.filter((item) => item.id !== bookId);

    // Simpan data yang sudah difilter ke localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedData));

    // Hapus elemen dari DOM
    bookElement.remove();
  });

  // Event Listener Tombol Edit Buku
  editBtn.addEventListener("click", () => {
    const bookId = book.id;
    const userData = getUserList();

    // Cari buku berdasarkan ID
    const bookToEdit = userData.find(user => user.id === bookId);

    if (bookToEdit) {
      // Isi form dengan data buku yang ingin diedit
      document.getElementById("bookFormTitle").value = bookToEdit.judul;
      document.getElementById("bookFormAuthor").value = bookToEdit.penulis;
      document.getElementById("bookFormYear").value = bookToEdit.tahun;
      document.getElementById("bookFormIsComplete").checked = bookToEdit.selesaiDiBaca;

      // Tambahkan ID buku ke form untuk penandaan
      ambilDataForm.setAttribute("data-editing-book-id", bookId);

      // Ubah teks tombol form untuk memberi tahu pengguna bahwa ini adalah mode edit
      const submitButton = document.getElementById("bookFormSubmit");
      submitButton.innerHTML = "Perbarui Buku";
    }
  });

  // Event Listener Tombol Selesai Dibaca / Belum Selesai Dibaca
  completeBtn.addEventListener("click", () => {
    const bookId = book.id;
    const userData = getUserList();

    // Cari buku berdasarkan ID
    const bookToUpdate = userData.find(user => user.id === bookId);

    if (bookToUpdate) {
      // Toggle status selesai dibaca
      bookToUpdate.selesaiDiBaca = !bookToUpdate.selesaiDiBaca;

      // Simpan perubahan ke localStorage
      localStorage.setItem(storageKey, JSON.stringify(userData));

      // Memperbarui tampilan buku di halaman
      const bookElement = document.querySelector(`[data-bookid="${bookId}"]`);
      const completeBtn = bookElement.querySelector("[data-testid='bookItemIsCompleteButton']");
      completeBtn.textContent = bookToUpdate.selesaiDiBaca ? "Belum selesai dibaca" : "Selesai dibaca";

      // Pindahkan buku ke list selesai atau belum selesai
      if (bookToUpdate.selesaiDiBaca) {
        completeList.appendChild(bookElement);
      } else {
        incompleteList.appendChild(bookElement);
      }
    }
  });

  // Fungsi untuk mencari buku berdasarkan judul
const searchBook = (searchQuery) => {
  // Ambil semua data buku dari localStorage
  const userData = getUserList();
  
  // Filter buku berdasarkan judul yang dicari, tanpa memperhatikan kapitalisasi
  const filteredBooks = userData.filter(book =>
    book.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kosongkan daftar buku yang ada di halaman sebelum menampilkan hasil pencarian
  const incompleteList = document.getElementById("incompleteBookList");
  const completeList = document.getElementById("completeBookList");

  incompleteList.innerHTML = '';
  completeList.innerHTML = '';

  // Render buku yang sesuai dengan pencarian
  filteredBooks.forEach(book => renderBook(book));
};

// Event listener untuk form pencarian
const searchForm = document.getElementById('searchBook');
searchForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  
  // Ambil query pencarian dari input
  const searchQuery = document.getElementById('searchBookTitle').value;
  
  // Panggil fungsi pencarian
  searchBook(searchQuery);
});

};


// Menangani form saat disubmit
ambilDataForm.addEventListener("submit", (ev) => {
  ev.preventDefault();

  const judul = document.getElementById("bookFormTitle").value;
  const penulis = document.getElementById("bookFormAuthor").value;
  const tahun = document.getElementById("bookFormYear").value;
  const selesaiDiBaca = document.getElementById("bookFormIsComplete").checked;

  const bookId = ambilDataForm.getAttribute("data-editing-book-id"); // Ambil ID buku yang sedang diedit

  const data = {
    id: bookId ? bookId : generateId(), // Jika sedang edit, gunakan ID buku yang sedang diedit
    judul,
    penulis,
    tahun,
    selesaiDiBaca
  };

  const userData = getUserList();

  if (bookId) {
    // Jika sedang dalam mode edit, update buku
    const bookToEdit = userData.find(user => user.id === bookId); // bookToEdit tereferensi langsung ke userData
    if (bookToEdit) {
      bookToEdit.judul = judul;
      bookToEdit.penulis = penulis;
      bookToEdit.tahun = tahun;
      bookToEdit.selesaiDiBaca = selesaiDiBaca;

      // Simpan perubahan ke localStorage
      localStorage.setItem(storageKey, JSON.stringify(userData));

      // Memperbarui tampilan buku di halaman
      // const bookElement = document.querySelector(`[data-bookid="${bookId}"]`);
      // bookElement.querySelector("[data-testid='bookItemTitle']").textContent = judul;
      // bookElement.querySelector("[data-testid='bookItemAuthor']").textContent = `Penulis: ${penulis}`;
      // bookElement.querySelector("[data-testid='bookItemYear']").textContent = `Tahun: ${tahun}`;
      // bookElement.querySelector("[data-testid='bookItemIsCompleteButton']").textContent = selesaiDiBaca ? "Selesai dibaca" : "Belum selesai dibaca";
      location.reload();
    }

    // Reset form setelah submit
    ambilDataForm.reset();
    ambilDataForm.removeAttribute("data-editing-book-id"); // Harus dihapus agar tidak membawa informasi pengeditan yang lama, agar jika saat ada pengeditan diberikutnya tidak konflik

    // Kembalikan teks tombol form
    const submitButton = document.getElementById("bookFormSubmit");
    submitButton.innerHTML = "Masukkan Buku ke rak <span>Belum selesai dibaca</span>";
  } else {
    // Jika tidak dalam mode edit, simpan buku baru
    insertList(data);
    renderBook(data);

    // Reset form setelah submit
    ambilDataForm.reset();
  }
});

// Menampilkan semua buku yang ada di localStorage
const renderBooks = () => {
  const userData = getUserList();
  for (let book of userData) {
    renderBook(book);
  }
};

// Ambil data buku dari localStorage
const getUserList = () => {
  if (checkForStorage()) {
    return JSON.parse(localStorage.getItem(storageKey)) || []; // Nilai fallback / Nilai cadangan jika parsing mereturn Null maka keluarkan array kosong
  } else {
    return [];
  }
};

// Saat halaman dimuat, tampilkan buku yang sudah ada di localStorage
window.addEventListener('load', function () {
  if (checkForStorage()) {
    if (localStorage.getItem(storageKey) !== null) {
      renderBooks(); // Render semua buku yang ada di localStorage
    }
  } else {
    alert('Browser yang Anda gunakan tidak mendukung Web Storage');
  }
});
