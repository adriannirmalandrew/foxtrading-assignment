/*
The backend for the "trader" application:
- Login to a demat account
- Place trades and record on database
*/

const express = require('express');
const mongodb = require('mongodb');

//Initialize app
let tradeServer = express();
