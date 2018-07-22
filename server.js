const express = require('express');
const bodyParser = require('body-parser');
const cors= require('cors');
const Clarifai = require('clarifai');
const bcrypt = require('bcrypt');
const knex = require('knex');

const app = express();

const saltRounds = 10;

const db = knex({
    client: 'pg',
    connection: {
      connectionString : process.env.DATABASE_URL,
      ssl: true
    }
});

const clarifaiAPI = new Clarifai.App({
    apiKey: 'b9556e1bfe254ee48ce105137f50604c'
});

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('hello');
})

app.post('/signin', (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json('empty fields')
    }

    db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get user'))
            } else {
                res.status(400).json('wrong email / password pair')
            }

        })
        .catch(err => res.status(400).json('wrong email / password pair'))
})

app.post('/register', (req, res) => {
    const {name, email, password} = req.body;

    if (!email || !name || !password) {
        return res.status(400).json('empty fields')
    }
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
            res.json(entries[0])
        })
        .catch(err => res.status(400).json('unable to get entries'));
});

app.post('/imageUrl', (req, res) => {
    clarifaiAPI.models
        .predict(
            Clarifai.FACE_DETECT_MODEL,
            req.body.input)
        .then(data => { 
            res.json(data) 
        })
        .catch(err => res.status(400).json('unable to connect to API'))
})

const PORT = process.env.PORT || 5000;
app.listen(PORT);