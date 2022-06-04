import { Spin, Upload, Input, Button } from "antd";
import { useEffect, useRef, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { InboxOutlined } from "@ant-design/icons";
import { fileTypeFromBuffer } from "file-type";
import numerify from "numerify/lib/index.cjs";

const { Dragger } = Upload;

const App = () => {
  const [spinning, setSpinning] = useState(false);
  const [tip, setTip] = useState(false);
  const [first, setFirst] = useState("-i");
  const [second, setSecond] = useState("");
  const [href, setHref] = useState("");
  const [file, setFile] = useState();
  const [name, setName] = useState("input.mp4");
  const [output, setOutput] = useState("output.mp4");
  const ffmpeg = useRef();

  const handleExec = async () => {
    if (!file) {
      return;
    }
    const { name } = file;
    ffmpeg.current.FS("writeFile", name, await fetchFile(file));

    setSpinning(true);
    await ffmpeg.current.run(
      ...first.split(" "),
      name,
      ...second.split(" "),
      output
    );
    setSpinning(false);

    const data = ffmpeg.current.FS("readFile", output);
    const type = await fileTypeFromBuffer(data.buffer);

    const objectURL = URL.createObjectURL(
      new Blob([data.buffer], { type: type.mime })
    );
    setHref(objectURL);
  };

  useEffect(() => {
    (async () => {
      ffmpeg.current = createFFmpeg({ log: true, corePath: "/ffmpeg-core.js" });
      ffmpeg.current.setProgress(({ ratio }) => {
        console.log(ratio);
        setTip(numerify(ratio, "0.0%"));
      });
      setTip("静态资源加载中...");
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

      <Dragger
        beforeUpload={(item) => {
          setFile(item);
          setName(item.name);
          return false;
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件上传</p>
      </Dragger>

      <div className="exec">
        ffmpeg
        <Input
          value={first}
          onChange={(event) => setFirst(event.target.value)}
        />
        {name}
        <Input
          value={second}
          onChange={(event) => setSecond(event.target.value)}
        />
        <Input
          value={output}
          onChange={(event) => setOutput(event.target.value)}
        />
      </div>
      <Button type="primary" disabled={!Boolean(file)} onClick={handleExec}>
        执行
      </Button>
      <br />
      <br />
      {href && (
        <a href={href} download={output}>
          下载文件
        </a>
      )}
    </div>
  );
};

export default App;
