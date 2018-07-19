const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('hello')
})

const port = 5000|| process.env.PORT;
app.listen(port, () => {
    console.log('running on port 5000');
})