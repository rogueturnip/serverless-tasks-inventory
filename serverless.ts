import type { AWS } from "@serverless/typescript";
import { BUCKET } from "./src/config";
import addImage from "@functions/tasks/addImage";
import addInvImage from "@functions/inventory/addImage";
import createInventory from "@functions/inventory/createInventory";
import createTask from "@functions/tasks/createTask";
import deleteInventory from "@functions/inventory/deleteInventory";
import deleteTask from "@functions/tasks/deleteTask";
import getImages from "@functions/tasks/getImages";
import getInventories from "@functions/inventory/getInventories";
import getInventoriesByParentCategory from "@functions/inventory/getInventoriesByParentCategory";
import getInventoriesBySpace from "@functions/inventory/getInventoriesBySpace";
import getInventory from "@functions/inventory/getInventory";
import getTask from "@functions/tasks/getTask";
import getTasks from "@functions/tasks/getTasks";
import getTasksByParent from "@functions/tasks/getTasksByCategoryParent";
import removeImage from "@functions/tasks/removeImage";
import removeInvImage from "@functions/inventory/removeImage";
import updateImage from "@functions/tasks/updateImage";
import updateInvImage from "@functions/inventory/updateImage";
import updateInventory from "@functions/inventory/updateInventory";
import updateTask from "@functions/tasks/updateTask";

const serverlessConfiguration: AWS = {
  service: "serverless-tasks",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline"],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      REGION: "us-east-1",
      BUCKET,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  // import the function via paths
  functions: {
    addImage,
    getImages,
    removeImage,
    getTasks,
    getTask,
    createTask,
    updateTask,
    getTasksByParent,
    deleteTask,
    updateImage,
    addInvImage,
    updateInvImage,
    removeInvImage,
    getInventories,
    getInventory,
    createInventory,
    updateInventory,
    deleteInventory,
    getInventoriesBySpace,
    getInventoriesByParentCategory,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node20",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
