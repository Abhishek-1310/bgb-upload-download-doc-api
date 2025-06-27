const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "CORS preflight handled" })
        };
    }

    try {
        const queryParams = event.queryStringParameters || {};
        const { filename } = queryParams;

        if (!filename) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Filename query parameter is required" })
            };
        }

        const signedUrl = s3.getSignedUrl("getObject", {
            Bucket: process.env.BUCKET_NAME,
            Key: filename,
            Expires: 60 * 5 // 5 minutes
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ downloadUrl: signedUrl })
        };
    } catch (err) {
        console.error("Download error:", err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to generate download link", details: err.message })
        };
    }
};
