const AWS = require("aws-sdk");
const S3 = new AWS.S3({ region: "eu-west-1" });

const getCounter = async function() {
  try {
    const counter = await S3.getObject({
      Bucket: process.env.S3_BUCKET,
      Key: "counter.txt"
    }).promise();
    return parseInt(counter.Body.toString("utf-8").trim());
  } catch (e) {
    console.log(e);
    throw new Error("Cannot read counter");
  }
};

const setCounter = async function(value) {
  try {
    const counter = await S3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: "counter.txt",
      Body: value
    }).promise();
    return true;
  } catch (e) {
    console.log(e);

    throw new Error("Cannot set counter");
  }
};

module.exports = { getCounter, setCounter };
