// Initialize data from localStorage or default values
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let ticketHistory = JSON.parse(localStorage.getItem('ticketHistory')) || [];
let currentEditingTicketId = null;  // To track the ticket being edited
const ticketsPerPage = 10;
let currentPage = 1; // Start on page 1

// Show login page (admin or user)
function showLoginPage(role) {
    if (role === 'admin') {
        document.getElementById("adminLoginForm").classList.remove("hidden");
        document.getElementById("welcomePage").classList.add("hidden");
        document.getElementById("userLoginForm").classList.add("hidden");
        document.getElementById("userRegisterForm").classList.add("hidden");
    } else {
        document.getElementById("userLoginForm").classList.remove("hidden");
        document.getElementById("welcomePage").classList.add("hidden");
        document.getElementById("adminLoginForm").classList.add("hidden");
        document.getElementById("userRegisterForm").classList.add("hidden");
    }
}

// Show user registration page
function showUserRegisterPage() {
    document.getElementById("userRegisterForm").classList.remove("hidden");
    document.getElementById("welcomePage").classList.add("hidden");
    document.getElementById("adminLoginForm").classList.add("hidden");
    document.getElementById("userLoginForm").classList.add("hidden");
}

// Cancel login and go back to the welcome page
function cancelLogin() {
    document.getElementById("adminLoginForm").classList.add("hidden");
    document.getElementById("userLoginForm").classList.add("hidden");
    document.getElementById("userRegisterForm").classList.add("hidden");
    document.getElementById("welcomePage").classList.remove("hidden");
}

// Admin and User login function
function login(role) {
    if (role === 'admin') {
        const email = document.getElementById("adminEmail").value;
        const password = document.getElementById("adminPassword").value;
        if (email === 'a@.com' && password === 'zaq1') {
            currentUser = { email, role: 'admin' };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAdminDashboard();
        } else {
            alert('Invalid admin credentials');
        }
    } else if (role === 'user') {
        const email = document.getElementById("userEmail").value;
        const password = document.getElementById("userPassword").value;
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showUserDashboard();
        } else {
            alert('Invalid user credentials');
        }
    }
}

// Handle user registration
function registerUser() {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        alert('User with this email already exists');
        return;
    }

    // Create a new user
    const newUser = { email, password, role: 'user' };

    // Save the user to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Show success message and redirect to login
    alert('Registration successful! Please log in.');
    showLoginPage('user');
}

// Show Admin Dashboard
function showAdminDashboard() {
    document.getElementById("adminDashboard").classList.remove("hidden");
    document.getElementById("adminLoginForm").classList.add("hidden");
    document.getElementById("userLoginForm").classList.add("hidden");
    displayAdminTickets();
}

// Show User Dashboard
function showUserDashboard() {
    document.getElementById("userDashboard").classList.remove("hidden");
    document.getElementById("userLoginForm").classList.add("hidden");
    displayUserTickets();
}

// Show ticket history for a particular ticket (Admin or User)
function showTicketHistory(ticketId) {

    
    const ticketHistoryPage = document.getElementById("ticketHistoryPage");
    const ticketHistoryList = document.getElementById("ticketHistoryList");

    // Filter history for the selected ticket
    const ticketActions = ticketHistory.filter(entry => entry.ticketId === ticketId);

    // Clear the history before displaying new data
    ticketHistoryList.innerHTML = "";

    // If no history is found, show a "No history" message
    if (ticketActions.length === 0) {
        ticketHistoryList.innerHTML = "<tr><td colspan='5'>No history available for this ticket.</td></tr>";
    } else {
        // Loop through the ticket history and display it in the table
        ticketActions.forEach(entry => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${entry.ticketId}</td>
                <td>${entry.action}</td>
                <td>${entry.user}</td>
                <td>${entry.timestamp}</td>
                <td><button onclick="deleteHistoryEntry(${entry.ticketId}, '${entry.timestamp}')">Delete</button></td>
            `;
            ticketHistoryList.appendChild(row);
        });
    }

    // Show the ticket history page and hide the other dashboards
    ticketHistoryPage.classList.remove("hidden");
    document.getElementById("adminDashboard").classList.add("hidden");
    document.getElementById("userDashboard").classList.add("hidden");
}

// Function to delete a specific history entry
function deleteHistoryEntry(ticketId, actionTimestamp) {
    // Filter out the history entry with the matching ticketId and timestamp
    ticketHistory = ticketHistory.filter(entry => !(entry.ticketId === ticketId && entry.timestamp === actionTimestamp));
    
    // Save the updated history to localStorage
    localStorage.setItem('ticketHistory', JSON.stringify(ticketHistory));
    
    // Refresh the ticket history display
    showTicketHistory(ticketId);  // Refresh the history list for the ticket
}

// Back to Dashboard from History Page (Admin)
function backToAdminDashboard() {
    const ticketHistoryPage = document.getElementById("ticketHistoryPage");
    const adminDashboard = document.getElementById("adminDashboard");

    // Hide the ticket history page and show the admin dashboard
    ticketHistoryPage.classList.add("hidden");
    adminDashboard.classList.remove("hidden");
}

// Back to Dashboard from History Page (User)
function backToUserDashboard() {
    const ticketHistoryPage = document.getElementById("ticketHistoryPage");
    const userDashboard = document.getElementById("userDashboard");

    // Hide the ticket history page and show the user dashboard
    ticketHistoryPage.classList.add("hidden");
    userDashboard.classList.remove("hidden");
}


// Allow Admin to Add Comment to a Ticket
function addAdminComment(ticketId) {
    const comment = prompt("Enter your comment:");
    if (comment) {
        const timestamp = new Date().toLocaleString();
        const entry = {
            ticketId,
            action: comment,
            user: currentUser.email,
            timestamp,
        };

        // Push comment to ticket history
        ticketHistory.push(entry);
        localStorage.setItem('ticketHistory', JSON.stringify(ticketHistory));

        // Show success message
        alert("Comment added successfully!");

        // Refresh the ticket list to reflect changes
        displayAdminTickets();
    }
}



// Back to Dashboard from History Page (Updated)
function backToDashboard() {
    // Hide the Ticket History Page
    document.getElementById("ticketHistoryPage").classList.add("hidden");

    // Check if currentUser exists and show the correct dashboard
    if (currentUser && currentUser.role === 'admin') {
        document.getElementById("adminDashboard").classList.remove("hidden");
    } else if (currentUser && currentUser.role === 'user') {
        document.getElementById("userDashboard").classList.remove("hidden");
    }
}

// Function to show the Admin Dashboard
function showAdminDashboard() {
    document.getElementById("adminDashboard").classList.remove("hidden");
    document.getElementById("adminLoginForm").classList.add("hidden");
    document.getElementById("userLoginForm").classList.add("hidden");
    displayAdminTickets();
}

// Function to show the User Dashboard
function showUserDashboard() {
    document.getElementById("userDashboard").classList.remove("hidden");
    document.getElementById("userLoginForm").classList.add("hidden");
    displayUserTickets();
}

// Change ticket status (open/closed)
function changeTicketStatus(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Toggle status between "Open" and "Closed"
    ticket.status = ticket.status === "Open" ? "Closed" : "Open";

    // Add an entry to the ticket history for the status change
    const timestamp = new Date().toLocaleString();
    const historyEntry = {
        ticketId: ticket.id,
        action: `Ticket status changed to ${ticket.status}`,
        user: currentUser.email,
        timestamp
    };
    ticketHistory.push(historyEntry);
    localStorage.setItem('ticketHistory', JSON.stringify(ticketHistory));

    // Save the updated tickets list
    localStorage.setItem('tickets', JSON.stringify(tickets));

    // Refresh the ticket list for both Admin and User dashboards
    displayAdminTickets();
    displayUserTickets();
}


// Display admin tickets
// Function to display admin tickets with pagination
function displayAdminTickets() {
    const ticketList = document.getElementById("ticketList");
    ticketList.innerHTML = ""; // Clear the table before displaying new tickets

    // Filter open and closed tickets separately
    const openTickets = tickets.filter(ticket => ticket.status === "Open");
    const closedTickets = tickets.filter(ticket => ticket.status === "Closed");
    
    // Sort tickets by ID (Assuming higher IDs are added later)
    openTickets.sort((a, b) => a.id - b.id);
    closedTickets.sort((a, b) => a.id - b.id);

    // Combine open and closed tickets for pagination
    const allTickets = [...openTickets, ...closedTickets];

    // Calculate start and end indices based on the current page
    const startIdx = (currentPage - 1) * ticketsPerPage;
    const endIdx = startIdx + ticketsPerPage;
    const ticketsToShow = allTickets.slice(startIdx, endIdx);

    // Render tickets
    ticketsToShow.forEach(ticket => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.title}</td>
            <td>${ticket.priority}</td>
            <td>${ticket.status}</td>
            <td>${ticket.user}</td>
            <td>${ticket.description}</td> <!-- Added description -->
            <td><button onclick="addAdminComment(${ticket.id})">Add Comment</button></td>
            <td><button onclick="changeTicketStatus(${ticket.id})">${ticket.status === "Closed" ? "Reopen Ticket" : "Close Ticket"}</button>
            <td><button onclick="showTicketHistory(${ticket.id})">Show Ticket History</button></td>
            </td><td><button class="delete" onclick="deleteTicket(${ticket.id})">Delete</button></td>
        `;
        ticketList.appendChild(row);
    });

    // Update pagination controls
    updatePaginationControls(allTickets.length);
}

// Function to display user tickets with pagination
function displayUserTickets() {
    const userTicketList = document.getElementById("userTicketList");
    userTicketList.innerHTML = ""; // Clear the table before displaying new tickets

    // Get tickets for the current user
    const userTickets = tickets.filter(ticket => ticket.user === currentUser.email);

    // Calculate start and end indices based on the current page
    const startIdx = (currentPage - 1) * ticketsPerPage;
    const endIdx = startIdx + ticketsPerPage;
    const ticketsToShow = userTickets.slice(startIdx, endIdx);

    // Render tickets
    ticketsToShow.forEach(ticket => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.title}</td>
            <td>${ticket.status}</td>
            <td><button onclick="showTicketHistory(${ticket.id})">View Comments</button></td>
            <td><button onclick="editTicket(${ticket.id})">Edit</button></td>
            <td><button class="delete" onclick="deleteTicket(${ticket.id})">Delete</button></td>
        `;
        userTicketList.appendChild(row);
    });

    // If no tickets are found, show a message
    if (ticketsToShow.length === 0) {
        userTicketList.innerHTML = "<tr><td colspan='5'>No tickets found.</td></tr>";
    }

    // Update pagination controls
    updatePaginationControls(userTickets.length);
}

function backToDashboard() {
    // Hide the Ticket History Page
    document.getElementById("ticketHistoryPage").classList.add("hidden");

    // Show the appropriate dashboard (Admin or User)
    if (currentUser && currentUser.role === 'admin') {
        document.getElementById("adminDashboard").classList.remove("hidden");
    } else if (currentUser && currentUser.role === 'user') {
        document.getElementById("userDashboard").classList.remove("hidden");
    }
}

// Display user tickets
function displayUserTickets() {
    const userTicketList = document.getElementById("userTicketList");
    userTicketList.innerHTML = ""; // Clear the table before displaying new tickets

    // Get tickets for the current user
    const userTickets = tickets.filter(ticket => ticket.user === currentUser.email);

    if (userTickets.length === 0) {
        userTicketList.innerHTML = "<tr><td colspan='5'>No tickets found.</td></tr>";
    } else {
        userTickets.forEach(ticket => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${ticket.id}</td>
                <td>${ticket.title}</td>
                <td>${ticket.status}</td>
                <td><button onclick="showTicketHistory(${ticket.id})">View Comments</button></td>
                <td><button onclick="editTicket(${ticket.id})">Edit</button></td>
                <td><button class="delete" onclick="deleteTicket(${ticket.id})">Delete</button></td>
            `;
            userTicketList.appendChild(row);
        });
    }
}

// Cancel ticket form (go back to the dashboard)
function cancelTicketForm() {
    document.getElementById("ticketForm").classList.add("hidden");
    document.getElementById("adminDashboard").classList.remove("hidden");
    document.getElementById("userDashboard").classList.remove("hidden");
}

// Submit or Update Ticket
function submitOrUpdateTicket() {
    const title = document.getElementById("ticketTitle").value;
    const description = document.getElementById("ticketDescription").value;
    const priority = document.getElementById("ticketPriority").value;

    let newTicket;

    if (currentEditingTicketId !== null) {
        const ticket = tickets.find(t => t.id === currentEditingTicketId);
        if (!ticket) {
            console.error("Ticket not found for ID: " + currentEditingTicketId);
            return;
        }
        ticket.title = title;
        ticket.description = description;
        ticket.priority = priority;
        ticket.status = "Open";  // Reset status to Open when editing
        newTicket = ticket;  // Update the existing ticket object
        currentEditingTicketId = null;  // Clear editing state
    } else {
        newTicket = {
            id: tickets.length + 1,
            title,
            description,
            priority,
            status: "Open",
            user: currentUser ? currentUser.email : 'unknown'
        };
        tickets.push(newTicket);
    }

    // Add an entry to the ticket history (for the Admin to see)
    const timestamp = new Date().toLocaleString();
    const historyEntry = {
        ticketId: newTicket.id,
        action: `Ticket created by ${currentUser.email}`,
        user: currentUser.email,
        timestamp
    };
    ticketHistory.push(historyEntry);
    localStorage.setItem('ticketHistory', JSON.stringify(ticketHistory));

    // Save the updated tickets list
    localStorage.setItem('tickets', JSON.stringify(tickets));

    // Refresh the user ticket list and the admin dashboard
    displayUserTickets();  // Refresh the user ticket list
    displayAdminTickets();  // Refresh the admin dashboard
    cancelTicketForm();     // Close the ticket form

    if (currentUser && currentUser.role === 'admin') {
        document.getElementById("adminDashboard").classList.remove("hidden");
        document.getElementById("userDashboard").classList.add("hidden");
    } else if (currentUser && currentUser.role === 'user') {
        document.getElementById("userDashboard").classList.remove("hidden");
        document.getElementById("adminDashboard").classList.add("hidden");
    }
}

// Edit a ticket (open the form with ticket data)
function editTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    document.getElementById("ticketTitle").value = ticket.title;
    document.getElementById("ticketDescription").value = ticket.description;
    document.getElementById("ticketPriority").value = ticket.priority;

    currentEditingTicketId = ticketId;

    document.getElementById("ticketForm").classList.remove("hidden");
    document.getElementById("adminDashboard").classList.add("hidden");
    document.getElementById("userDashboard").classList.add("hidden");
}

// Delete a ticket
function deleteTicket(ticketId) {
    tickets = tickets.filter(t => t.id !== ticketId);
    localStorage.setItem('tickets', JSON.stringify(tickets));
    displayAdminTickets();
    displayUserTickets();
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById("welcomePage").classList.remove("hidden");
    document.getElementById("adminDashboard").classList.add("hidden");
    document.getElementById("userDashboard").classList.add("hidden");
}

// Show the ticket submission form
function showTicketForm() {
    document.getElementById("ticketForm").classList.remove("hidden");
    document.getElementById("userDashboard").classList.add("hidden");
    document.getElementById("adminDashboard").classList.add("hidden");
    document.getElementById("ticketTitle").value = "";
    document.getElementById("ticketDescription").value = "";
    document.getElementById("ticketPriority").value = "Low";
    currentEditingTicketId = null;  // Reset editing state
}

// Function to delete a specific history entry
function deleteHistoryEntry(ticketId, actionTimestamp) {
    // Filter out the history entry with the matching ticketId and timestamp
    ticketHistory = ticketHistory.filter(entry => !(entry.ticketId === ticketId && entry.timestamp === actionTimestamp));
    
    // Save the updated history to localStorage
    localStorage.setItem('ticketHistory', JSON.stringify(ticketHistory));
    
    // Refresh the ticket history display
    showTicketHistory(ticketId);  // Refresh the history list for the ticket
}

// Function to clear all ticket history
function clearTicketHistory() {
    // Clear the entire history
    ticketHistory = [];
    
    // Save the empty history to localStorage
    localStorage.setItem('ticketHistory', JSON.stringify(ticketHistory));
    
    // Refresh the display to show no history
    document.getElementById("ticketHistoryList").innerHTML = "<tr><td colspan='5'>No history available.</td></tr>";
}

// Function to update pagination controls
function updatePaginationControls(totalTickets) {
    const totalPages = Math.ceil(totalTickets / ticketsPerPage);
    const paginationControls = document.getElementById("paginationControls");

    // Clear existing pagination controls
    paginationControls.innerHTML = "";

    // Add "Previous" button if we're not on the first page
    if (currentPage > 1) {
        const prevButton = document.createElement("button");
        prevButton.innerText = "Previous";
        prevButton.onclick = () => changePage(currentPage - 1);
        paginationControls.appendChild(prevButton);
    }

    // Add page numbers (e.g., 1, 2, 3, ...)
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;
        pageButton.onclick = () => changePage(i);
        if (i === currentPage) {
            pageButton.disabled = true; // Disable the button for the current page
        }
        paginationControls.appendChild(pageButton);
    }

    // Add "Next" button if we're not on the last page
    if (currentPage < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.innerText = "Next";
        nextButton.onclick = () => changePage(currentPage + 1);
        paginationControls.appendChild(nextButton);
    }
}

// Function to change the current page
function changePage(pageNumber) {
    // Update the current page and re-render the tickets
    currentPage = pageNumber;

    // Re-render tickets
    if (currentUser && currentUser.role === 'admin') {
        displayAdminTickets();
    } else if (currentUser && currentUser.role === 'user') {
        displayUserTickets();
    }
}