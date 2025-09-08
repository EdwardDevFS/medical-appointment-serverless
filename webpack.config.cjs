const path = require("path");
const glob = require("glob");

const handlers = glob.sync("./src/interfaces/**/*Handler.ts").reduce((acc, file) => {
  // extraemos la ruta sin extensión
  const name = file.replace("./src/interfaces/", "").replace(/\.ts$/, "");
  acc[name] = file;
  return acc;
}, {});

module.exports = {
  target: "node",
  mode: "production",
  entry: handlers,
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
