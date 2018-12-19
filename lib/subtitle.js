const AWS = require("aws-sdk");
const S3 = new AWS.S3({ region: "eu-west-1" });
const Subtitle = require("subtitle");

const getSubtTitleContents = async () => {
  try {
    const subtitle = await S3.getObject({
      Bucket: process.env.S3_BUCKET,
      Key: "subtitle.srt"
    }).promise();
    return subtitle.Body.toString("utf-8");
  } catch (e) {
    throw new Error("Cannot read subtitles");
  }
};

const getSubtitleAt = async number => {
  const contents = await getSubtTitleContents();
  const subtitles = Subtitle.parse(contents);
  const ts = number * 5 - 2.5;

  const f = subtitles.filter(s => {
    return s.start <= ts * 1000 && s.end >= ts * 1000;
  });
  if (f.length) {
    return f.map(s => s.text).join("\n");
  } else {
    return "";
  }
};

module.exports = { getSubtitleAt };
