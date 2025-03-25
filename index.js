// List of groceries with images
const groceries = [
    { name: "Apples", image: "/images/apples.png" },
    { name: "Bananas", image: "/images/bananas.png" },
    { name: "Carrots", image: "/images/carrots.png" },
    { name: "Tomatoes", image: "/images/tomatoes.png" },
    { name: "Milk", image: "/images/milk.png" }
];

let cart = []; // Cart array to store selected groceries

// Function to display groceries
function loadGroceries() {
    const groceryList = document.getElementById("groceryList");
    groceryList.innerHTML = "";

    groceries.forEach(grocery => {
        const item = document.createElement("div");
        item.classList.add("grocery-item");

        item.innerHTML = `
            <img src="${grocery.image}" alt="${grocery.name}">
            <p>${grocery.name}</p>
            <button class="add-to-cart" onclick="addToCart('${grocery.name}')">Add to Cart</button>
        `;

        groceryList.appendChild(item);
    });
}

// Add grocery to cart
function addToCart(itemName) {
    cart.push(itemName);
    updateCartCount();
}

// Update cart count in the navbar
function updateCartCount() {
    document.getElementById("cartCount").textContent = cart.length;
}

// Open Cart Modal
function openCart() {
    const cartModal = document.getElementById("cartModal");
    const cartItems = document.getElementById("cartItems");

    cartItems.innerHTML = ""; // Clear previous list

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cart.forEach((item, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${item} <button onclick="removeFromCart(${index})">Remove</button>`;
            cartItems.appendChild(li);
        });
    }

    cartModal.style.display = "block";
}

// Close Cart Modal
function closeCart() {
    document.getElementById("cartModal").style.display = "none";
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    openCart(); // Refresh cart view
}

// Checkout function
function checkout() {
    alert("Thank you for your order!");
    cart = []; // Clear cart
    updateCartCount();
    closeCart();
}

// Placeholder functions for login/signup
function login() {
    alert("Login functionality will be implemented here.");
}

function signUp() {
    alert("Sign-up functionality will be implemented here.");
}

// Load groceries when the page loads
document.addEventListener("DOMContentLoaded", loadGroceries);

// Function to get user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Success callback: Gets coordinates
function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    // Fetch the human-readable address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            const address = data.display_name;
            document.getElementById("userLocation").textContent = "📍 Your Location: " + address;
            
            // Now, fetch nearby groceries based on this location
            loadNearbyGroceries(lat, lon);
        })
        .catch(() => alert("Failed to get address."));
}

// Error callback
function error() {
    alert("Unable to retrieve location.");
}

// Load groceries near user
function loadNearbyGroceries(lat, lon) {
    const groceryList = document.getElementById("groceryList");
    groceryList.innerHTML = "<p>Finding stores near you...</p>";

    // Simulated nearby groceries (In a real app, fetch from backend)
    setTimeout(() => {
        const nearbyGroceries = [
            { name: "Local Market", image: "https://via.placeholder.com/100?text=Market", distance: "500m away" },
            { name: "Fresh Grocery", image: "https://via.placeholder.com/100?text=Fresh", distance: "1.2km away" },
            { name: "Organic Store", image: "https://via.placeholder.com/100?text=Organic", distance: "2km away" }
        ];
        
        groceryList.innerHTML = ""; // Clear previous list
        nearbyGroceries.forEach(store => {
            const item = document.createElement("div");
            item.classList.add("grocery-item");
            
            item.innerHTML = `
                <img src="${store.image}" alt="${store.name}">
                <p>${store.name} <small>(${store.distance})</small></p>
                <button class="add-to-cart" onclick="addToCart('${store.name}')">Add to Cart</button>
            `;

            groceryList.appendChild(item);
        });
    }, 2000); // Simulate API response delay
}
