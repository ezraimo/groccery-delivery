// Constants
const NOMINATIM_API = "https://nominatim.openstreetmap.org/search";
const REVERSE_GEOCODING_API = "https://nominatim.openstreetmap.org/reverse";
const CART_STORAGE_KEY = "groceryCart";
const LOCATION_STORAGE_KEY = "deliveryLocation";

// DOM Elements
const domElements = {
    cartCount: document.getElementById("cartCount"),
    deliveryLocation: document.getElementById("deliveryLocation"),
    locationInput: document.getElementById("locationInput"),
    locationSuggestions: document.getElementById("locationSuggestions"),
    userLocation: document.getElementById("userLocation"),
    groceryList: document.getElementById("groceryList"),
    cartModal: document.getElementById("cartModal"),
    cartItems: document.getElementById("cartItems"),
    cartTotal: document.getElementById("cartTotal"),
    roleModal: document.getElementById("roleModal"),
    sellerSignupModal: document.getElementById("sellerSignupModal"),
    sellerSignupForm: document.getElementById("sellerSignupForm")
};

// Sample grocery data
const groceries = [
    { id: "1", name: "Apples", price: 2.50, image: "images/apples.png" },
    { id: "2", name: "Bananas", price: 1.20, image: "images/bananas.png" },
    { id: "3", name: "Milk", price: 3.00, image: "images/milk.png" },
    { id: "4", name: "Bread", price: 2.00, image: "images/bread.png" },
    { id: "5", name: "Tomatoes", price: 1.80, image: "images/tomatoes.png" },
    { id: "6", name: "Potatoes", price: 2.30, image: "images/potatoes.png" },
    { id: "7", name: "Carrots", price: 1.50, image: "images/carrots.png" },
    { id: "8", name: "Chicken", price: 5.00, image: "images/chicken.png" },
    { id: "9", name: "Rice", price: 4.50, image: "images/rice.png" },
    { id: "10", name: "Eggs", price: 2.80, image: "images/eggs.png" },
    { id: "11", name: "Cheese", price: 3.60, image: "images/cheese.png" },
    { id: "12", name: "Oranges", price: 2.40, image: "images/oranges.png" }
];

// Application State
const state = {
    cart: loadCart(),
    searchTimeout: null
};

// Initialize the application
function init() {
    displayGroceries();
    updateCartCount();
    setupEventListeners();
    loadSavedLocation();
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : {};
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
}

// Load saved location from localStorage
function loadSavedLocation() {
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (savedLocation) {
        domElements.deliveryLocation.value = savedLocation;
    }
}

// Save location to localStorage
function saveLocation(location) {
    localStorage.setItem(LOCATION_STORAGE_KEY, location);
}

// Setup all event listeners
function setupEventListeners() {
    // Location search with debounce
    domElements.deliveryLocation.addEventListener("input", (e) => {
        clearTimeout(state.searchTimeout);
        state.searchTimeout = setTimeout(() => {
            searchLocation(e.target.value);
        }, 300);
    });

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === domElements.cartModal) {
            closeCart();
        }
        if (e.target === domElements.roleModal) {
            closeModal();
        }
        if (e.target === domElements.sellerSignupModal) {
            closeSellerSignup();
        }
    });

    // Seller signup form submission
    domElements.sellerSignupForm.addEventListener("submit", handleSellerSignup);
}

// Display grocery items
function displayGroceries() {
    domElements.groceryList.innerHTML = "";

    groceries.forEach(item => {
        const itemQty = state.cart[item.id] || 0;
        const groceryItem = document.createElement("div");
        groceryItem.classList.add("grocery-item");
        groceryItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='images/default-product.png'">
            <h3>${item.name}</h3>
            <p>Kes ${item.price.toFixed(2)}</p>
            <div class="quantity-controls">
                <button onclick="updateCart('${item.id}', -1)" aria-label="Decrease quantity">-</button>
                <span id="qty-${item.id}">${itemQty}</span>
                <button onclick="updateCart('${item.id}', 1)" aria-label="Increase quantity">+</button>
            </div>
        `;
        domElements.groceryList.appendChild(groceryItem);
    });
}

// Update cart quantity
function updateCart(itemId, change) {
    if (!state.cart[itemId]) state.cart[itemId] = 0;
    state.cart[itemId] += change;

    if (state.cart[itemId] < 0) state.cart[itemId] = 0;

    document.getElementById(`qty-${itemId}`).textContent = state.cart[itemId];
    updateCartCount();
    saveCart();
}

// Update cart count display
function updateCartCount() {
    const totalItems = Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
    domElements.cartCount.textContent = totalItems;
}

// Open cart modal
function openCart() {
    domElements.cartItems.innerHTML = "";
    let total = 0;

    Object.keys(state.cart).forEach(itemId => {
        if (state.cart[itemId] > 0) {
            const item = groceries.find(g => g.id === itemId);
            const itemTotal = item.price * state.cart[itemId];
            total += itemTotal;

            const listItem = document.createElement("li");
            listItem.innerHTML = `
                ${item.name} - Kes ${item.price.toFixed(2)} x ${state.cart[itemId]}
                <button class="remove-item" data-id="${item.id}" aria-label="Remove item">Remove</button>
            `;
            domElements.cartItems.appendChild(listItem);
        }
    });

    domElements.cartTotal.textContent = total.toFixed(2);
    domElements.cartModal.style.display = "block";

    // Attach event listeners to remove buttons
    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", function() {
            const itemId = this.getAttribute("data-id");
            updateCart(itemId, -state.cart[itemId]);
            openCart();
        });
    });
}

// Close cart modal
function closeCart() {
    domElements.cartModal.style.display = "none";
}

// Checkout function
function checkout() {
    if (Object.values(state.cart).every(qty => qty === 0)) {
        alert("Your cart is empty!");
        return;
    }

    if (!domElements.deliveryLocation.value) {
        alert("Please enter a delivery location");
        return;
    }

    // In a real app, this would process payment and create an order
    alert(`Order placed! Total: Kes ${domElements.cartTotal.textContent}`);
    state.cart = {};
    saveCart();
    updateCartCount();
    closeCart();
    displayGroceries(); // Reset quantities
}

// Location functions
async function getLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude: lat, longitude: lon } = position.coords;
        const locationName = await getLocationName(lat, lon);
        
        domElements.userLocation.setAttribute("data-lat", lat);
        domElements.userLocation.setAttribute("data-lon", lon);
        domElements.userLocation.textContent = `📍 ${locationName}`;
        domElements.deliveryLocation.value = locationName;
        saveLocation(locationName);
    } catch (error) {
        console.error("Location error:", error);
        alert("Could not get your location. Please enter it manually.");
    }
}

async function getLocationName(lat, lon) {
    try {
        const response = await fetch(`${REVERSE_GEOCODING_API}?format=json&lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        return data.display_name?.split(",")[0] || "Current Location";
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return "Unknown Location";
    }
}

function showOnMap() {
    const lat = domElements.userLocation.getAttribute("data-lat");
    const lon = domElements.userLocation.getAttribute("data-lon");

    if (lat && lon) {
        window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank");
    } else {
        alert("Location not available. Please enable location access.");
    }
}

async function shareLocation() {
    const lat = domElements.userLocation.getAttribute("data-lat");
    const lon = domElements.userLocation.getAttribute("data-lon");

    if (!lat || !lon) {
        alert("Location not available. Please enable location access.");
        return;
    }

    const locationUrl = `https://www.google.com/maps?q=${lat},${lon}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: "My Location",
                text: "Here is my current location:",
                url: locationUrl
            });
        } catch (err) {
            console.error("Sharing failed:", err);
        }
    } else {
        // Fallback for browsers without Web Share API
        prompt("Copy this link:", locationUrl);
    }
}

// Location search and suggestions
async function searchLocation(query) {
    if (query.length < 3) {
        domElements.locationSuggestions.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`${NOMINATIM_API}?format=json&q=${query}`);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        showSuggestions(data);
    } catch (error) {
        console.error("Location search error:", error);
        domElements.locationSuggestions.innerHTML = "<li>Error loading locations</li>";
    }
}

function showSuggestions(locations) {
    domElements.locationSuggestions.innerHTML = "";

    if (!locations.length) {
        domElements.locationSuggestions.innerHTML = "<li>No locations found</li>";
        return;
    }

    locations.forEach(location => {
        const li = document.createElement("li");
        li.textContent = location.display_name;
        li.setAttribute("data-lat", location.lat);
        li.setAttribute("data-lon", location.lon);
        li.onclick = () => selectLocation(location);
        domElements.locationSuggestions.appendChild(li);
    });
}

function selectLocation(location) {
    domElements.deliveryLocation.value = location.display_name;
    domElements.deliveryLocation.setAttribute("data-lat", location.lat);
    domElements.deliveryLocation.setAttribute("data-lon", location.lon);
    saveLocation(location.display_name);
    domElements.locationSuggestions.innerHTML = "";
}

// Role selection functions
function openRoleSelection() {
    domElements.roleModal.style.display = "block";
}

function closeModal() {
    domElements.roleModal.style.display = "none";
}

function showSellerSignup() {
    closeModal();
    domElements.sellerSignupModal.style.display = "block";
}

function closeSellerSignup() {
    domElements.sellerSignupModal.style.display = "none";
}

function navigateToSignup(role) {
    window.location.href = role === "buyer" ? "signup_buyer.html" : "signup_seller.html";
}

// Seller signup handler
async function handleSellerSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    // Simple validation
    if (!formData.get("sellerName") || !formData.get("sellerEmail")) {
        alert("Please fill in all required fields");
        return;
    }

    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = "Registering...";
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store seller data (in a real app, this would be an API call)
        localStorage.setItem("sellerData", JSON.stringify({
            name: formData.get("sellerName"),
            email: formData.get("sellerEmail"),
            phone: formData.get("sellerPhone"),
            kiosk: formData.get("kioskName")
        }));
        
        alert("Registration successful! Redirecting to seller dashboard...");
        window.location.href = "seller.html";
    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration failed. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Register";
    }
}

// Start ordering function
function startOrdering() {
    const searchQuery = domElements.locationInput.value.trim();
    const location = domElements.deliveryLocation.value.trim();
    
    if (!searchQuery && !location) {
        alert("Please enter a search term or delivery location");
        return;
    }
    
    // In a real app, this would filter or fetch groceries
    console.log(`Starting order - Search: "${searchQuery}", Location: "${location}"`);
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);


// Seller signup handler
async function handleSellerSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get form values
    const sellerData = {
        name: document.getElementById("sellerName").value.trim(),
        phone: document.getElementById("sellerPhone").value.trim(),
        email: document.getElementById("sellerEmail").value.trim(),
        kiosk: document.getElementById("kioskName").value.trim()
    };

    // Validate all fields
    if (!sellerData.name || !sellerData.phone || !sellerData.email || !sellerData.kiosk) {
        alert("Please fill in all required fields");
        return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerData.email)) {
        alert("Please enter a valid email address");
        return;
    }

    // Validate phone number
    if (!/^[0-9]{10,15}$/.test(sellerData.phone)) {
        alert("Please enter a valid phone number (10-15 digits)");
        return;
    }

    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = "Registering...";
        
        // Simulate API call (replace with actual API call in production)
        await registerSeller(sellerData);
        
        // Redirect to seller dashboard
        window.location.href = "seller-dashboard.html";
    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration failed. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Register";
    }
}

// Simulate API call to register seller
async function registerSeller(sellerData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Store seller data in localStorage
            localStorage.setItem("sellerAuth", JSON.stringify({
                isAuthenticated: true,
                seller: sellerData,
                lastLogin: new Date().toISOString()
            }));
            resolve();
        }, 1500); // Simulate network delay
    });
}


// Function to open the login role selection modal
function openLoginModal() {
    document.getElementById("loginRoleModal").style.display = "block";
}

// Function to close the login role selection modal
function closeLoginModal() {
    document.getElementById("loginRoleModal").style.display = "none";
}

// Function to show either the buyer or seller dashboard
function showDashboard(role) {
    if (role === 'buyer') {
        window.location.href = 'buyer.html';  // Redirect to buyer.html
    } else if (role === 'seller') {
        window.location.href = 'seller.html';  // Redirect to seller.html (if needed)
    }
}


// Attach the login button to open the modal
document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".auth-btn");
    if (loginButton) {
        loginButton.onclick = openLoginModal;
    }
});



document.addEventListener("DOMContentLoaded", function () {
    const notificationsList = document.getElementById("notifications-list");
    const ordersList = document.getElementById("orders-list");

    // Example notifications
    const notifications = [
        "Your order has been shipped!",
        "Price drop alert on Apples 🍏",
        "New store added near you!"
    ];

    // Example orders
    const orders = [
        "Bananas 🍌 - Delivered",
        "Carrots 🥕 - In Transit",
        "Apples 🍏 - Pending"
    ];

    // Load notifications
    notificationsList.innerHTML = "";
    notifications.forEach(notification => {
        const li = document.createElement("li");
        li.textContent = notification;
        notificationsList.appendChild(li);
    });

    // Load orders
    ordersList.innerHTML = "";
    orders.forEach(order => {
        const li = document.createElement("li");
        li.textContent = order;
        ordersList.appendChild(li);
    });
});



