const express = require("express");
const path = require("path");
const passwordRoutes = require("./routes/passwordRoutes");
const logger = require("./middlewares/logger");
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use('/api/passwords', passwordRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.use((req, res) => {
    res.status(404).json({error: "Маршрут не найден"});
})

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
