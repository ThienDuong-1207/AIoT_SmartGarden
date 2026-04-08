export default function Head() {
  return (
    <>
      <script
        id="theme-init"
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var saved=localStorage.getItem('sg-theme');var preferred='forest';var theme=(saved==='dark'?'forest':saved==='light'?'forest':saved==='forest'||saved==='ocean'||saved==='sunset'?saved:preferred);localStorage.setItem('sg-theme',theme);document.documentElement.setAttribute('data-theme',theme);}catch(e){}})();`,
        }}
      />
    </>
  );
}
