if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
} else {
    // Open (or create) the database
    let request = indexedDB.open("database", 1);

    request.onerror = function(event) {
        console.log("Error opening/creating database:", event);
    };

    request.onsuccess = function(event) {
        console.log("Database opened successfully");
        let db = event.target.result;

        // Add data to the database
        //addData(db);
    };

    request.onupgradeneeded = function(event) {
        let db = event.target.result;
        // Create an object store if it doesn't already exist
        if (!db.objectStoreNames.contains("people")) {
            let objectStore = db.createObjectStore("people", { keyPath: "id", autoIncrement: true });
            // Optional: Create an index to search customers by name
            objectStore.createIndex("name", "name", { unique: false });
        }
    };
    // Function to add data
}

function addData(db) {
    let transaction = db.transaction(["customers"], "readwrite");
    let objectStore = transaction.objectStore("customers");

    let customerData = [
        { name: "John Doe", email: "john.doe@example.com" },
        { name: "Jane Smith", email: "jane.smith@example.com" },
        { name: "Alice Johnson", email: "alice.johnson@example.com" }
    ];

    customerData.forEach(function(customer) {
        let request = objectStore.add(customer);

        request.onsuccess = function(event) {
            console.log("Data added successfully:", customer);
        };

        request.onerror = function(event) {
            console.log("Error adding data:", event);
        };
    });
}