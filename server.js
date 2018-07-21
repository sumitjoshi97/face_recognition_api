const express = require('express');
const bodyParser = require('body-parser');
const cors= require('cors');
const bcrypt = require('bcrypt');
const knex = require('knex');
const app = express();

const saltRounds = 10;

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '123',
      database : 'SmartBrain'
    }
  });

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('hello');
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

    const hash = bcrypt.hashSync(password, saltRounds);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name, 
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0])
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
});

app.get('/profile/:id', (req, res) => { 
    const { id } = req.params;

    db.select('*').from('users').where({ id })
        .then(user => {
            if(user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Not found'); 
            }
        })
        .catch(err => res.status(400).json('error getting user'));
    
});

app.put('/image', (req, res) => {
    const { id } = req.body;

    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            console.log(entries)
            if(entries.length > 0 ) {
                res.json(entries)
            } else {
                res.status(400).json('User not found'); 
            }
                
        })
        .catch(err => res.status(400).json('unable to get entries'));
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