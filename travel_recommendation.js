const API_ENDPOINT = "travel_recommendation_api.json";

let travelData = {};

// Cache DOM elements
const elements = {
    input: document.getElementById("conditionInput"),
    results: document.getElementById("resultsContainer"),
    searchBtn: document.getElementById("btnSearch"),
    clearBtn: document.getElementById("btnClear")
};

// Load JSON data
async function initializeApp() {
    try {
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        travelData = await response.json();

    } catch (error) {
        console.error("Failed to load travel recommendations:", error);

        if (elements.results) {
            elements.results.innerHTML =
                '<p class="no-results">Unable to load travel recommendations.</p>';
        }
    }
}

// Search logic only
function searchRecommendations(keyword) {
    keyword = keyword.trim().toLowerCase();

    if (!keyword) return [];

    const results = [];

    const categories = {
        beach: travelData.beaches || [],
        beaches: travelData.beaches || [],
        temple: travelData.temples || [],
        temples: travelData.temples || []
    };

    // Category search
    for (const key in categories) {
        if (keyword.includes(key)) {
            return categories[key];
        }
    }

    // If the search term contains "country", return all cities from every country.
    if (keyword.includes("country")) {
        for (const country of travelData.countries || []) {
            results.push(...(country.cities || []));
        }
        return results;
    }

    // Country / City search
    for (const country of travelData.countries || []) {

        if (country.name.toLowerCase().includes(keyword)) {
            results.push(...(country.cities || []));
            continue;
        }

        for (const city of country.cities || []) {

            if (
                city.name.toLowerCase().includes(keyword) ||
                city.description.toLowerCase().includes(keyword)
            ) {
                results.push(city);
            }

        }

    }

    return results;
}

// Render UI
function renderResults(results) {

    elements.results.innerHTML = "";

    if (!results.length) {
        elements.results.innerHTML =
            '<p class="no-results">No recommendations found matching your search.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    for (const item of results) {

        const card = document.createElement("div");
        card.className = "result-card";

        const image = document.createElement("img");
        image.src = item.imageUrl;
        image.alt = item.name;
        image.loading = "lazy";

        const title = document.createElement("h3");
        title.textContent = item.name;

        const description = document.createElement("p");
        description.textContent = item.description;

        card.append(image, title, description);

        fragment.appendChild(card);
    }

    elements.results.appendChild(fragment);
}

// Search button
function handleSearch() {

    const keyword = elements.input.value;

    const results = searchRecommendations(keyword);

    renderResults(results);
}

// Clear button
function handleClear() {
    elements.input.value = "";
    elements.results.innerHTML = "";
}

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {

    // Update cached elements after DOM is ready
    elements.input = document.getElementById("conditionInput");
    elements.results = document.getElementById("resultsContainer");
    elements.searchBtn = document.getElementById("btnSearch");
    elements.clearBtn = document.getElementById("btnClear");

    // Disable search until data is loaded
    if (elements.searchBtn) {
        elements.searchBtn.disabled = true;
    }

    await initializeApp();

    // Enable search
    if (elements.searchBtn) {
        elements.searchBtn.disabled = false;
        elements.searchBtn.addEventListener("click", handleSearch);
    }

    elements.clearBtn?.addEventListener("click", handleClear);

    // Optional: Search when pressing Enter
    elements.input?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

});