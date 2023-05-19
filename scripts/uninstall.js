const fs = require('fs');
const configPath = require('./configPath.js');

try {
    if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
    }
}
catch {
}