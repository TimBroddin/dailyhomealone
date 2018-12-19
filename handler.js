"use strict";

const AWS = require("aws-sdk");
const S3 = new AWS.S3({ region: "eu-west-1" });
const rekognition = new AWS.Rekognition({ region: "eu-west-1" });

const Subtitle = require("subtitle");
const fs = require("fs");

const { getCounter, setCounter } = require("./lib/counter");
const { getTags, getUserTags } = require("./lib/tags");
const { getSubtitleAt } = require("./lib/subtitle");

const Client = require("instagram-private-api").V1;
const device = new Client.Device("Kevin's Phone");
const storage = new Client.CookieMemoryStorage();

module.exports.post = async (event, context) => {
  const number = (await getCounter()) + 1;
  const file = `images/image${number.toString().padStart(5, "0")}.jpg`;
  console.log(`Posting ${file}`);

  const session = await Client.Session.create(
    device,
    storage,
    process.env.INSTAGRAM_USERNAME,
    process.env.INSTAGRAM_PASSWORD
  );

  console.log("Getting tags");
  // get tags from machine learning
  const tags = (await getTags(file)).join(" ") + " " + process.env_EXTRA_TAGS;
  const caption = (await getSubtitleAt(number)) + "\n\n" + tags;
  const userTags = await getUserTags(file);

  console.log(caption);
  console.log("Posting image");

  const image = await S3.getObject({
    Bucket: process.env.S3_BUCKET,
    Key: file
  }).promise();

  const upload = await Client.Upload.photo(session, image.Body);
  console.log(JSON.stringify(userTags));
  const medium = await Client.Media.configurePhoto(
    session,
    upload.params.uploadId,
    caption,
    1280,
    688,
    userTags
  );

  await setCounter(number.toString());
  return {
    status: "ok"
  };
};
