const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // ✅ SDK v3
const uuidv4 = () => Date.now().toString();

const s3 = new S3Client();

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: "CORS preflight handled." }),
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { fileName, fileContent, contentType } = body;

        if (!fileName || !fileContent) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "fileName and fileContent are required." }),
            };
        }

        const buffer = Buffer.from(fileContent, 'base64');
        const uniqueFileName = `${uuidv4()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: contentType || 'application/octet-stream',
        });

        await s3.send(command);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "File uploaded successfully",
                fileKey: uniqueFileName,
            }),
        };
    } catch (err) {
        console.error("Upload error:", err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
