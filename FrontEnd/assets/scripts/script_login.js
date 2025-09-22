//----------------------------------------------------------------------
// Connexion via le formulaire
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const loginUrl = "http://127.0.0.1:5678/api/users/login";
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const credentials = {email, password};

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        alert("Erreur dans l’identifiant ou le mot de passe");
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      const data = await response.json();
      const token = data.token;

      console.log("Token :", token);
      localStorage.setItem("token", token);

      //alert("Connexion réussie");
      window.location.href = "home.html";

    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
    }
  });
});

