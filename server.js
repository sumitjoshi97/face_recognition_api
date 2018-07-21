const express = require('express');
const bodyParser = require('body-parser');
const cors= require('cors');
const knex = require('knex');
const app = express();

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '123',
      database : 'SmartBrain'
    }
  });


// db.select('*').from('users').then(data => {
//     console.log(data);
// }); 

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send(db.users);
})

app.post('/signin', (req, res) => {
    const {email, password} = req.body;

    if(email === db.users[0].email && 
        password === db.users[0].password) {
            return res.json(db.users[0])
    } else {
        res.status(400).json('error loggin in')
    }
})

app.post('/register', (req, res) => {
    const {name, email, password} = req.body;
    db.inset.push({
        id: '3',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    })

    db('users').insert({
        email: email,
        name: name,
        joined: new Date()
    }).then(console.log(db.select('*').from('users')))

    // return res.json(db.users[db.users.length - 1]);
});

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
        res.status(400).send('user not found')
    }
});

app.put('/image', (req, res) => {
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
});


const port = 5000|| process.env.PORT;
app.listen(port, () => {
    console.log('running on port 5000');
})


// routes
// signin
// register
// Image
// profile:userId