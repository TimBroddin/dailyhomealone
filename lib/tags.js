const AWS = require("aws-sdk");
const S3 = new AWS.S3({ region: "eu-west-1" });
const rekognition = new AWS.Rekognition({ region: "eu-west-1" });

const getTags = async file => {
  console.log(file);
  const params = {
    Image: {
      S3Object: {
        Bucket: process.env.S3_BUCKET,
        Name: file
      }
    },
    MaxLabels: 25,
    MinConfidence: 50
  };

  const labels = await rekognition.detectLabels(params).promise();

  return labels.Labels.map(l => `#${l.Name.toLowerCase().replace(/ /g, "")}`);
};

module.exports = { getTags };
