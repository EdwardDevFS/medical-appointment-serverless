const path = require("path");

module.exports = {
  target: "node",
  mode: "production",
  entry: {
    appointmentHandler: "./src/interfaces/http/appointmentHandler.ts",
    appointmentPeHandler: "./src/interfaces/sqs/appointmentPeHandler.ts",
    appointmentClHandler: "./src/interfaces/sqs/appointmentClHandler.ts",
    confirmationHandler: "./src/interfaces/confirmation/confirmationHandler.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, ".webpack"),
    libraryTarget: "commonjs2",
  },
  externals: {
    "aws-sdk": "aws-sdk",
    "mysql2/promise": "mysql2/promise",
  },
  optimization: {
    minimize: false,
  },
};