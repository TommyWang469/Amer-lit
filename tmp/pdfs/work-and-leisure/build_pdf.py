from pathlib import Path
from html import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, NextPageTemplate

ROOT = Path('/Users/hongqingwang/Documents/GitHub/Amer-lit')
BASE = ROOT / 'assignments/work-and-leisure'
OUTPUT = BASE / 'final/Work-and-Leisure-Original-and-Revised.pdf'
original = (BASE / 'notes/original-latest.txt').read_text().strip().split('\n\n')
revision_lines = (BASE / 'notes/revised.md').read_text().strip().split('\n\n')
title, revised = revision_lines[0].removeprefix('# '), revision_lines[1:]
assert len(original) == len(revised) == 4

body = ParagraphStyle('Body', fontName='Times-Roman', fontSize=12, leading=17,
                      alignment=TA_LEFT, firstLineIndent=20, spaceAfter=10,
                      allowWidows=0, allowOrphans=0)
heading = ParagraphStyle('Heading', fontName='Times-Bold', fontSize=18, leading=22, spaceAfter=7)
subtitle = ParagraphStyle('Subtitle', fontName='Helvetica', fontSize=9, leading=13,
                          textColor=colors.HexColor('#555555'), spaceAfter=17)
essay_title = ParagraphStyle('EssayTitle', fontName='Times-Bold', fontSize=14, leading=18, spaceAfter=13)
source_heading = ParagraphStyle('SourcesHeading', fontName='Helvetica-Bold', fontSize=9, leading=12, spaceBefore=8, spaceAfter=5)
source = ParagraphStyle('Source', fontName='Times-Roman', fontSize=9, leading=12, spaceAfter=5)

def draw_page(label):
    def draw(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#555555'))
        canvas.drawString(65, 757, 'WORK AND LEISURE')
        canvas.drawRightString(547, 757, label)
        canvas.setStrokeColor(colors.HexColor('#dddddd'))
        canvas.line(65, 748, 547, 748)
        canvas.drawRightString(547, 35, str(doc.page))
        canvas.restoreState()
    return draw

doc = BaseDocTemplate(str(OUTPUT), pagesize=letter, title='Work and Leisure: Original and Revised',
                      author='Original draft: user; revised version: assistant',
                      leftMargin=65, rightMargin=65, topMargin=62, bottomMargin=55)
doc.addPageTemplates([
    PageTemplate(id='original', frames=[Frame(65, 55, 482, 675, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], onPage=draw_page('Part 1 | Original draft')),
    PageTemplate(id='revised', frames=[Frame(65, 55, 482, 675, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], onPage=draw_page('Part 2 | Revised version')),
])
story = [Paragraph('Part 1: Original Draft', heading),
         Paragraph('Your latest pasted draft. Wording preserved; paragraph spacing formatted for readability.', subtitle)]
story.extend(Paragraph(escape(p), body) for p in original)
story.extend([NextPageTemplate('revised'), PageBreak(), Paragraph('Part 2: Revised Version', heading),
              Paragraph('Assistant revision focused on commentary, integrated evidence, and reduced repetition.', subtitle),
              Paragraph(escape(title), essay_title)])
story.extend(Paragraph(escape(p), body) for p in revised)
story.append(Paragraph('Sources for the revised version', source_heading))
references = [
    'Piercy, Marge. “To be of use.” <link href="https://www.poetryfoundation.org/poems/57673/to-be-of-use" color="#24557a">Poetry Foundation</link>.',
    'Davies, W. H. “Leisure.” <link href="https://rpo.library.utoronto.ca/content/leisure" color="#24557a">Representative Poetry Online, University of Toronto Libraries</link>.',
    'Albulescu, Patricia, et al. “\'Give me a break!\' A systematic review and meta-analysis on the efficacy of micro-breaks for increasing well-being and performance.” <i>PLOS ONE</i>, vol. 17, no. 8, 31 Aug. 2022, e0272460. <link href="https://doi.org/10.1371/journal.pone.0272460" color="#24557a">doi:10.1371/journal.pone.0272460</link>.',
]
story.extend(Paragraph(p, source) for p in references)
doc.build(story)
print(OUTPUT)
print('Original words:', len(' '.join(original).split()))
print('Revised words:', len(' '.join(revised).split()))
