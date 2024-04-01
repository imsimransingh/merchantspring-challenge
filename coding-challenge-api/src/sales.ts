import fs from "fs";
import csvParser from "csv-parser";
import dayjs from "dayjs";
import path from "path";
// this will be the path of store and order csv files
// idealy it should work for all systems but check this if file didn't get loaded.
const storesCsvPath = path.join(__dirname, "../data/stores.csv");
const ordersCsvPath = path.join(__dirname, "../data/orders.csv");

// interfaces for store object from csv
interface Store {
  storeId: string;
  marketplace: string;
  country: string;
  shopName: string;
}
// interface for order from csv
interface Order {
  Id: string;
  storeId: string;
  orderId: string;
  latest_ship_date: string;
  shipment_status: string;
  destination: string;
  items: string;
  orderValue: string;
  countryCode: string;
}

// A helper function to read and parse a CSV file
export const readCSV = <T>(filePath: string): Promise<T[]> => {
  const results: T[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data: T) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error: Error) => reject(error));
  });
};

// helper function to calculate days difference
export const calculateDaysOverdue = (latestShipDate: string): number => {
  const now = dayjs();
  const shipDate = dayjs(latestShipDate);
  return now.diff(shipDate, "day");
};

// We will hold all the orders in memory for this coding test(as we can't use database for now)
// the data is too heavy, there is latency in response
// we will also use pagination so that data should retunr in chunks
// for better performance.

let allOrdersInMemory: Order[] | null = null;
// A flag to signal data is loaded
let isDataLoaded = false;

// Function to load orders into memory
export const loadOrdersInMemory = async () => {
  try {
    allOrdersInMemory = await readCSV<Order>(ordersCsvPath);
    isDataLoaded = true; // Set the flag to true once the data is loaded
  } catch (error) {
    //console.log('Failed to load orders into memory:', error);
    isDataLoaded = false;
  }
};

// Load orders into memory when the server starts
loadOrdersInMemory();

// Function to wait until the data is loaded
const waitForDataToLoad = async () => {
  while (!isDataLoaded) {
    // Wait for 100 ms before checking again
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

// From below function pagination will be implemented on fetched data
export const getPaginatedOrders = (
  page: number = 1,
  pageSize: number = 10
): { data: Order[]; total: number } => {
  // check if allOrdersInMemory is already populated
  if (!allOrdersInMemory) {
    // throw new Error('Orders data not loaded into memory yet');
    // If the data isn't loaded yet, return an empty array and a total of 0
    return { data: [], total: 0 };
  }

  const startRow = (page - 1) * pageSize;
  const paginatedData = allOrdersInMemory.slice(startRow, startRow + pageSize);

  return {
    data: paginatedData,
    total: allOrdersInMemory.length,
  };
};

// Below function will be a opening function for API call,
// Store csv will be read in this and pagination will be added on orders data
// and return response to frontend
export const getCombinedSalesData = async (
  page: number = 1,
  pageSize: number = 10
) => {
  // Wait for the orders data to be loaded into memory before proceeding
  await waitForDataToLoad();
  try {
    const stores = await readCSV<Store>(storesCsvPath);
    const { data: orders, total } = getPaginatedOrders(page, pageSize);

    const combinedData = orders.map((order: any) => {
      const store = stores.find((store) => store.storeId === order.storeId);
      return {
        Marketplace: store?.marketplace,
        countryCode: store?.country,
        Store: store?.shopName,
        OrderId: order.orderId,
        OrderValues: order.orderValue,
        Items: order.items,
        Destinations: order.destination,
        DaysOverdue: calculateDaysOverdue(order.latest_ship_date),
      };
    });

    return {
      data: combinedData,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Error processing CSV data:", error);
    throw error;
  }
};
