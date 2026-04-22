const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // We want to replace 'http://localhost:5000' and "http://localhost:5000" with ${import.meta.env.VITE_API_URL}
            // If they are inside single/double quotes, we need to convert them to backticks if we use ${...}
            
            // Regex to find fetch/axios calls like:
            // axios.post('http://localhost:5000/api/trips/search', ...)
            // fetch("http://localhost:5000/api/login", ...)

            let changed = false;

            // Simple replace for common cases
            // 'http://localhost:5000/api/...' -> `${import.meta.env.VITE_API_URL}/api/...`
            const regexSingle = /'http:\/\/localhost:5000([^']+)'/g;
            if (regexSingle.test(content)) {
                content = content.replace(regexSingle, '`${import.meta.env.VITE_API_URL}$1`');
                changed = true;
            }

            const regexDouble = /"http:\/\/localhost:5000([^"]+)"/g;
            if (regexDouble.test(content)) {
                content = content.replace(regexDouble, '`${import.meta.env.VITE_API_URL}$1`');
                changed = true;
            }

            const regexBacktick = /`http:\/\/localhost:5000([^`]+)`/g;
            if (regexBacktick.test(content)) {
                content = content.replace(regexBacktick, '`${import.meta.env.VITE_API_URL}$1`');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', file);
            }
        }
    }
}

processDirectory(srcDir);
console.log('Done replacing API URLs!');
