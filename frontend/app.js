
document.addEventListener('DOMContentLoaded', () => {

// --- Global Constants ---
const apiUrl = 'http://localhost:3000/api/clients'; // Base URL for the client API

// --- DOM Element References ---
const form = document.getElementById('client-form');
const formTitle = document.getElementById('form-title');
const tableBody = document.getElementById('clients-table-body');
const clientIdField = document.getElementById('client-id');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

/**

Fetches all clients from the API and renders them in the table.
*/
const fetchClients = async () => {
try {
const response = await fetch(apiUrl);
if (!response.ok) throw new Error('Failed to fetch clients');

 const result = await response.json();
 const clients = result.data;

 // Clear the table before rendering new data
 tableBody.innerHTML = '';
 
 if (clients.length === 0) {
     tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No clients found.</td></tr>`;
     return;
 }

 // Create and append a table row for each client
 clients.forEach(client => {
     const row = document.createElement('tr');
     row.innerHTML = `
         <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${client.name}</td>
         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${client.email}</td>
         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${client.phone_number || 'N/A'}</td>
         <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
             <button class="text-indigo-600 hover:text-indigo-900" onclick="editClient(${client.id})">Edit</button>
             <button class="text-red-600 hover:text-red-900 ml-4" onclick="deleteClient(${client.id})">Delete</button>
         </td>
     `;
     tableBody.appendChild(row);
 });
} catch (error) {
console.error('Error:', error);
tableBody.innerHTML = <tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error loading data.</td></tr>;
}
};

/**

Handles form submission for both creating and updating a client.
*/
form.addEventListener('submit', async (e) => {
e.preventDefault(); // Prevent default form submission

// Check if we are editing or creating by looking at the hidden ID field
const isEditing = !!clientIdField.value;
const url = isEditing ? `${apiUrl}/${clientIdField.value}` : `apiUrl`;
const method = isEditing ? 'PUT' : 'POST';

// Collect data from the form
const clientData = {
name: document.getElementById('name').value,
email: document.getElementById('email').value,
phone_number: document.getElementById('phone_number').value,
address: document.getElementById('address').value,
};

try {
// Send the request to the API
const response = await fetch(url, {
method: method,
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(clientData),
});

 if (!response.ok) {
     const errorData = await response.json();
     throw new Error(errorData.message || 'Failed to save client');
 }
 
 // On success, reset the form and refresh the client list
 resetForm();
 fetchClients();
} catch (error) {
console.error('Save Error:', error);
alert(`Error: ${error.message}`);
}
});

/**

Prepares the form for editing a client.

Fetches client data and populates the form fields.

Note: This function is attached to the global 'window' object to be accessible from the onclick attribute in the HTML.
*/
window.editClient = async (id) => {
try {
const response = await fetch(`${apiUrl}/${id}`);
if (!response.ok) throw new Error('Client not found');

 const result = await response.json();
 const client = result.data;
 
 // Populate form with client data
 formTitle.textContent = 'Edit Client';
 clientIdField.value = client.id;
 document.getElementById('name').value = client.name;
 document.getElementById('email').value = client.email;
 document.getElementById('phone_number').value = client.phone_number || '';
 
 // Show the 'Cancel' button and scroll to the form
 cancelEditBtn.classList.remove('hidden');
 form.scrollIntoView({ behavior: 'smooth' });
} catch (error) {
console.error('Edit Error:', error);
}
};

/**

Deletes a client after user confirmation.

Note: This function is also attached to the 'window' object.
*/
window.deleteClient = async (id) => {
// Confirm before deleting
if (!confirm('Are you sure you want to delete this client?')) {
return;
}

try {
const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
if (!response.ok) throw new Error('Failed to delete client');

 // Refresh the client list on successful deletion
 fetchClients();
} catch (error) {
console.error('Delete Error:', error);
alert('Could not delete the client.');
}
};

/**

Resets the form to its initial state for creating a new client.
*/
const resetForm = () => {
form.reset();
clientIdField.value = '';
formTitle.textContent = 'Add New Client';
cancelEditBtn.classList.add('hidden');
};
// --- Event Listeners and Initial Load ---

// Add click event listener for the 'Cancel' button
cancelEditBtn.addEventListener('click', resetForm);

// Initial call to fetch and display clients when the page loads
fetchClients();
});