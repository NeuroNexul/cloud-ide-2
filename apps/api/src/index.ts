import { createServer } from "./server";

const port = process.env.PORT || 5001;

const app = createServer();

app.listen(port, () => {
  console.log(`Listening on port : ${port}`);
});
