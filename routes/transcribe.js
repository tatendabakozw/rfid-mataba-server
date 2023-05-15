const express = require("express");
const router = express.Router();
const fs = require("fs");
const axios = require("axios");
const speech = require("@google-cloud/speech");
const ffmpeg = require("fluent-ffmpeg");

const client = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const encoding = "LINEAR16";
const sampleRateHertz = 16000;
const languageCode = "en-US";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

// change text to speech
// post request
// /api/transcribe/new
router.post("/new", upload.single("file"), async (req, res, next) => {
  try {
    const file = await req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    }

    const name = file.filename;
    const path = __dirname + "/uploads/" + name;
    const encodedPath = __dirname + "/uploads/encoded_" + name;
    const file1 = fs.createWriteStream(path);

    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      next(err);
    });

    blobStream.on("finish", async () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = await format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      const request = {
        config: {
          encoding: encoding,
          sampleRateHertz: sampleRateHertz,
          languageCode: languageCode,
        },
        audio: {
          uri: "gs://YOUR-Bucket-Name/File-name.ext",
        },
      };
      // Stream the audio to the Google Cloud Speech API
      const [response] = await client.recognize(request);
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");
      console.log(`Transcription: `, transcription);
      res
        .status(200)
        .send({
          success: "true",
          message: "Text retrieved successfully",
          text: transcription,
        })
        .end();
    });
    blobStream.end(req.file.buffer);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
