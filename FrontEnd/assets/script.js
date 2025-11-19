// recupération des travaux depuis l'API //

let works = []
let categories = []

fetch("http://localhost:5678/api/works")
  .then(response => response.json())
  .then(data => {
    works = data;
    displayWorks(works);
    console.log(works);
  })


fetch("http://localhost:5678/api/categories")
  .then(response => response.json())
  .then(data => {
    categories = data;
    console.log(categories);
    createFilterButtons(categories);
  })


// ajout des boutons de filtre //

const filterContainer = document.querySelector(".filters");

function createFilterButtons(categories) {

    // Bouton "Tous" pour afficher tous les travaux

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.addEventListener("click", () => displayWorks(works));
    filterContainer.appendChild(allButton); 

    // Boutons pour chaque catégorie

    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.addEventListener("click", () => {
            const filteredWorks = works.filter(work => work.categoryId === category.id);
            displayWorks(filteredWorks);
        });
        filterContainer.appendChild(button);
    });
}
//verification de la connexion //

const token = localStorage.getItem("token");
console.log("Token:", token);

if (token !=  null) {
  console.log("User is logged in");

    // Modification du lien de connexion en "logout"

    const logout = document.querySelector(".nav-login a");
    logout.textContent = "logout";
    logout.href = "#";
    logout.addEventListener("click", function(event) {
        event.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
      });

    // enlever les boutton filtres
    document.querySelector(".filters").style.display = "none";

    // Affichage d'un button de modification

    document.querySelector('.edit-header').style.display = 'flex';
    const modifierDiv = document.querySelector(".modifier");
    const modifierButton = document.createElement("button");
    const icon = document.createElement("i");
    modifierButton.className = "edit-button";
    icon.className = "fa-solid fa-pen-to-square";
    modifierButton.appendChild(icon);
    modifierButton.appendChild(document.createTextNode(" modifier"));
    modifierButton.href = "#";
    modifierDiv.appendChild(modifierButton);

      // Boîte modale pour modifier les images dans le if par securité//

      // Ouvre la modale gallery photo quand on clique sur le bouton "modifier"
      modifierButton.addEventListener('click', function() {
        document.getElementById('modal-edit').style.display = 'flex';
        displayModalImages(works); // Affiche les images dans la modale
        console.log("galleryImages:", works);
      });

      // change la modale pour l'ajout d'une photo quand on clique sur "ajouter une photo"
      document.querySelector('.add-image').addEventListener('click', function() {
        document.querySelector('.gallery-edit').style.display = 'none';
        document.querySelector('.gallery-add').style.display = 'flex';
        populateCategorySelect(categories); // Remplit le select des catégories
      });
      
      // Remplit le select des catégories dans la modale d'ajout d'image
      function populateCategorySelect(categories) {
        const select = document.getElementById("image-category");
        select.innerHTML = ""; // Vide le select

        categories.forEach(category => {
          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name;
          select.appendChild(option);
        });
      }

      
      const imageInput = document.getElementById('image-url');
      const imageUploadDiv = document.querySelector('.image-upload');

      imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
          // fais disparaitre l'icône, le texte et le bouton
        const existingIcon = imageUploadDiv.querySelector('.fa-image');
        existingIcon.style.display = 'none';

        const existingText = imageUploadDiv.querySelector('span');
        existingText.style.display = 'none';
        
        const existingButton = imageUploadDiv.querySelector('.image-url-button');
        existingButton.style.display = 'none';

          // Crée et affiche l'aperçu
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'image-preview';
        imageUploadDiv.insertBefore(img, imageUploadDiv.querySelector('.image-url-button'));
        }
      });

      // Retour à la modale gallery edit quand on clique sur la flèche
      document.querySelector('.back-arrow').addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector('.gallery-edit').style.display = 'flex';
        document.querySelector('.gallery-add').style.display = 'none';
        UploadImageReset()
      });

      // Gestion du formulaire d'ajout d'image

      const addImageForm = document.getElementById('add-image-form');

      addImageForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const imageFile = document.getElementById('image-url').files[0];
        const title = document.getElementById('image-title').value;
        const categoryId = document.getElementById('image-category').value;
        console.log("Image File:", imageFile);
        console.log("Title:", title);
        console.log("Category ID:", categoryId);

        // Envoie des données à l'API pour ajouter l'image

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('title', title );
        formData.append('category', parseInt(categoryId));
        // afficher le contenue du formdata

        console.log(formData.values())

        fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        })

        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to add image");
          }
          return response.json();
          })
          .then(work => {
            newWork = {
              "id": work.id,
              "title": work.title,
              "imageUrl": work.imageUrl,
              "categoryId": Number(work.categoryId),
              "userId": work.userId
            }

            console.log("Image added successfully:", newWork);
            works.push(newWork);
            displayWorks(works); // Met à jour la galerie principale
            displayModalImages(works); // Met à jour la galerie modale
            //ferme de la modale //
            modalexit()
          })
          .catch(error => {
          console.error("Error adding image:", error);
          });
        });

        // Ferme la modale quand on clique sur la croix
        document.querySelector('.modal .close').addEventListener('click', function() {
          modalexit()
        
      });

      // Ferme la modale si on clique en dehors du contenu
      window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal-edit');
        if (event.target === modal) {
          modalexit()
        }
      });

};

// affichage des images dans la modale //

function displayModalImages(works) {
    const galleryImages = document.querySelector('.gallery-images');
    galleryImages.innerHTML = ""; // Vide la galerie modale

    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.style.position = "relative";

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        img.style.width = "100px";
        img.style.height = "auto";

        // Bouton de suppression
        const deleteBtn = document.createElement("button");
        deleteBtn.className = `delete-button delete-${work.id}`;
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.addEventListener("click", function() {
            fetch(`http://localhost:5678/api/works/${work.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(response => {
                if (response.ok) {
                    console.log(`Work with ID ${work.id} deleted`);
                    // Met à jour les tableaux works et l'affichage
                    works.splice(works.indexOf(work.id), 1);
                    console.log("Updated works:", works);
                    displayWorks(works);
                    displayModalImages(works);
                } else {
                    throw new Error("Failed to delete work");
                } })
            .catch(error => console.error("Error:", error));

        });

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        galleryImages.appendChild(figure);
    });
}
// affichage des travaux dans la galerie //

const gallery = document.querySelector(".gallery");
function displayWorks(works) {
    gallery.innerHTML = "";
    works.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

// recupération du formulaire de connexion //

const loginForm = document.querySelector(".login-form");
loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value; 
    const password = document.getElementById("password").value;
    console.log("Email:", email);
    console.log("Password:", password);
      fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })})
        .then(response => {
          if (!response.ok) {
            // Gérer les erreurs de connexion//
            const inputs = loginForm.querySelectorAll('input[type="email"], input[type="password"]');
            inputs.forEach(input => input.style.borderColor = "red");
            const submitBtn = loginForm.querySelector('input[type="submit"]');
            const errorMessage = document.createElement("p");
            errorMessage.textContent = "Erreur dans l’identifiant ou le mot de passe";
            errorMessage.style.color = "red";

            loginForm.insertBefore(errorMessage, submitBtn);
            throw new Error("Login failed");

          } else {
            return response.json();
          }
          
      }).then(data => {
            console.log("Login successful:", data);
            connexion(data);
          })
    }
)

// fonction de connexion //

function connexion(data) {
    localStorage.setItem("token", data.token);
    window.location.href = "../index.html";
}

function modalexit (){

  UploadImageReset()

  // remet sur la fenetre modale par default
  document.querySelector('.gallery-edit').style.display = 'flex';
  document.querySelector('.gallery-add').style.display = 'none';

  //ferme la modale
  document.getElementById('modal-edit').style.display = 'none';
  document.querySelector('.gallery-edit').style.display = 'flex';
  document.querySelector('.gallery-add').style.display = 'none';

};

function UploadImageReset(){

  // retire le preview de l'image

  const preview = document.querySelector('.image-preview');
  if (preview) {
    preview.remove();
  }

  // Reinitailise le formulaire d'ajout d'image
  
  document.getElementById('add-image-form').reset();
  const imageUploadDiv = document.querySelector('.image-upload');
  const existingIcon = imageUploadDiv.querySelector('.fa-image');
  existingIcon.style.display = 'block';
  const existingText = imageUploadDiv.querySelector('span');
  existingText.style.display = 'block';
  const existingButton = imageUploadDiv.querySelector('.image-url-button');
  existingButton.style.display = 'block';
  
  
}; 