const { execSync } = require('child_process');
try {
    const url = "https://loremflickr.com/800/600/Udaipur,Pyaaz,Kachori";
    const dest = "C:\\TripEase\\frontend\\public\\images\\udaipur\\test.jpg";
    execSync(`curl.exe -L -k -s -v -o "${dest}" "${url}"`, { stdio: 'inherit' });
    console.log("Success");
} catch (err) {
    console.error("Error:", err);
}
