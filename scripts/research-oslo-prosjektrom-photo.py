#!/usr/bin/env python3
import json, re, html, urllib.request, urllib.parse
from html.parser import HTMLParser

HOST="https://lokalhistoriewiki.no"
UA={"User-Agent":"History-Go/1.0 (open source cultural heritage image provenance; GitHub History-Go)"}
def get(url):
    req=urllib.request.Request(url,headers=UA)
    with urllib.request.urlopen(req,timeout=25) as response:
        return response.read().decode("utf-8",errors="replace")
def api(params):
    return json.loads(get(HOST+"/w/api.php?"+urllib.parse.urlencode(params)))
try:
    parsed=api({"action":"parse","page":"Platous_gate_(Oslo)","prop":"images","format":"json"})
    images=parsed.get("parse",{}).get("images",[])
    print("ARTICLE_IMAGES",json.dumps(images,ensure_ascii=False))
    selected=[i for i in images if "platous" in i.casefold() or "18" in i.lower()]
    for fname in selected:
        title="Fil:"+fname
        info=api({"action":"query","titles":title,"prop":"imageinfo","iiprop":"url|extmetadata|size","format":"json"})
        print("FILE_INFO",json.dumps({"name":fname,"result":info},ensure_ascii=False)[:14000])
except Exception as e:
    print("MEDIAWIKI_API_ERROR",repr(e))
    try:
        data=get(HOST+"/wiki/Platous_gate_(Oslo)")
        print("ARTICLE_HTML_SIZE",len(data))
        hits=re.findall(r'<a[^>]+href="([^"]+)"[^>]*>[^<]*(?:Platous gate 18|Platous gate)[^<]*</a>',data,re.I)
        print("ARTICLE_LINKS",json.dumps([html.unescape(h) for h in hits],ensure_ascii=False))
        for line in re.findall(r'[^\n]{0,250}Platous gate 18[^\n]{0,250}',data,re.I)[:5]:
            print("NEAR_18",line[:800])
    except Exception as ex:
        print("HTML_ERROR",repr(ex))
        raise
