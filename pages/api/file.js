import formidable from "formidable"
import { createRouter } from "next-connect"
import multer from 'multer';
import path from 'path';
import AWS from 'aws-sdk'
import fs from 'fs'


let uniqueSuffix;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    uniqueSuffix = file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, uniqueSuffix)
  }
})

const upload = multer({ storage: storage })
const uploadFile = upload.single('img')

const router = createRouter();
router.use(uploadFile);


router.post( async (req, res) => {
  const file = fs.readFileSync('uploads/' + uniqueSuffix);

  const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ID,
    secretAccessKey: process.env.S3_SECRET
  })

  const params = {
    Bucket: process.env.S3_NAME,
    Key: 'testes/' + uniqueSuffix,
    Body: file
  }

  const data = await s3.upload(params).promise()
  console.log('DATA FROM BACKEND', data)
  return res.status(200).json({fileUrl: data.Location})
})

export default router.handler({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Page is not found");
  },
})


export const config = {
  api: {
    bodyParser: false
  }
}