const fs = require('fs');
const configPath = require('./configPath.js');

try {
    if (!fs.existsSync(configPath)) {
        fs.writeFile(configPath, "module.exports = {};", () => {});
    }
}
catch {
}