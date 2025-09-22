//----------------------------------------------------------------------
// Récupération et affichage des oeuvres et catégories
async function initGallery() {
  try {
    // Récupérer les oeuvres
    const worksResponse = await fetch("http://127.0.0.1:5678/api/works");
    if (!worksResponse.ok) throw new Error(`Erreur HTTP (works) : ${worksResponse.status}`);
    const works = await worksResponse.json();

    // Récupérer les catégories
    const categoriesResponse = await fetch("http://127.0.0.1:5678/api/categories");
    if (!categoriesResponse.ok) throw new Error(`Erreur HTTP (categories) : ${categoriesResponse.status}`);
    const categories = await categoriesResponse.json();

    // Supprimer les doublons de catégories
    const uniqueCategories = [...new Map(categories.map(cat => [cat.id, cat])).values()];

    // Afficher les oeuvres
    displayWorks(works);

    // Afficher les filtres
    displayCategories(uniqueCategories, works);

  } catch (error) {
    console.error("Erreur lors de l'initialisation :", error);
  }
}

//----------------------------------------------------------------------
// Affichage des oeuvres
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  works.forEach(({ imageUrl, title }) => {
    const figure = document.createElement("figure");
    figure.innerHTML = `<img src="${imageUrl}" alt="${title}"><figcaption>${title}</figcaption>`;
    gallery.appendChild(figure);
  });
}

//----------------------------------------------------------------------
// Affichage des catégories et filtres
function displayCategories(categories, works) {
  const container = document.querySelector(".container-filter");
  container.innerHTML = "";

  const setActive = button => {
    container.querySelectorAll(".button-filter").forEach(btn => btn.classList.remove("active-filter"));
    button.classList.add("active-filter");
  };

  // Bouton "Tous"
  const allButton = document.createElement("button");
  allButton.className = "button-filter";
  allButton.textContent = "Tous";
  allButton.onclick = () => { displayWorks(works); setActive(allButton); };
  container.appendChild(allButton);

  // Boutons par catégorie
  categories.forEach(({ id, name }) => {
    const btn = document.createElement("button");
    btn.className = "button-filter";
    btn.textContent = name;
    btn.onclick = () => { displayWorks(works.filter(w => w.categoryId === id)); setActive(btn); };
    container.appendChild(btn);
  });

  setActive(allButton);
}

//----------------------------------------------------------------------
// Lancer l'initialisation
initGallery();


//----------------------------------------------------------------------
// Détecte la page active et créé la class active sur le a actif
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll("nav a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
});


//------------------------------------------------------------------
// Initialisation de l’état login/logout
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const modeEditBar = document.querySelector(".bar_edit");
    const btnModifier = document.querySelector(".btn_modifier");
    const loginLogoutLink = document.getElementById("login-logout");
    const filters = document.querySelector(".container-filter");

    if (token) {
        // Si utilisateur connecté alors on affiche édition
        modeEditBar.style.display = "flex";
        btnModifier.style.display = "inline-block";
        filters.style.display = "none";

        // Transformation login/logout
        loginLogoutLink.textContent = "logout";
        loginLogoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    } else {
        // Si utilisateur déconnecté alors on cache édition
        modeEditBar.style.display = "none";
        btnModifier.style.display = "none";
        filters.style.display = "flex"

        // Lien reste "login"
        loginLogoutLink.textContent = "login";
        loginLogoutLink.setAttribute("href", "login.html");
    }
});

//------------------------------------------------------------------
// Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "home.html";
}

//------------------------------------------------------------------
// Modale
const modal = document.getElementById('modal_gallery');
const closeBtn = modal?.querySelector('.close');
const modalImagesContainer = modal?.querySelector('.modal-images');
const btnModifier = document.querySelector('.btn_modifier');

// Récupération des oeuvres
async function fetchWorks() {
    try {
        const res = await fetch("http://127.0.0.1:5678/api/works");
        if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("Erreur lors de la récupération des oeuvres :", err);
        return [];
    }
}

// Affichage des oeuvres dans la modale
function displayWorksInModal(works) {
    modalImagesContainer.innerHTML = "";
    works.forEach(({ imageUrl, title }) => {
        const figure = document.createElement("figure");
        figure.innerHTML = `<img src="${imageUrl}" alt="${title}">`;
        modalImagesContainer.appendChild(figure);
    });
}

// Bouton "modifier"
btnModifier?.addEventListener('click', async () => {
    const works = await fetchWorks();
    displayWorksInModal(works);
    modal.style.display = 'block';
});

// Ferme la modale
closeBtn?.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});
