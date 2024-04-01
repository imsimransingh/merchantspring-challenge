import { getSalesData } from './getSalesData'
global.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getSalesData', () => {
  it('fetches and returns sales data successfully', async () => {
    const mockSalesData = {
      data: [
        {
          Marketplace: 'Ebay',
          countryCode: 'GBR',
          Store: 'Snack Co.',
          OrderId: 'RBGSESWLOZ',
          OrderValues: '160.76',
          Items: '7',
          Destinations: 'Great Falls MM, 59963-4198',
          DaysOverdue: 59
        }
      ],
      total: 999999,
      page: 1,
      pageSize: 5
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSalesData
    })

    const response = await getSalesData({ page: 1, pageSize: 5 })
    expect(global.fetch).toHaveBeenCalledWith(`/sales?page=1&pageSize=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    expect(response).toEqual(mockSalesData)
  })

  it('throws an error when the network response is not ok', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    })
  })
})
