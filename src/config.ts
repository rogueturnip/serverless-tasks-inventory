export const BUCKET = "media-uploads";

export const s3Config = process.env.IS_OFFLINE
  ? {
      forcePathStyle: true,
      credentials: {
        accessKeyId: "S3RVER", // This specific key is required when working offline
        secretAccessKey: "S3RVER",
      },
      endpoint: "http://localhost:4569",
    }
  : { region: process.env.REGION };
