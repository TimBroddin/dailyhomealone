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

const getUserTags = async file => {
  const detectableFaces = [
    {
      name: "kevin.jpg",
      id: "1362414421"
    },
    {
      name: "marv.jpg",
      id: "2289719454"
    },
    {
      name: "buzz.jpg",
      id: "455610836"
    },
    {
      name: "heather.jpg",
      id: "344884869"
    }
  ];

  let tags = [];
  for (let i = 0; i < detectableFaces.length; i++) {
    let face = detectableFaces[i];
    const params = {
      SourceImage: {
        S3Object: {
          Bucket: process.env.S3_BUCKET,
          Name: `rekognize/${face.name}`
        }
      },
      TargetImage: {
        S3Object: {
          Bucket: process.env.S3_BUCKET,
          Name: file
        }
      }
    };

    const response = await rekognition.compareFaces(params).promise();
    if (response.FaceMatches.length) {
      //console.log(response.FaceMatches[0].Face.BoundingBox);
      tags.push({
        user_id: face.id,
        position: [
          response.FaceMatches[0].Face.BoundingBox.Left +
            response.FaceMatches[0].Face.BoundingBox.Width / 2,
          response.FaceMatches[0].Face.BoundingBox.Top +
            response.FaceMatches[0].Face.BoundingBox.Height / 2
        ]
      });
    }
  }

  return { in: tags };
};

module.exports = { getTags, getUserTags };
