export function generateWikiCode(title: string, storyData: any, content: string): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let wiki = `{{Infobox Story
| title       = ${title}
| image       = ${storyData.illustrations?.[0]?.url || ''}
| genre       = ${storyData.storyType?.name || 'Fiction'}
| author      = ${storyData.authorName || 'Unknown'}
| created     = ${currentDate}
| status      = In Progress
}}\n\n`;

  wiki += `'''${title}''' is a story about ${storyData.description || '...'}.\n\n`;

  wiki += `== Synopsis ==\n${storyData.description || ''}\n\n`;

  if (storyData.hooks) {
    wiki += `== Hook ==\n${typeof storyData.hooks === 'string' ? storyData.hooks : (storyData.hooks.selected?.text || storyData.hooks.chosen?.text || '')}\n\n`;
  }

  wiki += `== Characters ==\n`;
  if (storyData.character) {
    wiki += `=== ${storyData.character.name || 'Protagonist'} ===\n`;
    wiki += `* '''Archetype''': ${storyData.character.archetype || 'Unknown'}\n`;
    wiki += `* '''Role''': Protagonist\n`;
    wiki += `* '''Description''': ${storyData.character.description || ''}\n\n`;
  }

  wiki += `== Plot Outline ==\n`;
  if (storyData.scenes && storyData.scenes.length > 0) {
    storyData.scenes.forEach((scene: any, index: number) => {
        wiki += `=== Chapter ${index + 1}: ${scene.title} ===\n`;
        wiki += `${scene.description || ''}\n\n`;
    });
  } else if (storyData.structure?.beats) {
     storyData.structure.beats.forEach((beat: any) => {
        wiki += `=== ${beat.name} ===\n`;
        wiki += `${beat.description || ''}\n\n`;
     });
  }

  wiki += `== Draft Content ==\n<pre>\n${content}\n</pre>\n\n`;

  wiki += `[[Category:Stories]]\n[[Category:${storyData.storyType?.name || 'Fiction'}]]`;

  return wiki;
}

