export function serverParse<T>(el: MathMLElement): T {
  let attributes = '';

  if (el?.outerHTML) {
    return el?.outerHTML as T;
  }

  for (const key in el) {
    if (ommitAttributes.includes(key)) {
      continue;
    } else if (key === 'className') {
      attributes += `class="${el[key as keyof MathMLElement]}" `;
    } else if (key === 'dataset') {
      for (const dataKey in el.dataset) {
        attributes += `data-${dataKey}="${el.dataset[dataKey]}" `;
      }
    } else if (Object.prototype.hasOwnProperty.call(el, key)) {
      const value = el[key as keyof MathMLElement];
      attributes += `${key}="${value}" `;
    }
  }

  if (isSelfClosingTag(el?.tagName as string)) {
    return `<${el?.tagName} ${attributes}/>` as T;
  }

  return `<${el?.tagName} ${attributes}>${
    el?.innerHTML ?? el?.textContent ?? ''
  }</${el?.tagName}>` as T;
}

const ommitAttributes = ['tagName', 'innerHTML', 'textContent', 'outerHTML'];

const selfClosingTags = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

function isSelfClosingTag(tagName: string) {
  return selfClosingTags.indexOf(tagName.toLowerCase()) !== -1;
}
