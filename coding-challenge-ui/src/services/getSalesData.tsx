// Type for the function parameters
interface FetchParams {
  page: number;
  pageSize: number;
}
// Sales data response
interface SalesDataResponse {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
}

// Function to fetch sales data
export const getSalesData = async ({
  page,
  pageSize,
}: FetchParams): Promise<SalesDataResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const response = await fetch(`/sales?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch sales data:", error);
    throw new Error("Failed to fetch sales data");
  }
};
