const { web } = require("./webpack.common");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config({
    path: fs.existsSync(".env") ? undefined : "asset/config.env"
});

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    ...web,
    devServer: {
        open: true,
        contentBase: path.resolve(__dirname, "public"),
        watchContentBase: true,
        proxy: {
            "/api": `http://localhost:${process.env.PORT}`,
            "/socket.io": {
                target: `http://localhost:${process.env.PORT}`,
                ws: true
            }
        },
        port: 7000
    }
};