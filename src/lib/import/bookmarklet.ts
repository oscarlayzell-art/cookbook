/**
 * The "Save to Cook Book" bookmarklet. It runs on the recipe page in the user's own browser,
 * so it works on sites that block requests from our server. It collects only the parts of the
 * page the parser reads (recipe data, page metadata) and sends them to our /save page.
 *
 * It submits a form in the same tab rather than opening a new one, because phones (iPhone
 * Safari especially) block or lose pop-ups. If the recipe site's security rules block the form,
 * it falls back to the older pop-up method.
 */
export function bookmarkletHref(origin: string): string {
  const source = `(()=>{
var o=${JSON.stringify(origin)};
var parts=[].slice.call(document.querySelectorAll('script[type="application/ld+json"],meta[property^="og:"],meta[name="description"],title')).map(function(e){return e.outerHTML});
var md=document.querySelector('[itemtype*="schema.org/Recipe"]');
if(md)parts.push(md.outerHTML);
var html=('<html><head>'+parts.join('')+'</head></html>').slice(0,900000);
var f=document.createElement('form');f.method='POST';f.action=o+'/save';f.acceptCharset='UTF-8';f.style.display='none';
[['url',location.href],['html',html]].forEach(function(p){var i=document.createElement('textarea');i.name=p[0];i.value=p[1];f.appendChild(i)});
document.body.appendChild(f);
var popped=false;
function popup(){if(popped)return;popped=true;
var w=window.open(o+'/book/receive','cookbook');
if(!w){alert('Please allow pop-ups for this site to save the recipe.');return;}
var msg={type:'cookbook-page',url:location.href,html:html};
var n=0,t=setInterval(function(){try{w.postMessage(msg,o)}catch(e){}if(++n>60)clearInterval(t)},500);
window.addEventListener('message',function(e){if(e.origin===o&&e.data==='cookbook-received')clearInterval(t)});
}
document.addEventListener('securitypolicyviolation',function(e){if(/form-action/.test(e.violatedDirective||e.effectiveDirective||''))popup()});
try{f.submit()}catch(e){popup()}
})()`;
  return "javascript:" + encodeURIComponent(source.replace(/\n/g, ""));
}
