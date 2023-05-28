import "antd/dist/antd.css";
import "./app/index.css";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script id="my-script" strategy="beforeInteractive" src="https://hm.baidu.com/hm.js?0a1ca7fd41de7c6002f320f032408621"></Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
