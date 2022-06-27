const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const cors = require('cors')
const authController = require('./controllers/authController')

const app = express();

// middleware
app.use(cors({
  origin: '*'
}))
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = '//add mongodb connection uri here//';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => console.log("Connected to db!"))
  .catch((err) => console.log(err));

// routes
app.post('/validate-coupon', authController.checkCoupon)
app.post('/checkuser', requireAuth);
app.get('/', (req, res) => res.render('home'));
app.use(authRoutes);

// server port
app.listen(8000, ()=> {
  console.log("Server up and running on port 8000..")
})