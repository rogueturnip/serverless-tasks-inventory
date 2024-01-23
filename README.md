# Serverless Media

This is a simple setup to do presignedurl uploads to S3 along with supporting APIs. It has the ability to getImages (both as an image or just the url) and delete images.

When an image is uploaded to the S3 bucket using the signed url (to the uploads path) an uploadImageProcessor lambda runs which will move the image to the right storage location (images/) and creates a resized image also. The data is stored in a sqlite3 database just for development purposes.

There is a build/ folder in the repo. This is the better-sqlite3 bindings to allow it to work with serverless-offline. All this should be replaced to function with a proper AWS setup and database.
