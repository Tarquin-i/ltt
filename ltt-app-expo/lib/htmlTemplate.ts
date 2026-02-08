interface HtmlTemplateOptions {
  content: string;
  fontSize: number;
  isDark: boolean;
}

export function buildHtmlDocument(options: HtmlTemplateOptions): string {
  const { content, fontSize, isDark } = options;
  const bg = isDark ? '#1a1a1a' : '#fff';
  const color = isDark ? '#f0f0f0' : '#333';
  const linkColor = isDark ? '#6ba3d6' : '#1a73e8';
  const h1Color = isDark ? '#ffffff' : '#111';
  const h2Color = isDark ? '#f5f5f5' : '#222';
  const borderColor = isDark ? '#444' : '#ddd';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-size: ${fontSize}px;
  color: ${color};
  background: ${bg};
  line-height: 1.8;
  padding: 16px;
  word-wrap: break-word;
  -webkit-text-size-adjust: none;
}
p {
  font-size: ${fontSize}px;
  color: ${color};
  margin: 0.8em 0;
  text-indent: 2em;
}
h2 {
  font-size: ${fontSize + 6}px;
  color: ${h1Color};
  margin: 1.2em 0 0.6em;
}
h3 {
  font-size: ${fontSize + 4}px;
  color: ${h2Color};
  margin: 1em 0 0.5em;
}
h4 {
  font-size: ${fontSize + 2}px;
  color: ${h2Color};
  margin: 0.8em 0 0.4em;
}
img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  ${isDark ? 'opacity: 0.85;' : ''}
}
table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}
td {
  font-size: ${fontSize}px;
  padding: 4px 8px;
  border: 1px solid ${borderColor};
  color: ${color};
}
a {
  font-size: ${fontSize}px;
  color: ${linkColor};
  text-decoration: none;
}
div, span {
  font-size: ${fontSize}px;
  color: ${color};
}
hr {
  border: none;
  border-top: 1px solid ${borderColor};
  margin: 1.5em 0;
}
blockquote {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 3px solid ${borderColor};
  color: ${isDark ? '#ccc' : '#555'};
}
</style>
<script>
let _scrollTimer = null;
window.addEventListener('scroll', function() {
  if (_scrollTimer) clearTimeout(_scrollTimer);
  _scrollTimer = setTimeout(function() {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'scroll',
      scrollTop: window.scrollY || document.documentElement.scrollTop
    }));
  }, 200);
});
window.addEventListener('load', function() {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
});
function scrollToPosition(y) {
  window.scrollTo(0, y);
}
function scrollToAnchor(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
</script>
</head>
<body>
${content}
</body>
</html>`;
}
