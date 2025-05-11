const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = {};

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

console.log('Available IP addresses:');
console.log(JSON.stringify(results, null, 2));
console.log('\nUse one of these IP addresses in your .env file:');
console.log('EXPO_PUBLIC_API_URL=http://<your-ip>:8000'); 