let allCocktails = [];

fetch("cocktail_list1.json")
  .then(response => response.json())
  .then(data => {
    allCocktails = data;
    populateCategoryDropdown(data);
    populateIngredientSelect(data); // 👈 Add this!
  });



function populateCategoryDropdown(cocktails) {
  const categorySelect = document.getElementById("categorySelect");

  // Extract unique categories
  const categories = [...new Set(cocktails.map(c => c.Category).filter(Boolean))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // When a category is selected, show the matching cocktails
  categorySelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;
    const filteredCocktails = allCocktails.filter(c => c.Category === selectedCategory);
    populateCocktailDropdown(filteredCocktails);
  });

  // Auto-select the first category
  categorySelect.value = categories[0];
  categorySelect.dispatchEvent(new Event("change"));
}

function populateCocktailDropdown(cocktails) {
  const drinkSelect = document.getElementById("drinkSelect");
  drinkSelect.innerHTML = ""; // Clear previous

  cocktails.forEach((cocktail, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = cocktail["Cocktail Name"];
    drinkSelect.appendChild(option);
  });

  // Show the first cocktail by default
  displayCocktail(cocktails[0]);

  // Change cocktail when user selects one
  drinkSelect.addEventListener("change", (e) => {
    const selectedIndex = e.target.value;
    displayCocktail(cocktails[selectedIndex]);
  });
}

function displayCocktail(cocktail) {
  const display = document.getElementById("cocktailDisplay");

  display.innerHTML = `
  <div class="card-content">
    <h2>${cocktail["Cocktail Name"]}</h2>

    <h3>Category:</h3>
    <ul><li>${cocktail["Category"] || "N/A"}</li></ul>

    <h3>Ingredients:</h3>
    <ul>
      ${Object.entries(cocktail)
        .filter(([key, value]) =>
          value &&
          value.trim() !== "" &&
          !["Cocktail Name", "Category", "Method", "Image"].includes(key)
        )
        .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
        .join("")}
    </ul>

    <h3>Method:</h3>
    <ul><li>${cocktail["Method"] || "N/A"}</li></ul>
  </div>

  ${cocktail["Image"] ? `<img src="${cocktail["Image"]}" alt="${cocktail["Cocktail Name"]}" class="cocktail-image" />` : ""}
`;
}

function displayIngredientResults(cocktails) {
  const resultsDiv = document.getElementById("ingredientResults");
  resultsDiv.innerHTML = "";

  if (cocktails.length === 0) {
    resultsDiv.innerHTML = "<p>No cocktails found with that ingredient.</p>";
    return;
  }

  cocktails.forEach(cocktail => {
    const div = document.createElement("div");
    div.className = "ingredient-result";

    div.innerHTML = `
      <h4>${cocktail["Cocktail Name"]}</h4>
      <p><em>${cocktail["Category"]}</em></p>
    `;

    div.addEventListener("click", () => {
      displayCocktail(cocktail); // reuse your existing function
    });

    resultsDiv.appendChild(div);
  });
}

function populateIngredientSelect(cocktails) {
  const ingredientSet = new Set();
  cocktails.forEach(cocktail => {
    Object.keys(cocktail).forEach(key => {
      const value = cocktail[key];
      if (!["Cocktail Name", "Category", "Method", "Image"].includes(key) && value) {
        ingredientSet.add(key);
      }
    });
  });

  const ingredientSelect = document.getElementById("ingredientSelect");
  ingredientSelect.innerHTML = '<option value="">-- Select an ingredient --</option>';

  [...ingredientSet].sort().forEach(ingredient => {
    const option = document.createElement("option");
    option.value = ingredient;
    option.textContent = ingredient;
    ingredientSelect.appendChild(option);
  });

  ingredientSelect.addEventListener("change", () => {
    const selectedIngredient = ingredientSelect.value;
    const matchingCocktails = cocktails.filter(cocktail => cocktail[selectedIngredient]?.trim() !== "");
    displayCocktailMatches(matchingCocktails);
  });
}

// Display matching cocktails
function displayCocktailMatches(matches) {
  const resultsDiv = document.getElementById("ingredientResults");
  resultsDiv.innerHTML = "";

  if (matches.length === 0) {
    resultsDiv.innerHTML = "<p>No cocktails found.</p>";
    return;
  }

  matches.forEach(cocktail => {
    const div = document.createElement("div");
    div.className = "ingredient-result";

    div.innerHTML = `
      <h4>${cocktail["Cocktail Name"]}</h4>
      <p>${cocktail["Category"]}</p>
    `;

    div.addEventListener("click", () => {
      selectCocktailFromIngredient(cocktail);
    });

    resultsDiv.appendChild(div);
  });
}

function selectCocktailFromIngredient(cocktail) {
  const categorySelect = document.getElementById("categorySelect");
  const drinkSelect = document.getElementById("drinkSelect");
  const ingredientSelect = document.getElementById("ingredientSelect");
  const ingredientResults = document.getElementById("ingredientResults");

  // Update category dropdown
  categorySelect.value = cocktail["Category"];

  // Trigger category change to update cocktail dropdown
  populateCocktailDropdown(allCocktails.filter(c => c["Category"] === cocktail["Category"]));

  // Update cocktail dropdown
  const matchedCocktail = allCocktails.filter(c => c["Cocktail Name"] === cocktail["Cocktail Name"]);
  if (matchedCocktail.length > 0) {
    drinkSelect.value = allCocktails.indexOf(matchedCocktail[0]);
  }

  // Display cocktail details
  displayCocktail(cocktail);

  // Reset ingredient dropdown to default
  ingredientSelect.value = "";

  // Clear ingredient results
  ingredientResults.innerHTML = "";
}


