"use strict";

const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");

exports.collect = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const firehose = new AWS.Firehose();
  console.log(`Body payload: ${JSON.stringify(body, null, 2)}`);

  firehose
    .putRecord({
      DeliveryStreamName: "DataTracker-prod",
      Record: {
        Data: `${JSON.stringify(body)}\n`
      }
    })
    .promise()
    .then(res => res)
    .catch(err => console.error(err));
  callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      data: { success: true }
    })
  });
};

exports.index = (event, context, callback) => {
  callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=UTF-8"
    },
    body: fs.readFileSync(path.join(__dirname, "index.html"), {
      encoding: "utf8"
    })
  });
};
