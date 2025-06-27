const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "CORS preflight handled" })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { fileName, fileContent, contentType } = body;

        if (!fileName || !fileContent) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "fileName and fileContent are required" })
            };
        }

        const buffer = Buffer.from(fileContent, "base64");

        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${uuidv4()}-${fileName}`,
            Body: buffer,
            ContentType: contentType || "application/octet-stream"
        };

        await s3.putObject(uploadParams).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "File uploaded successfully", fileKey: uploadParams.Key })
        };
    } catch (err) {
        console.error("Upload error:", err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to upload file", details: err.message })
        };
    }
};
