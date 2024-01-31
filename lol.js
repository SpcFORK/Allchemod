
// Utility function to wrap IndexedDB operations in a Promise
function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.oncomplete = request.onsuccess = () => resolve(request.result);
    request.onabort = request.onerror = () => reject(request.error);
  });
}

// Function to open an IndexedDB database and create an object store if needed
function openIndexedDB(databaseName, objectStoreName) {
  const dbOpenRequest = indexedDB.open(databaseName);
  dbOpenRequest.onupgradeneeded = () => dbOpenRequest.result.createObjectStore(objectStoreName);

  const promise = promisifyRequest(dbOpenRequest);

  return (mode, callback) => promise.then(result => callback(result.transaction(objectStoreName, mode).objectStore(objectStoreName)));
}

// Singleton instance of IndexedDB for key-value storage
let keyValStore;

function getKeyValStore() {
  // Initialize keyValStore if not already done
  return keyValStore || (keyValStore = openIndexedDB("keyval-store", "keyval")), keyValStore;
}

// Function to get a value from the key-value store
function getValue(key, store = getKeyValStore()) {
  return store("readonly", transaction => promisifyRequest(transaction.get(key)));
}

// Function to set a value in the key-value store
function setValue(key, value, store = getKeyValStore()) {
  return store("readwrite", transaction => {
    transaction.put(value, key);
    return promisifyRequest(transaction.transaction);
  });
}

// Function to update multiple key-value pairs
function updateValues(keyValuePairs, store = getKeyValStore()) {
  return store("readwrite", transaction => {
    keyValuePairs.forEach(([key, value]) => transaction.put(value, key));
    return promisifyRequest(transaction.transaction);
  });
}

// Function to iterate over the values in a cursor
function iterateCursor(cursor, callback) {
  cursor.openCursor().onsuccess = function() {
    if (this.result) {
      callback(this.result);
      this.result.continue();
    }
  };

  return promisifyRequest(cursor.transaction);
}

// Function to retrieve all key-value pairs from the store
function getAllValues(store = getKeyValStore()) {
  return store("readonly", transaction => {
    if (transaction.getAll && transaction.getAllKeys) {
      return Promise.all([promisifyRequest(transaction.getAllKeys()), promisifyRequest(transaction.getAll())])
        .then(([keys, values]) => keys.map((key, index) => [key, values[index]]));
    } else {
      const result = [];
      return store("readonly", transaction => iterateCursor(transaction, item => result.push([item.key, item.value])))
        .then(() => result);
    }
  });
}

// Function to handle user-related data
const userStore = $UqgiltlUfE("user", () => {
  // Fetch user inventory data
  const { data: inventoryData, pending: inventoryPending } = $UqgiltlUfE("user/inventory", () => getValue("user/inventory"), {
    default: () => ({}),
    transform: rawData => rawData || {},
    server: false,
    deep: false
  });

  // Fetch user item cache data
  const { data: itemCacheData, pending: itemCachePending } = $UqgiltlUfE("user/item-cache", () => getAllValues(), {
    default: () => ({}),
    transform: rawData => {
      const result = {};
      rawData.filter(([key]) => key.startsWith("user/item-cache/")).forEach(([_, value]) => {
        result[value.id] = value;
      });
      return result;
    },
    server: false
  });

  // Computed property to combine inventory and item cache data
  const combinedData = computed(() =>
    Object.entries(inventoryData.value).map(([key, value]) => {
      const item = itemCacheData.value[key];
      return item ? { item, ...value } : undefined;
    }).filter(Boolean)
  );

  // Fetch user data
  const { refresh: refreshUserData, error: userError, pending: userPending } = $UqgiltlUfE("/api/users/me", {
    server: false
  });

  // Method to update user energy amount
  const setEnergy = energyAmount => {
    if (combinedData.value) {
      combinedData.value.energy.amount = energyAmount;
    }
  };

  // Method to add items to the inventory
  const addToInventory = async items => {
    await updateValues(items.map(({ item }) => item));
    let inventoryUpdated = false;
    let newItemAdded = false;
    items.forEach(item => {
      const currentItem = inventoryData.value[item.item.id];
      if (currentItem) {
        if (item.depth < currentItem.depth) {
          currentItem.depth = item.depth;
          inventoryUpdated = true;
        } else if (item.recipesUsedIn > currentItem.recipesUsedIn) {
          currentItem.recipesUsedIn = item.recipesUsedIn;
          inventoryUpdated = true;
        }
      } else {
        inventoryData.value[item.item.id] = {
          depth: item.depth,
          logCost: item.logCost,
          obtainedAt: item.obtainedAt,
          recipesUsedIn: item.recipesUsedIn
        };
        inventoryUpdated = true;
        newItemAdded = true;
      }
    });
    if (inventoryUpdated) {
      if (newItemAdded) {
        watchEffect(() => refreshUserData());
      }
      await setValue("user/inventory", JSON.parse(JSON.stringify(inventoryData.value)));
    }
    return newItemAdded;
  };

  // Method to clear the inventory
  const clearInventory = async () => {
    await setValue("user/inventory", {});
    inventoryData.value = {};
  };

  // Method to add items to the item cache
  const addToItemCache = async items => {
    const updates = items.map(item => {
      if (JSON.stringify(item) !== JSON.stringify(itemCacheData.value[item.id])) {
        itemCacheData.value[item.id] = item;
        return [`user/item-cache/${item.id}`, item];
      }
    }).filter(Boolean);
    if (updates.length) {
      await updateValues(updates);
    }
  };

  return {
    inventory: combinedData,
    itemCache: itemCacheData,
    user: refreshUserData,
    errorInventory: userError,
    errorUser: userError,
    pendingInventory: inventoryPending,
    pendingUser: userPending,
    addToInventory,
    clearInventory,
    refreshInventory: refreshUserData,
    addToItemCache,
    refreshUser: refreshUserData,
    setEnergy
  };
});