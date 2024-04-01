import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
} from "@material-ui/core";
import ReactCountryFlag from "react-country-flag";

// Import for Style sheet
import "./TableStyle.css";

// Import for Service file
import { getSalesData } from "../../services/getSalesData";

const TableComponent = () => {
  // State Vars
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const RowsPerPage = 5;

  useEffect(() => {
    // Call service to get data
    const fetchData = async () => {
      try {
        const data = await getSalesData({
          page: page + 1,
          pageSize: RowsPerPage,
        });
        const sortedData = sortData(data.data, orderDirection);
        setRows(sortedData);
        setTotal(data.total);
      } catch (error) {
        console.log("Wait for the response...");
      }
    };

    fetchData();
  }, [page, RowsPerPage, orderDirection]);

  const sortData = (data: any, direction: string) => {
    return [...data].sort((a, b) => {
      return direction === "asc"
        ? parseInt(a.DaysOverdue) - parseInt(b.DaysOverdue)
        : parseInt(b.DaysOverdue) - parseInt(a.DaysOverdue);
    });
  };

  // Handle sorting here
  const handleSortRequest = () => {
    setOrderDirection((prevDirection) =>
      prevDirection === "asc" ? "desc" : "asc"
    );
    setRows((currentRows) =>
      sortData(currentRows, orderDirection === "asc" ? "desc" : "asc")
    );
  };

  // if user changes page from pagination, it will be handled here
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // Since we have data for country code in 3 characters i.e. alpha3
  // we need to change it to Alpha2 i.e. in 2 characters so that
  // we can show flags from library we have used i.e. react-country-flag
  type CountryCodeMapping = {
    [key: string]: string;
  };
  const countryCodeMapping: CountryCodeMapping = {
    GBR: "GB",
    AUS: "AU",
    USA: "US",
  };
  const convertAlpha3ToAlpha2 = (alpha3Code: string): string => {
    return countryCodeMapping[alpha3Code] || "";
  };

  return (
    <>
      <TableContainer component={Paper} className="tableContainer">
        <h2 className="tableTitle">Overdue Orders</h2>
        <Table className="overdueTable" aria-label="overdue table">
          <TableHead className="tableHeader">
            <TableRow>
              <TableCell className="tableRowHeader">MARKETPLACE</TableCell>
              <TableCell className="tableRowHeader">STORE</TableCell>
              <TableCell className="tableRowHeader">ORDER ID</TableCell>
              <TableCell className="tableRowHeader">ORDER VALUE</TableCell>
              <TableCell className="tableRowHeader">ITEMS</TableCell>
              <TableCell className="tableRowHeader">DESTINATION</TableCell>
              <TableCell>
                <TableSortLabel
                  active={true}
                  direction={orderDirection}
                  onClick={handleSortRequest}
                  className="tableRowHeader"
                >
                  DAYS OVERDUE
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="tableBody">
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <ReactCountryFlag
                    countryCode={convertAlpha3ToAlpha2(row.countryCode)}
                    svg
                    className="marketPlaceFlag"
                    title={row.countryCode}
                  />
                  {row.Marketplace}
                </TableCell>
                <TableCell>{row.Store}</TableCell>
                <TableCell>{row.OrderId}</TableCell>
                <TableCell>${row.OrderValues}</TableCell>
                <TableCell>{row.Items}</TableCell>
                <TableCell>{row.Destinations}</TableCell>
                <TableCell className="overdue">{row.DaysOverdue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        rowsPerPageOptions={[]}
        count={total}
        rowsPerPage={RowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        className="pagination"
      />
    </>
  );
};

export default TableComponent;
