import express from "express";
import router from "./router";

const port = 8000;
const app = express();

app.use(router);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
