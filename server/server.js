const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const config = require('./config/config').get(process.env.NODE_ENV);
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE);

app.use(bodyParser.json());
app.use(cookieParser());

const { User } = require('./models/user');
const { Book } = require('./models/book');

const { auth } = require('./middleware/auth');

app.get('/', (req, res) => {
  const mainPage = `
    <html>
      <head></head>
      <body>
        <header>
          <h1>My book shelf</h1>
          <h2>Ta da!</h2>
          <h3>"U mnie dziala"</h3>
          <h4>dupa kupa</h4>
        </header>
        <main>Main content</main>
        <footer>Footer</footer>
      </body>
    </html>
  `;
  res.status(200).send(mainPage);
});

app.post('/api/user', (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password
  });

  user.save((err, doc) => {
    if (err) res.status(400).send(err)
    res.status(200).send(doc)
  });
});


app.post('/api/user/login', (req, res) => {

  User.findOne({ 'email': req.body.email }, (err, user) => {
    if (!user) res.json({ message: 'Auth failed, user not found' })

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) return res.status(400).json({
        message: 'Wrong password'
      });
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie('auth', user.token).send('ok')
      });
    });
  });
});

app.get('/user/profile', auth, (req, res) => {
  res.status(200).send(req.token);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is runninig on ${port}`);
})


