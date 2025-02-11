import { createParagraphPlugin } from '@udecode/plate';
import { createAlignPlugin } from '@udecode/plate-alignment/src/index';
import { createBlockquotePlugin } from '@udecode/plate-block-quote/src/index';
import { createHeadingPlugin } from '@udecode/plate-heading/src/index';
import { createLinkPlugin } from '@udecode/plate-link/src/index';
import { createListPlugin } from '@udecode/plate-list/src/index';
import { createImagePlugin } from '@udecode/plate-media/src/index';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph/src/createParagraphPlugin';
import { createTablePlugin } from '@udecode/plate-table/src/index';
import { createPlateUIEditor } from '@udecode/plate-ui/src/utils/createPlateUIEditor';
import { htmlStringToDOMNode } from '../../../../core/src/plugins/html-deserializer/utils/htmlStringToDOMNode';
import { serializeHtml } from '../serializeHtml';

it('serialize list to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createListPlugin()],
  });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
      nodes: [
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'Item one' }] },
            { type: 'li', children: [{ text: 'Item two' }] },
          ],
        },
      ],
    })
  ).getElementsByTagName('ul')[0];
  expect(render.children.length).toEqual(2);
  expect(render.children[0].outerHTML).toEqual(
    '<li class="slate-li">Item one</li>'
  );
  expect(render.children[1].outerHTML).toEqual(
    '<li class="slate-li">Item two</li>'
  );
});

it('serialize link to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createLinkPlugin()],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        {
          type: 'a',
          url: 'https://theuselessweb.com/',
          children: [{ text: 'link' }],
        },
        { text: ' part.' },
      ],
    })
  ).toBe(
    'Some paragraph of text with <a class="slate-a" href="https://theuselessweb.com/">link</a> part.'
  );
});

it('serialize blockquote to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createBlockquotePlugin()],
  });

  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          {
            type: 'blockquote',
            children: [{ text: 'Blockquoted text\n here...' }],
          },
        ],
      })
    ).getElementsByTagName('blockquote')[0].textContent
  ).toEqual('Blockquoted text here...');
});

it('serialize blockquote to html, without trimming whitespace', () => {
  const editor = createPlateUIEditor({
    plugins: [createBlockquotePlugin()],
  });

  const html = serializeHtml(editor, {
    nodes: [
      {
        type: 'blockquote',
        children: [{ text: 'Blockquoted text\nhere...' }],
      },
    ],
    stripWhitespace: false,
  });

  const node = htmlStringToDOMNode(html, false);
  expect(node.getElementsByTagName('blockquote')[0].textContent).toEqual(
    'Blockquoted text\nhere...'
  );
});

it('serialize headings to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createHeadingPlugin()],
  });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
      nodes: [
        {
          type: 'h1',
          children: [{ text: 'Heading 1' }],
        },
        {
          type: 'h2',
          children: [{ text: 'Heading 2' }],
        },
        {
          type: 'h3',
          children: [{ text: 'Heading 3' }],
        },
      ],
    })
  );
  expect(render.getElementsByTagName('h1')[0].textContent).toEqual('Heading 1');
  expect(render.getElementsByTagName('h2')[0].textContent).toEqual('Heading 2');
  expect(render.getElementsByTagName('h3')[0].textContent).toEqual('Heading 3');
});

it('serialize paragraph to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createParagraphPlugin()],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: 'p',
          children: [{ text: 'Some random paragraph here...' }],
        },
      ],
    })
  ).toMatch(new RegExp('<p class="slate-p">Some random paragraph here...</p>'));
});

it('serialize image to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createImagePlugin()],
  });

  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          {
            type: 'img',
            url:
              'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
            children: [],
          },
        ],
      })
    ).getElementsByTagName('img')[0].src
  ).toEqual('https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg');
});

it('serialize table to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createTablePlugin()],
  });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
      nodes: [
        {
          type: 'table',
          children: [
            {
              type: 'tr',
              children: [
                { type: 'td', children: [{ text: 'Foo' }] },
                { type: 'td', children: [{ text: 'Bar' }] },
              ],
            },
            {
              type: 'tr',
              children: [
                {
                  type: 'td',
                  attributes: { colspan: '2' },
                  children: [{ text: 'Span' }],
                },
              ],
            },
          ],
        },
      ],
    })
  ).getElementsByTagName('table')[0];
  expect(render.children[1].children[0].children[0].textContent).toEqual('Foo');
  expect(render.children[1].children[0].children[1].textContent).toEqual('Bar');
});

it('serialize align style to html', () => {
  const editor = createPlateUIEditor({
    plugins: [createParagraphPlugin(), createAlignPlugin()],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          align: 'center',
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe(
    '<p class="slate-p slate-align-center" style="text-align:center">I am centered text!</p>'
  );
});

it('serialize align className to html', () => {
  const plugins = [
    createParagraphPlugin(),
    createAlignPlugin({
      props: { classNames: { center: 'slate-align-center' } },
    }),
  ];

  const editor = createPlateUIEditor({
    plugins,
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          align: 'center',
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe(
    '<p class="slate-p slate-align-center" style="text-align:center">I am centered text!</p>'
  );
});

it('serialize image and paragraph to html', () => {
  const plugins = [createParagraphPlugin(), createImagePlugin()];
  const render = serializeHtml(createPlateUIEditor({ plugins }), {
    nodes: [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'I am centered text!' }],
      },
      {
        type: 'img',
        url: 'https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg',
        children: [],
      },
    ],
  });
  const result =
    '<p class="slate-p">I am centered text!</p><div class="slate-img"><figure class="slate-ImageElement-figure" contenteditable="false"><div style="position:relative;user-select:auto;width:0px;height:100%;max-width:100%;min-width:92px;box-sizing:border-box;flex-shrink:0" class="slate-ImageElement-resizable"><img src="https://i.kym-cdn.com/photos/images/original/001/358/546/3fa.jpg" alt="" draggable="true" class="slate-ImageElement-img"/><div><div  style="position:absolute;user-select:none;width:10px;height:100%;top:0px;left:0;cursor:col-resize"><div class="slate-ImageElement-handleLeft"></div></div><div  style="position:absolute;user-select:none;width:10px;height:100%;top:0px;cursor:col-resize;right:0"><div class="slate-ImageElement-handleRight"></div></div></div></div></figure></div>';
  expect(render).toBe(result);
});
