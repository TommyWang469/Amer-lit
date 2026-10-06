import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';
import { finalizePresentation, resolvePresentationFont } from '/Users/hongqingwang/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations/container_tools/artifact_tool_utils.mjs';

const root='/Users/hongqingwang/Documents/GitHub/Amer-lit';
const build=path.join(root,'.myth-build');
const skill='/Users/hongqingwang/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const data=JSON.parse(await fs.readFile(path.join(build,'story.json'),'utf8'));
const family=resolvePresentationFont({fontFamily:'Arial'});
const p=Presentation.create({slideSize:{width:960,height:540}});
function text(slide,content,x,y,w,h,size,color='#111111',bold=false){
  const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  s.text=content;
  s.text.style={typeface:family,fontSize:size,color,bold,autoFit:'none'};
  return s;
}
async function pic(slide,file,x,y,w,h,alt){
  slide.images.add({blob:new Uint8Array(await fs.readFile(path.join(build,file))),contentType:file.endsWith('.jpg')?'image/jpeg':'image/png',alt,fit:'contain',...(file==='image2.png'?{crop:{left:0.18,top:0.25,right:0.18,bottom:0.25}}:{}),position:{left:x,top:y,width:w,height:h}});
}
const originals={fight:'image3.jpg',fall:'image1.png',bear:'image2.png',dog:'image6.png',flame:'image7.png'};
for(let i=0;i<data.length;i++){
  const d=data[i];
  const s=p.slides.add();s.background.fill='#FFFFFF';
  let credit='';
  if(d.part===0){
    text(s,d.title,70,60,820,80,64);
    text(s,d.caption,75,155,820,44,29,'#555555');
    await pic(s,'image2.png',65,245,270,235,'Brown bear from the original group deck');
    await pic(s,'image4.png',355,240,230,240,'Lion from the original group deck');
    await pic(s,'image6.png',620,245,270,235,'Dog from the original group deck');
    credit='Images: reused from the supplied group PowerPoint. Original labels identify Canva, Socosto, and Tsukatte.';
  }else{
    text(s,`Part ${d.part}`,42,25,830,27,19,'#666666');
    text(s,d.title,40,65,880,64,40);
    text(s,d.caption,42,177,330,210,29,'#3E3E3E');
    if(d.art==='animals'){
      await pic(s,'image4.png',400,182,165,226,'Lion who finds Arthur');
      await pic(s,'image2.png',580,205,160,175,'Bear who helps Arthur');
      await pic(s,'image6.png',755,182,165,226,'Dog who checks Arthur’s hand');
      credit='Images: reused from the supplied group PowerPoint. Original labels identify Canva, Socosto, and Tsukatte.';
    }else if(d.art==='thief'){
      await pic(s,'image5.png',435,153,330,323,'Varek represented by the thief illustration from the group deck');
      await pic(s,'image7.png',760,238,160,180,'The stolen creation flame');
      credit='Images: reused from the supplied group PowerPoint. Original labels identify Socosto and IllustCute.';
    }else if(originals[d.art]){
      await pic(s,originals[d.art],425,145,490,330,d.title);
      credit='Image: reused from the supplied group PowerPoint.';
    }else{
      await pic(s,`${d.art}.png`,400,140,525,350,d.title);
      credit='Illustration: AI-generated for this presentation.';
    }
    text(s,String(i+1),880,505,40,23,16,'#777777');
  }
  s.speakerNotes.textFrame.setText(d.notes ? `${d.notes}\n\n${credit}` : credit);
}
const draft=path.join(build,'candidate.pptx');
await fs.mkdir(path.join(root,'assignments/creation-myth/presentations'),{recursive:true});
await (await PresentationFile.exportPptx(p)).save(draft);
await finalizePresentation({workspaceDir:root,candidatePath:draft,finalPath:path.join(root,'assignments/creation-myth/presentations','Arthurs-Journey.pptx'),pythonExecutable:'/Users/hongqingwang/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools','inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools','inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','9144000,5143500','--validate-heading-fit'],fontPolicy:{basis:'design',families:[family]},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation-v2.json')});
console.log('Finalized 14 slides. Narration:',data.reduce((n,d)=>n+d.notes.split(/\s+/).filter(Boolean).length,0),'words.');
