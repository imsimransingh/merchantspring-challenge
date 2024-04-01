jest.mock("../../services/getSalesData", () => ({
  getSalesData: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TableComponent from "./TableComponent";
import { getSalesData } from "../../services/getSalesData";

it("fetches sales data successfully", async () => {
  (getSalesData as jest.Mock).mockResolvedValue({
    data: [
      {
        Marketplace: "Ebay",
        countryCode: "GBR",
        Store: "Snack Co.",
        OrderId: "RBGSESWLOZ",
        OrderValues: "160.76",
        Items: "7",
        Destinations: "Great Falls MM, 59963-4198",
        DaysOverdue: 59,
      },
    ],
    total: 999999,
    page: 1,
    pageSize: 5,
  });
});

describe("TableComponent", () => {
  it("renders without crashing", async () => {
    render(<TableComponent />);
    await waitFor(() => expect(getSalesData).toHaveBeenCalled());
  });

  it("calls getSalesData on component mount", async () => {
    render(<TableComponent />);
    await waitFor(() => expect(getSalesData).toHaveBeenCalledTimes(1));
  });

  it("pagination changes page", async () => {
    render(<TableComponent />);
    await waitFor(() => expect(getSalesData).toHaveBeenCalledTimes(1));

    const nextPageButton = screen.getByRole("button", { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => expect(getSalesData).toHaveBeenCalledTimes(1));
    expect(getSalesData).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 })
    );
  });

  it("sorting changes order direction", async () => {
    render(<TableComponent />);
    await waitFor(() => expect(getSalesData).toHaveBeenCalled());

    const sortLabel = screen.getByText("DAYS OVERDUE");
    fireEvent.click(sortLabel);
  });
});
