import "antd/dist/antd.css";
import "./app/index.css";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script id="my-script" strategy="beforeInteractive">
        {`
          var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?0a1ca7fd41de7c6002f320f032408621";
            var s = document.getElementsByTagName("script")[0]; 
            s.parentNode.insertBefore(hm, s);
          })();
        `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
