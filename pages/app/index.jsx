import { Spin, Upload, Input, Button, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { InboxOutlined } from "@ant-design/icons";
import { fileTypeFromBuffer } from "file-type";
import numerify from "numerify/lib/index.cjs";

const { Dragger } = Upload;

const App = () => {
  const [spinning, setSpinning] = useState(false);
  const [tip, setTip] = useState(false);
  const [inputOptions, setInputOptions] = useState("-i");
  const [outputOptions, setOutputOptions] = useState("");
  const [href, setHref] = useState("");
  const [file, setFile] = useState();
  const [fileList, setFileList] = useState([]);
  const [name, setName] = useState("input.mp4");
  const [output, setOutput] = useState("output.mp4");
  const ffmpeg = useRef();

  const handleExec = async () => {
    if (!file) {
      return;
    }
    try {
      setTip("Loading file into browser");
      setSpinning(true);
      const { name } = file;
      for (const fileItem of fileList) {
        ffmpeg.current.FS(
          "writeFile",
          fileItem.name,
          await fetchFile(fileItem)
        );
      }
      setTip("start executing the command");
      await ffmpeg.current.run(
        ...inputOptions.split(" "),
        name,
        ...outputOptions.split(" "),
        output
      );
      setSpinning(false);

      const data = ffmpeg.current.FS("readFile", output);
      const type = await fileTypeFromBuffer(data.buffer);

      const objectURL = URL.createObjectURL(
        new Blob([data.buffer], { type: type.mime })
      );
      setHref(objectURL);
      message.success(
        "Run successfully, click the download button to download the output file",
        10
      );
    } catch (err) {
      console.error(err);
      message.error(
        "Failed to run, please check if the command is correct or open the console to view the error details",
        10
      );
    }
  };

  useEffect(() => {
    (async () => {
      ffmpeg.current = createFFmpeg({ log: true, corePath: "/ffmpeg-core.js" });
      ffmpeg.current.setProgress(({ ratio }) => {
        console.log(ratio);
        setTip(numerify(ratio, "0.0%"));
      });
      setTip("ffmpeg static resource loading...");
      setSpinning(true);
      await ffmpeg.current.load();
      setSpinning(false);
    })();
  }, []);

  return (
    <div className="page-app">
      {spinning && (
        <Spin spinning={spinning} tip={tip}>
          <div className="component-spin" />
        </Spin>
      )}

      <h2 align="center">ffmpeg-online</h2>

      <Dragger
        multiple
        beforeUpload={(file, fileList) => {
          setFile(file);
          setFileList((v) => [...v, ...fileList]);
          setName(file.name);
          return false;
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file upload</p>
      </Dragger>

      <div className="exec">
        ffmpeg
        <Input
          value={inputOptions}
          placeholder="please enter input options"
          onChange={(event) => setInputOptions(event.target.value)}
        />
        {name}
        <Input
          value={outputOptions}
          placeholder="please enter output options"
          onChange={(event) => setOutputOptions(event.target.value)}
        />
        <Input
          value={output}
          placeholder="Please enter the download file name"
          onChange={(event) => setOutput(event.target.value)}
        />
      </div>
      <Button type="primary" disabled={!Boolean(file)} onClick={handleExec}>
        run
      </Button>
      <br />
      <br />
      {href && (
        <a href={href} download={output}>
          download file
        </a>
      )}
    </div>
  );
};

export default App;
