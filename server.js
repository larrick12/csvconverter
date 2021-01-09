'use strict';
require('dotenv').config();
const express = require('express');

const path = require('path');
const debug = require('debug')('server');
const app = express();
const http = require('http');
const server = http.createServer(app);
const chalk = require('chalk');
const fs = require('fs');
const request = require('request');
const bodyParser = require('body-parser');
const crypt = require('crypto');

const appRoute = express.Router();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views/'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}))

// const url = "https://docs.google.com/spreadsheets/d/1qndb7vn0Ff9kSyQZFoTygCjWNJNJFVGjfxc0yRMhaQo/export?format=csv";

app.use('/', appRoute)

appRoute.route('/')
    .get((req, res) => {
        res.render('index')
    })

appRoute.route('/csvfiles').post((req, res, next) => {

    // user input data
    let {
        csvurl
    } = req.body;

    // format the spreedsheet url to csv
    let baseurl = path.dirname(csvurl);
    let urls = `${path.dirname(csvurl)}/export?format=csv&id=${path.basename(baseurl)}`;

    // request options
    const options = {
        uri: urls,
        method: 'GET',
        port: 443,
        path: '/src/csv-data/csvjson.csv'
    };

    // resquesting the data from url
    request(options, (err, res, body) => {
        err ? debug(err) : null;
        res.statusCode === 200 ? debug('fetched') : debug(res.statusCode);

        // save the data in a folder to make it accessible
        fs.writeFile(path.join(__dirname, options.path), body, {
            encoding: 'utf-8'
        }, err => {
            if (err)
                return debug(err);
            debug('written');
            readfile()
        });

    })

    // path for the saved docs
    let csvData = path.join(__dirname, options.path);
    let jsonData = path.join(__dirname, '/src/csv-data/csvjson.json');

    // check if the file is a valid csv
    if (path.extname(csvData) === '.csv') {
        debug('valid csv file')
    }

    let hash = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-@";

    // generate convert key
    function randomString(length, chars) {
        if (!chars) {
            debug('Argument \'chars\' is undefined');
        }

        let charsLength = chars.length;
        if (charsLength > 256) {
            debug('Argument \'chars\' should not have more than 256 characters' +
                ', otherwise unpredictability will be broken');
        }

        let randomBytes = crypt.randomBytes(length);
        let result = new Array(length);

        let cursor = 0;
        for (let i = 0; i < length; i++) {
            cursor += randomBytes[i];
            result[i] = chars[cursor % charsLength];
        }

        return result.join('');
    }

    /** Sync */
    function randomkey(length) {
        return randomString(length,
            hash);
    }

    function readfile() {
        let csvJson = [];

        // reading the csv file
        fs.readFile(csvData, {
            encoding: 'utf-8'
        }, (err, data) => {
            // check for error
            if (err) return debug(err);

            /**converting to json file**/

            let arrData = data.split('\n');

            // selecting header or title
            let valArr = arrData[0].split(',');

            let dataObj = {};

            for (let i = 1; i < arrData.length; i++) {

                let obj = {};

                let dataArr = arrData[i].split(',');

                dataArr.map((e, i) => {
                    obj[valArr[i]] = dataArr[i]
                })

                csvJson.push(obj);
            }

            // check if data array is less
            dataObj['conversion_key'] = randomkey(32);
            dataObj['json'] = csvJson.length > 0 && csvJson.length < 2 ? csvJson[0] : csvJson;

            // write the converted json file 
            fs.writeFile(jsonData, JSON.stringify(dataObj, null, 4), {
                encoding: 'utf-8'
            }, err => {
                if (err) return debug(err);
                debug('written json file');
            })

            res.send(`<div>
            <br/>
        <h2> CSV RAW FILE </h2>
        <hr/> 
            ${data}
        <hr/>
        <h2> CSV converted to JSON </h2>
        <hr/>
        <code>${JSON.stringify(dataObj)}</code>
        </div>`);

        })
    }

}, (req, res, next) => {
    next()
})

const port = process.env.PORT || 3000;

server.listen(port, () => {
    debug(`Listening on port ${chalk.green(port)}`)
})