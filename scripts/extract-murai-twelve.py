"""Quotation-free extraction of every outline in Murai's Minor Prophets family."""
from pathlib import Path
import re,html,json,hashlib
ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'scripts/cache/structures'
OUT=ROOT/'scripts/structure-sources/murai-twelve.json'
BASE='http://www.bible.literarystructure.info/bible/'
def clean(s):return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>','',s))).strip()
def letters(n):
 out=''
 while n:n,i=divmod(n-1,26);out=chr(65+i)+out
 return out
files=['96_MinorProphets_e.html']+[f'96_MinorProphets_e_{n}.html' for n in [1,2,4,5]]+['96_MinorProphets_pericope_e.html']
inputs=[];maps=[];inventory=[]
for file in files:
 raw=(CACHE/file).read_bytes();inputs.append(dict(file=file,url=BASE+file,sha256=hashlib.sha256(raw).hexdigest()))
index=(CACHE/files[0]).read_text(encoding='utf-8')
pericopes={}
for a,title,ref in re.findall(r'<a href="96_MinorProphets_pericope_e.html#(\d+)">(.*?)</a>\s*\(([^)]+)\)',index):
 n=int(a);pericopes[n]=dict(title=re.sub(r'^\d+\s*','',clean(title)),ref=clean(ref))
assert list(pericopes)==list(range(1,102))
for file in files[1:5]:
 s=(CACHE/file).read_text(encoding='utf-8');count=0
 for section in re.finditer(r'<h3><a name="([\d-]+)">.*?</h3>(.*?)(?=<hr><h3>|<br>Citations|<br /><br /><a rel="license"|\Z)',s,re.S):
  locator,body=section.groups();outline,table=body.split('<table',1)
  ids=[int(n) for n in re.findall(r'<a href="96_MinorProphets_pericope_e.html#(\d+)">',outline)]
  if not ids:raise ValueError('Empty outline '+locator)
  pairs=[];relationships={};labels={}
  for row in re.findall(r'<tr\b[^>]*>(.*?)</tr>',table,re.S):
   cells=re.findall(r'<td\b[^>]*>(.*?)</td>',row,re.S)
   if len(cells)!=3:continue
   left=re.search(r'pericope_e.html#(\d+)',cells[0]);right=re.search(r'pericope_e.html#(\d+)',cells[2])
   if not left or not right:continue
   a,b=int(left[1]),int(right[1]);label=letters(len(pairs)+1)
   if a in labels or b in labels:raise ValueError('Duplicatepair '+locator)
   labels[a]=label;labels[b]=label+'′';pairs.append((a,b));relationships[label]=clean(cells[1])
  centers=[i for i in ids if i not in labels]
  if len(centers)>1:raise ValueError('Multiple unpairednodes '+locator)
  centerLabel=letters(len(pairs)+1) if centers else None
  if centers:labels[centers[0]]=centerLabel
  assert set(ids)==set(labels)
  nodes=[dict(label=labels[i],ref=pericopes[i]['ref'],title=pericopes[i]['title'],sourcePosition=i) for i in ids]
  assert [n['label'].replace('′','') for n in nodes]==[n['label'].replace('′','') for n in nodes][::-1]
  m=dict(id='murai-minorprophets-'+locator,sourceId='murai-web-2026',title='The Twelve: '+('whole collection' if locator=='1-1' else 'divided structure '+locator),sourceFile=file,sourceUrl=BASE+file+'#'+locator,locator='Published diagram '+locator+' and its complete correspondence table',boundaries=nodes[0]['ref']+' … '+nodes[-1]['ref'],nodes=nodes,relationships=relationships,kind='Concentric structure' if centers else 'Chiasm',note='Complete published hierarchical outline of the Minor Prophets collection. Pair letters are ChiFold display labels derived from the explicit correspondence table; source pericope positions and references are retained. The page credits John Warren for suggesting this structure. Scripture quotation rows/columns are omitted. Source numbering requires separately verified edition mappings; source diagram remains independent.')
  if centerLabel:m['centerLabel']=centerLabel
  maps.append(m);count+=1
 expected=int(re.search(r'_e_(\d+)',file)[1]);assert count==expected,(file,count,expected)
 inventory.append(dict(sourceFile=file,tables=count,importedTables=count,excludedTables=0,sourceDiagrams=count))
# All local outlines on the collection's linked pericope page are preserved too.
file=files[-1];s=(CACHE/file).read_text(encoding='utf-8');count=0
for match in re.finditer(r'<table summary="(\d+)">(.*?)</table>',s,re.S):
 n=int(match[1]);body=match[2];heading=re.search(r'<strong>\[\d+\](.*?)</strong>.*?\(([^)]+)\)',body,re.S)
 if not heading:raise ValueError('Missing pericopeheading '+str(n))
 title,sourceBoundary=clean(heading[1]),clean(heading[2]);prefix=re.match(r'([A-Za-z]+)',pericopes[n]['ref'])[1]
 nodes=[]
 for cell in re.findall(r'<td\b[^>]*>(.*?)</td>',body,re.S):
  parsed=re.fullmatch(r'([A-Za-z][A-Za-z0-9\'′’]*):?\s*\(([^)]+)\)',clean(cell))
  if not parsed:continue
  label,ref=parsed.groups();label=label.replace("'",'′').replace('’','′')
  nodes.append(dict(label=label,ref=prefix+ref,title='Source element '+label))
 if not nodes:raise ValueError('Empty pericopeoutline '+str(n))
 tail=s[match.end():];tail=tail.split('<table summary=',1)[0]
 relationText=clean(tail.split('<tr><td><br>',1)[0]);relationships={}
 for rel in re.finditer(r'(?:^|\s)([A-Z][A-Za-z0-9]*):\s*(.*?)(?=\s+[A-Z][A-Za-z0-9]*:\s|$)',relationText):relationships[rel[1]]=rel[2]
 bases=[x['label'].replace('′','') for x in nodes];reversedPattern=bases==bases[::-1];unique={v:bases.count(v) for v in bases};center=nodes[len(nodes)//2]['label'] if reversedPattern and len(nodes)%2==1 and all(c<=2 for c in unique.values()) else None
 m=dict(id=f'murai-minorprophets-pericope-{n}',sourceId='murai-web-2026',title=title,sourceFile=file,sourceUrl=BASE+file+'#'+str(n),locator='Pericope '+str(n)+'; complete published local outline',boundaries=pericopes[n]['ref'],nodes=nodes,relationships=relationships,kind='Concentric structure' if center else 'Chiasm' if reversedPattern else 'Parallel / multi-part structure',note='Complete source pericope outline, including any prologue labels. Book prefix comes from the source correspondence index. The source heading ('+sourceBoundary+') and index boundary ('+pericopes[n]['ref']+') may differ; both are retained rather than silently corrected. Quoted Scripture is excluded; source relationship notes retained when supplied. Numbering mappings require separate verification.')
 if center:m['centerLabel']=center
 maps.append(m);count+=1
assert count==101
inventory.append(dict(sourceFile=file,tables=count,importedTables=count,excludedTables=0,sourceDiagrams=count))
inventory.insert(0,dict(sourceFile=files[0],tables=1,importedTables=0,excludedTables=1,reason='Correspondence navigation index; all101 pericope entries retained as references for the actual diagrams, not counted as a separate structure.'))
OUT.write_text(json.dumps(dict(inputs=inputs,maps=maps,inventory=inventory),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(totalMaps=len(maps),hierarchical=12,pericopes=101,inventory=inventory),ensure_ascii=False))

