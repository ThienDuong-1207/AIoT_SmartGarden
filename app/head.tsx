export default function Head() {
  return (
    <>
      <script
        id="theme-init"
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var saved=localStorage.getItem('sg-theme');var preferred=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';var theme=saved||preferred;document.documentElement.setAttribute('data-theme',theme);}catch(e){}})();`,
        }}
      />
    </>
  );
}
