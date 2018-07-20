const express = require('express');
const bodyParser = require('body-parser');
const cors= require('cors');
const app = express();

let db = {
    users: [
        {
            id:'1',
            name: 'Sj',
            email: 'sj@email.com',
            password: '123',
            entries: 0,
            joined: new Date() 
        },
        {
            id:'2',
            name: 'Sj2',
            email: 'sj2@email.com',
            password: '123',
            entries: 0,
            joined: new Date() 
        }
    ]
}

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send(db.users);
})

app.post('/signin', (req, res) => {
    const {email, password} = req.body;

    if(email === db.users[0].email && 
        password === db.users[0].password) {
            res.json('success')
    } else {
        res.status(400).json('error loggin in')
    }
})

app.post('/register', (req, res) => {
    const {name, email, password} = req.body;
    db.users.push({
        id: '4',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    })

    res.send(db.users[db.users.length - 1]);
})

app.get('/profile/:id', (req, res) => { 
    const { id } = req.params;

    let found = false;
    db.users.forEach(user => {
        if (user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    })

    if(!found) {
        res.send('user not found')
    }

})


app.post('/image', (req, res) => {
    const { id } = req.body;
    let found = false;
    db.users.forEach(user => {
        if (user.id === id) {
            found = true;
            return res.json(user);
        }
    })

    if(!found) {
        res.send('user not found')
    }
})
const port = 5000|| process.env.PORT;
app.listen(port, () => {
    console.log('running on port 5000');
})


// routes
// signin
// register
// Image
// profile:userId