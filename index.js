const fs = require("fs");
var { spawn, exec } = require("child_process");

const DIR_INPUT = "./input";
const DIR_OUTPUT = "./output";
const DIR_TMP_FRAMES = "./tmp_frames";
const DIR_OUT_FRAMES = "./out_frames";
const TEMP_FILE = "temp.mkv";

if (fs.existsSync(DIR_TMP_FRAMES)) {
  fs.rmSync(DIR_TMP_FRAMES, { recursive: true, force: true });
}

if (fs.existsSync(DIR_OUT_FRAMES)) {
  fs.rmSync(DIR_OUT_FRAMES, { recursive: true, force: true });
}

fs.mkdirSync(DIR_TMP_FRAMES);
fs.mkdirSync(DIR_OUT_FRAMES);

if (fs.existsSync(TEMP_FILE)) {
  fs.unlinkSync(TEMP_FILE);
}

let fileObjs = fs.readdirSync(DIR_INPUT, { withFileTypes: false });

fileObjs.forEach((file) => {
  if (!file.includes("mkv")) {
    return;
  }
  let command1 = "ffmpeg -i " + file + " -vsync cfr -c:a copy " + TEMP_FILE;
  file = DIR_INPUT + "/" + file;

  var cmd = "ffmpeg";

  var args = ["-i", file, "-vsync", "cfr", "-c:a", "copy", TEMP_FILE];

  var proc = spawn(cmd, args);

  proc.stdout.on("data", function (data) {
    //console.log(data);
  });

  proc.stderr.setEncoding("utf8");
  proc.stderr.on("data", function (data) {
    //console.log(data);
  });

  proc.on("close", function () {
    console.log("Finished 1st command...");
    if (fs.existsSync(TEMP_FILE)) {
      args = [
        "-i",
        TEMP_FILE,
        "-qscale:v",
        "1",
        "-qmin",
        "1",
        "-qmax",
        "1",
        "-vf",
        "scale=810x540",
        "-vsync",
        "0",
        "tmp_frames/frame%08d.png",
      ];

      let proc2 = spawn(cmd, args);

      proc2.stdout.on("data", function (data) {
        //console.log(data);
      });

      proc2.stderr.setEncoding("utf8");
      proc2.stderr.on("data", function (data) {
        //console.log(data);
      });

      proc2.on("close", function () {
        console.log("Finished 2nd command...");
        cmd = "realesrgan-ncnn-vulkan.exe";
        args = ["-i", "tmp_frames", "-o", "out_frames", "-n", "realesr-animevideov3", "-s", "4", "-f", "jpg"];

        let proc3 = spawn(cmd, args);

        proc3.stdout.on("data", function (data) {
          //console.log(data);
        });

        proc3.stderr.setEncoding("utf8");
        proc3.stderr.on("data", function (data) {
          //console.log(data);
        });

        proc3.on("close", function () {
          console.log("Finished 3rd command...");

          cmd = "ffmpeg";
          args = [
            "ffmpeg",
            "-framerate",
            "23.98",
            "-i",
            "out_frames/frame%08d.jpg",
            "-i",
            file,
            "-map",
            "0:v:0",
            "-map",
            "1:a?",
            "-map",
            "1:s?",
            "-map",
            "1:t?",
            "-c:a",
            "copy",
            "-c:s",
            "copy",
            "-c:t",
            "copy",
            "-c:v",
            "libx264",
            "-r",
            "23.98",
            "-pix_fmt",
            "yuv420p",
            "-aspect",
            "16:9",
            (DIR_OUTPUT + "/" + file.replace(".mkv", " (Upscaled).mkv")),
          ];

          let proc4 = spawn(cmd, args);

          proc4.stdout.on("data", function (data) {
            //console.log(data);
          });

          proc4.stderr.setEncoding("utf8");
          proc4.stderr.on("data", function (data) {
            //console.log(data);
          });
          proc3.on("close", function () {
            console.log("Finished 4th command...");
          });
        });
      });
    }
  });
});
