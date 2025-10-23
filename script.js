// Fetch recipes and populate UI
async function loadRecipes() {
  const response = await fetch("./recipes.json");
  return response.json();
}

// Home Page Featured
if (document.getElementById("featured")) {
  loadRecipes().then(recipes => {
    const featuredContainer = document.getElementById("featured");
    const featured = recipes.slice(0, 3); // first 3 recipes
    featured.forEach(r => {
      featuredContainer.innerHTML += `
        <div class="recipe-card">
          <img src="${r.image}" alt="${r.name}">
          <div class="card-body">
            <h3>${r.name}</h3>
            <p>${r.description}</p>
            <div class="card-actions">
              <a href="recipe.html?id=${r.id}" class="btn">View</a>
            </div>
          </div>
        </div>
      `;
    });
  });
}

// Recipes Page
if (document.getElementById("recipes-list")) {
  const searchInput = document.getElementById("search");
  const filterSelect = document.getElementById("filter");

  loadRecipes().then(recipes => {
    function render(list) {
      const container = document.getElementById("recipes-list");
      container.innerHTML = "";
      if (list.length === 0) {
        container.innerHTML = "<p>No recipes found.</p>";
        return;
      }
      list.forEach(r => {
        container.innerHTML += `
          <div class="recipe-card">
            <img src="${r.image}" alt="${r.name}">
            <div class="card-body">
              <h3>${r.name}</h3>
              <p>${r.description}</p>
              <div class="card-actions">
                <a href="recipe.html?id=${r.id}" class="btn">View</a>
              </div>
            </div>
          </div>
        `;
      });
    }

    // initial
    render(recipes);

    // search + filter
    function filterRecipes() {
      const term = searchInput.value.toLowerCase();
      const category = filterSelect.value;
      const filtered = recipes.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(term);
        const matchesCategory = category === "all" || r.category === category;
        return matchesSearch && matchesCategory;
      });
      render(filtered);
    }

    searchInput.addEventListener("input", filterRecipes);
    filterSelect.addEventListener("change", filterRecipes);
  });
}

// Recipe Detail Page
if (document.getElementById("recipe-detail")) {
  const params = new URLSearchParams(window.location.search);
  const recipeId = parseInt(params.get("id"));
  const detailContainer = document.getElementById("recipe-detail");

  loadRecipes().then(recipes => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
      detailContainer.innerHTML = "<p>⚠️ Recipe not found.</p>";
      return;
    }

    detailContainer.innerHTML = `
      <section class="recipe-hero">
        <img src="${recipe.image}" alt="${recipe.name}">
        <div class="recipe-hero-text">
          <h1>${recipe.name}</h1>
          <p>${recipe.description}</p>
          <button id="fav-btn" class="btn">❤️ Add to Favorites</button>
        </div>
      </section>
      <section class="recipe-content">
        <div class="ingredients">
          <h2>📝 Ingredients</h2>
          <ul>
            ${recipe.ingredients.map(ing => `<li><input type="checkbox"> ${ing}</li>`).join("")}
          </ul>
        </div>
        <div class="steps">
          <h2>👨‍🍳 Cooking Steps</h2>
          <ol>
            ${recipe.steps.map(step => `<li>${step}</li>`).join("")}
          </ol>
        </div>
      </section>
    `;

    // favorites logic
    const favBtn = document.getElementById("fav-btn");
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let isFavorite = favorites.some(r => r.id === recipe.id);

    if (isFavorite) favBtn.textContent = "❌ Remove from Favorites";

    favBtn.addEventListener("click", () => {
      if (isFavorite) {
        favorites = favorites.filter(r => r.id !== recipe.id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        favBtn.textContent = "❤️ Add to Favorites";
        isFavorite = false;
      } else {
        favorites.push(recipe);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        favBtn.textContent = "❌ Remove from Favorites";
        isFavorite = true;
      }
    });
  });
}

// Favorites Page
if (document.getElementById("favorites-list")) {
  const favoritesContainer = document.getElementById("favorites-list");
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = `
      <div class="empty-state">
        <h2>No favorites yet</h2>
        <p>You haven’t saved any recipes yet. Browse <a href="recipes.html">recipes</a> and add some!</p>
      </div>
    `;
  } else {
    favorites.forEach(recipe => {
      favoritesContainer.innerHTML += `
        <div class="recipe-card">
          <img src="${recipe.image}" alt="${recipe.name}">
          <div class="card-body">
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
            <div class="card-actions">
              <a href="recipe.html?id=${recipe.id}" class="btn">View</a>
              <button class="btn btn-remove" data-id="${recipe.id}">Remove</button>
            </div>
          </div>
        </div>
      `;
    });

    favoritesContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-remove")) {
        const recipeId = parseInt(e.target.dataset.id);
        const updatedFavorites = favorites.filter(r => r.id !== recipeId);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        location.reload();
      }
    });
  }
}
