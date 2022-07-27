/*
The backend for the "trader" application:
- Login to a demat account
- Place trades and record on database
*/

const express = require('express');
const mongodb = require('mongodb');

//Load environment variables
require('dotenv').config();
const APP_CODE = process.env.APP_CODE;
const SECRET_KEY = process.env.SECRET_KEY;

//Initialize app
let tradeServer = express();
//Base URL:
const baseUrl = 'https://a3.aliceblueonline.com/rest/AliceBlueAPIService/api/';

//Login
tradeServer.post('/login', (req, res) => {
	//TODO: Get 
});

//Logout
tradeServer.post('/logout', (req, res) => {
	//TODO
});

//Buy
tradeServer.post('/buy', (req, res) => {
	//TODO
})

//Sell

//Get???