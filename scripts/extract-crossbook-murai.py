import re,html,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
cache=ROOT/'scripts/cache/structures';out=ROOT/'scripts/structure-sources/crossbook-murai.json'
clean=lambda s: re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>','',s))).strip()
def letter(n):
 s=''
 while n:
  n,k=divmod(n-1,26);s=chr(65+k)+s
 return s
specs=[('97_ExodusNumbers_e.html','murai-exodus-numbers','Exodus and Numbers: parallel journeys','Parallel / multi-part structure','Exodus 1:1–40:38; Numbers 1:1–36:13'),('98_JohnRevelation_e.html','murai-john-revelation','John and Revelation: reversed correspondences','Chiasm','John 1:1–21:25; Revelation 1:1–22:21'),('99_LukeActs_e.html','murai-luke-acts','Luke and Acts: parallel correspondences','Parallel / multi-part structure','Luke 1:1–24:53; Acts 1:1–28:31')]
inputs=[];maps=[]
for file,id,title,kind,boundaries in specs:
 raw=(cache/file).read_bytes();s=raw.decode('utf-8');url='http://www.bible.literarystructure.info/bible/'+file
 inputs.append(dict(file=file,url=url,sha256=hashlib.sha256(raw).hexdigest()))
 left=[];right=[];relationships={};paired=0
 for rowNo,r in enumerate(re.findall(r'<tr\b[^>]*>(.*?)</tr>',s,re.S|re.I),1):
  cells=re.findall(r'<td\b[^>]*>(.*?)</td>',r,re.S|re.I)
  if len(cells)<4 or not re.fullmatch(r'\d+',clean(cells[0])):continue
  l=re.search(r'<a\b[^>]*>(.*?)</a>(.*)',cells[1],re.S|re.I)
  if not l:raise ValueError('Missing left ref '+file+str(rowNo))
  leftN=int(clean(cells[0]));rr=re.search(r'<a\b[^>]*>(.*?)</a>(.*)',cells[4],re.S|re.I) if len(cells)==5 else None
  if rr:
   paired+=1;label=letter(paired);relation=clean(cells[2]);relationships[label]=relation or 'No correspondence explanation supplied in source'
   rightN=int(clean(cells[3]));ref=clean(rr[1]);right.append(dict(label=label+'′',ref=ref,title=clean(rr[2]) or ref,sourcePosition=rightN,sourceTableRow=rowNo))
  else:label='Unpaired'+letter(leftN)
  ref=clean(l[1]);left.append(dict(label=label,ref=ref,title=clean(l[2]) or ref,sourcePosition=leftN,sourceTableRow=rowNo))
 assert len(left)=={'97_ExodusNumbers_e.html':49,'98_JohnRevelation_e.html':81,'99_LukeActs_e.html':145}[file]
 assert len(right)=={'97_ExodusNumbers_e.html':49,'98_JohnRevelation_e.html':81,'99_LukeActs_e.html':49}[file]
 assert [n['sourcePosition'] for n in left]==list(range(1,len(left)+1))
 assert sorted(n['sourcePosition'] for n in right)==list(range(1,len(right)+1))
 nodes=left+sorted(right,key=lambda n:n['sourcePosition'])
 note='Complete quotation-free extraction of the source comparison table. Source pericope positions are retained; pair letters are ChiFold display labels, not labels printed in the table. Scripture quotation rows are excluded. Source references including subverse letters and compound ranges remain unchanged. '
 if file.startswith('98'):note+='All81 pairs form a reverse-order comparison across John and Revelation. No unique center is specified. This is Murai’s proposed inter-book structure, not an assertion of common authorship or direct borrowing.'
 else:note+='The source comparisons run in the same direction. This is parallel organization, not a reverse-order chiasm; no unique center is specified.'
 if file.startswith('99'):note+=' All96 unpaired Luke sections are retained as independent sections, not assigned invented Acts counterparts.'
 maps.append(dict(id=id,title=title,sourceId='murai-web-2026',sourceFile=file,sourceUrl=url,locator=f'Complete relationships table: {len(left)} left-side source segments; {len(right)} paired right-side segments',boundaries=boundaries,nodes=nodes,relationships=relationships,kind=kind,note=note))
inventory=[dict(sourceFile=m['sourceFile'],tables=1,importedTables=1,excludedTables=0,nodes=len(m['nodes']),pairs=len(m['relationships']),unpairedNodes=len(m['nodes'])-2*len(m['relationships']),classification=m['kind'],verification='Every numbered left source segment and every paired right segment retained; ordinal sequences checked independently; quotation-only second rows excluded.') for m in maps]
out.write_text(json.dumps(dict(inputs=inputs,maps=maps,inventory=inventory),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print([(m['id'],len(m['nodes']),len(m['relationships']),m['kind']) for m in maps])

