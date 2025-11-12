#!/usr/bin/env node

/**
 * Simple API test script for Navbar Menu endpoints
 */

const BASE_URL = "http://localhost:3000/api/v1";

// Mock JWT token - you'll need to replace this with a real admin token
const ADMIN_TOKEN = "your-admin-jwt-token-here";

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ADMIN_TOKEN}`,
};

async function makeRequest(method, endpoint, body = null) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        console.log(`${method} ${endpoint}`);
        console.log(`Status: ${response.status}`);
        console.log("Response:", JSON.stringify(data, null, 2));
        console.log("---");

        return { response, data };
    } catch (error) {
        console.error(`Error ${method} ${endpoint}:`, error.message);
    }
}

async function testNavbarMenuAPI() {
    console.log("Testing Navbar Menu API Endpoints");
    console.log("===================================\n");

    // Test 1: Get all menus (should be empty initially)
    console.log("1. GET /navbar-menus");
    await makeRequest("GET", "/navbar-menus");

    // Test 2: Create a top-level menu
    console.log("2. POST /navbar-menus (Create top-level menu)");
    const createResult = await makeRequest("POST", "/navbar-menus", {
        title: "Home",
        slug: "home",
        url: "/",
        isActive: true,
        sortOrder: 0,
        target: "_self",
        description: "Homepage navigation link",
    });

    let homeMenuId;
    if (createResult && createResult.data && createResult.data.data) {
        homeMenuId = createResult.data.data.menuId;
    }

    // Test 3: Create a child menu
    if (homeMenuId) {
        console.log("3. POST /navbar-menus (Create child menu)");
        await makeRequest("POST", "/navbar-menus", {
            title: "About Us",
            slug: "about-us",
            url: "/about",
            parentId: homeMenuId,
            isActive: true,
            sortOrder: 0,
            target: "_self",
            description: "About us page",
        });
    }

    // Test 4: Get hierarchical structure
    console.log("4. GET /navbar-menus/hierarchical");
    await makeRequest("GET", "/navbar-menus/hierarchical");

    // Test 5: Update a menu
    if (homeMenuId) {
        console.log("5. PATCH /navbar-menus/:id (Update menu)");
        await makeRequest("PATCH", `/navbar-menus/${homeMenuId}`, {
            title: "Homepage",
            description: "Updated homepage navigation link",
        });
    }

    // Test 6: Toggle active status
    if (homeMenuId) {
        console.log("6. PATCH /navbar-menus/:id/toggle-active");
        await makeRequest("PATCH", `/navbar-menus/${homeMenuId}/toggle-active`);
    }

    // Test 7: Get single menu by ID
    if (homeMenuId) {
        console.log("7. GET /navbar-menus/:id");
        await makeRequest("GET", `/navbar-menus/${homeMenuId}`);
    }

    // Test 8: Search menus
    console.log("8. GET /navbar-menus?search=home");
    await makeRequest("GET", "/navbar-menus?search=home");

    console.log("\nAPI Testing Complete!");
    console.log(
        "\nNote: Replace ADMIN_TOKEN with a real JWT token to test authenticated endpoints."
    );
}

// Only run if called directly
if (require.main === module) {
    testNavbarMenuAPI().catch(console.error);
}

module.exports = { testNavbarMenuAPI };
