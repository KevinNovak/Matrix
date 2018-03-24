const express = require('express');

const PORT = 3000;

// App setup
var app = express();

// Static files
app.use(express.static('public'));

// Start server
var server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});