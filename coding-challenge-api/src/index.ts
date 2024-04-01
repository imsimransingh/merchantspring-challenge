import express, { Request, Response } from "express";

import cors from "cors";
import { getUser } from "./user";
import { getCombinedSalesData } from "./sales";
const app = express();
const port = 8080;

app.use(cors());
app.get("/user", getUser);

app.get("/sales", async (req: Request, res: Response) => {
  let page = 1;
  let pageSize = 10;

  // Check if the query parameters exist and are integers, then assign them
  if (req.query.page && !isNaN(Number(req.query.page))) {
    page = parseInt(req.query.page as string, 10);
  }

  if (req.query.pageSize && !isNaN(Number(req.query.pageSize))) {
    pageSize = parseInt(req.query.pageSize as string, 10);
  }

  try {
    const combinedData = await getCombinedSalesData(page, pageSize);
    res.json(combinedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Server Error");
  }
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
