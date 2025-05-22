"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./cli/index");
(0, index_1.run)().then(exitCode => {
    process.exit(exitCode);
});
