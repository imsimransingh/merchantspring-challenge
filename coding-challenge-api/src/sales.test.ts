import * as salesData from "./sales";
import { Store, Order } from "./sales";
import fs from "fs";
import csvParser from "csv-parser";
import dayjs from "dayjs";
// Mock data
const mockStoresData: Store[] = [
  {
    storeId: "2",
    marketplace: "Ebay",
    country: "GBR",
    shopName: "Snack Co.",
  },
];

const mockOrdersData: Order[] = [
  {
    Id: "1",
    storeId: "2",
    orderId: "RBGSESWLOZ",
    latest_ship_date: "02/02/2024",
    shipment_status: "Pending",
    destination: "Great Falls MM, 59963-4198",
    items: "7",
    orderValue: "160.76",
    countryCode: "GBR",
  },
];

const daysOverdue = 59;
jest.mock("dayjs", () => () => ({
  diff: jest.fn(() => daysOverdue),
}));

jest.mock("./sales", () => ({
  ...jest.requireActual("./sales"),
  readCSV: jest.fn(),
  getPaginatedOrders: jest.fn(),
}));

// Mock implementations
salesData.readCSV.mockResolvedValue(mockStoresData);
salesData.getPaginatedOrders.mockResolvedValue({
  data: mockOrdersData,
  total: 1,
});

describe("getCombinedSalesData", () => {
  it("produces expected combined sales data", async () => {
    const expectedOutput = {
      Marketplace: "Ebay",
      countryCode: "GBR",
      Store: "Snack Co.",
      OrderId: "RBGSESWLOZ",
      OrderValues: "160.76",
      Items: "7",
      Destinations: "Great Falls MM, 59963-4198",
      DaysOverdue: 59,
    };

    const result = await salesData.getCombinedSalesData(1, 10);

    expect(result.data[0]).toEqual(expectedOutput);
    expect(result.total).toBe(999999);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });
});
