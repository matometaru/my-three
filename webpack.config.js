module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: "development",
  
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: {
      "001/index": "./src/001/index.ts",
      "002/index": "./src/002/index.ts",
      "003/index": "./src/003/index.ts",
      "raycast/index": "./src/raycast/index.ts",
      "house/index": "./src/house/index.ts",
    },
    // ファイルの出力設定
    output: {
      //  出力ファイルのディレクトリ名
      path: `${__dirname}/dist`,
      // 出力ファイル名
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          // 拡張子 .ts の場合
          test: /\.ts$/,
          // TypeScript をコンパイルする
          use: "ts-loader"
        }
      ]
    },
    // import 文で .ts ファイルを解決するため
    resolve: {
      extensions: [".ts", ".js"]
    },
    // ES5(IE11等)向けの指定（webpack 5以上で必要）
    target: ["web", "es5"],
    devServer: {
        contentBase: "dist",
        open: true
    }
};