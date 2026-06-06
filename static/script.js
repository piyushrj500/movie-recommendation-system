@@ -0,0 +1,168 @@
const MOVIES = JSON.parse(document.body.dataset.movies);

const searchInput = document.getElementById("search");
const suggestionsBox = document.getElementById("suggestions");
const movieSelect = document.getElementById("movieSelect");
const results = document.getElementById("results");

/* ================= DROPDOWN CHANGE ================= */
movieSelect.addEventListener("change", () => {
    if (movieSelect.value) {
        // ✅ CLEAR SEARCH BAR WHEN DROPDOWN IS USED
        searchInput.value = "";
        suggestionsBox.style.display = "none";
    }
});


/* ================= TOAST ================= */
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.style.display = "block";
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.style.display = "none", 300);
    }, 2500);
}

/* ================= AUTOCOMPLETE ================= */
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";

    if (!query) {
        suggestionsBox.style.display = "none";
        return;
    }

    const matches = MOVIES
        .filter(m => m.toLowerCase().includes(query))
        .slice(0, 10);

    if (!matches.length) {
        suggestionsBox.style.display = "none";
        return;
    }

    matches.forEach(movie => {
        const div = document.createElement("div");
        div.className = "suggestion";
        div.innerText = movie;

        div.onclick = () => {
            searchInput.value = movie;
            movieSelect.value = movie;
            suggestionsBox.style.display = "none";
        };

        suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
});

/* HIDE AUTOCOMPLETE */
document.addEventListener("click", e => {
    if (!e.target.closest(".autocomplete")) {
        suggestionsBox.style.display = "none";
    }
});

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";

    // ✅ RESET DROPDOWN WHEN USER TYPES
    movieSelect.value = "";

    if (!query) {
        suggestionsBox.style.display = "none";
        return;
    }

    const matches = MOVIES
        .filter(m => m.toLowerCase().includes(query))
        .slice(0, 10);

    if (!matches.length) {
        suggestionsBox.style.display = "none";
        return;
    }

    matches.forEach(movie => {
        const div = document.createElement("div");
        div.className = "suggestion";
        div.innerText = movie;

        div.onclick = () => {
            // ✅ SET BOTH INPUT & DROPDOWN WHEN CLICKED
            searchInput.value = movie;
            movieSelect.value = movie;
            suggestionsBox.style.display = "none";
        };

        suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
});


/* ================= LOADING UI ================= */
function showLoading() {
    results.innerHTML = "";
    for (let i = 0; i < 5; i++) {
        const div = document.createElement("div");
        div.className = "skeleton";
        results.appendChild(div);
    }
}

/* ================= RECOMMEND ================= */
function getRecommendations() {
    const movie = movieSelect.value || searchInput.value.trim();

    if (!movie) {
        showToast("⚠️ Please select or search a movie");
        return;
    }

    if (!MOVIES.includes(movie)) {
        showToast("❌ Movie not found");
        return;
    }

    showLoading();
    results.scrollIntoView({ behavior: "smooth" });

    fetch("/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            showToast(data.error);
            results.innerHTML = "";
            return;
        }

        results.innerHTML = "";
        data.forEach(m => {
            results.innerHTML += `
                <div class="card">
                    <img src="${m.poster}">
                    <p>${m.title}</p>
                </div>
            `;
        });
    })
    .catch(() => {
        showToast("🚫 Network error. Try again.");
        results.innerHTML = "";
    });
}
