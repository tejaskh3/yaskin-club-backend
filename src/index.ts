import express, { Request, Response, Application } from "express";

const app: Application = express();

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "OK" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export default app;