const { web } = require("./webpack.common");
const waitOn = require("wait-on");
const open = require("open");
const dotenv = require("dotenv");
dotenv.config();

let isFirstEmit = true;
const port = process.env.PORT || 5000;

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    ...web,
    // plugins: [
    //     {
    //         apply: (compiler) => {
    //             compiler.hooks.compile.tap("open-browser", () => {
    //                 if (isFirstEmit) {
    //                     waitOn({ resources: [`http://localhost:${port}`] }).then(() => {
    //                         open(`http://localhost:${port}`)
    //                         isFirstEmit = false;
    //                     });
    //                 }
    //             })
    //         }
    //     }
    // ]
};