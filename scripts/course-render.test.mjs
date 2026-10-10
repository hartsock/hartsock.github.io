import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const ruby=String.raw`
require 'jekyll'; require 'json'; require 'nokogiri'
Jekyll::PluginManager.require_from_bundler
site=Jekyll::Site.new(Jekyll.configuration('quiet'=>true,'safe'=>true));site.reset;site.read
lesson=site.pages.find{|p|p.url=='/courses/ai-theology/session-3/'}
input=JSON.parse(STDIN.read)
lesson.content=lesson.content.gsub(input['remove'],'') if input['remove']
if input['edit']
 lesson.data['copy']['lesson_ui']['ask_box']='Edited question?'
 lesson.data['draft_record']['reviewed']=[{'by'=>'Reviewer','scope'=>'the lesson','date'=>'2026-10-10'}]
end
site.generate;site.render
text=lambda{|node|Nokogiri::HTML.fragment(node.to_html.gsub(/<\/(p|div|section|h[1-6]|li|td|th|button|label|summary|textarea|option)>/, ' </\\1>')).text.gsub(/\s+/,' ').strip}
page=Nokogiri::HTML(lesson.output)
body=page.at_css('[data-md="courses/ai-theology/session-3/index.md"]:not([data-md-key])')
golden=Nokogiri::HTML(File.read('scripts/fixtures/course-lesson.html'))
home=site.pages.find{|p|p.url=='/courses/'};course=site.pages.find{|p|p.url=='/courses/ai-theology/'}
puts '\nCOURSE_RESULT\n'+JSON.generate({'text'=>text.call(body),'golden'=>text.call(golden.at_css('body')),'lesson'=>lesson.output,'home'=>home.output,'course'=>course.output,'home_text'=>text.call(Nokogiri::HTML(home.output).at_css('#view')),'course_text'=>text.call(Nokogiri::HTML(course.output).at_css('#view'))})
`;
function render(input={}) {return spawnSync('bundle',['exec','ruby','-e',ruby],{encoding:'utf8',input:JSON.stringify(input),maxBuffer:8*1024*1024});}
function result(r) {assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout.split('\\nCOURSE_RESULT\\n')[1]);}
test('server-rendered lesson preserves original reading text, widgets and attribution',()=>{
 const r=result(render());assert.equal(r.text,r.golden);
 const pages=JSON.parse(readFileSync('scripts/fixtures/course-pages.json','utf8'));
 assert.equal(r.home_text.replace(/\s+:/g,':'),pages.home);assert.equal(r.course_text,pages.course);
 for(const name of ['lovelace-quote','next-word','meaning-map','question-model'])assert.equal(r.lesson.split('data-widget="'+name+'"').length,2);
 assert.match(r.home,/id="view" data-app="courses"/);assert.match(r.home,/Hartsock Courses/);
 assert.match(r.course,/href="\/courses\/ai-theology\/session-3\/"/);
 assert.match(r.lesson,/<article[^>]*>[\s\S]*<aside class="draft"/);
 assert.ok(r.lesson.indexOf('data-copy="lesson_prompt.assistant"')>r.lesson.indexOf('</main>'));
 assert.doesNotMatch(r.lesson, /\{widget |\{dimensions\}/);
});
test('lesson front-matter edits render without changing script code',()=>{
 const html=result(render({edit:true})).lesson;
 assert.match(html, /<textarea[^>]*>Edited question\?<\/textarea>/);
 assert.match(html,/data-md-key="draft_record.reviewed.0.by">Reviewer<\/span>/);
 assert.match(html,/data-md-key="draft_record.reviewed.0.scope">the lesson<\/span>/);
});
for(const remove of ['{widget next-word}','{dimensions}'])test('required lesson structure fails closed: '+remove,()=>{
 const r=render({remove});
 assert.notEqual(r.status,0);assert.match(r.stderr,/invalid-lesson-(widget|value)/);
});
