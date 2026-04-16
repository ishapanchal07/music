export function extractMetadata(filename: string): { title: string; artist: string; cleanName: string } {
  if (!filename) {
    return { title: "Unknown Track", artist: "Unknown Artist", cleanName: "Unknown" };
  }

  let clean = filename.replace(/\.(mp3|wav|m4a|flac|ogg|aac|wma)$/i, '');
  
  clean = clean.replace(/\[?[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\]?/gi, '');
  
  const junkPhrases = [
    /\[?official\s*(music)?\s*video\]?/gi,
    /\(?official\s*audio\)?/gi,
    /\[?lyric(s)?\s*(video)?\]?/gi,
    /\(?\s*HD\s*\)?/gi,
    /\[?FREE\]?/gi,
    /^yt1s\.com\s*-\s*/gi,
    /^y2mate\.com\s*-\s*/gi,
    /^\s*\d+\s*kbps\s*/gi
  ];

  for (const regex of junkPhrases) {
    clean = clean.replace(regex, '');
  }

  clean = clean.replace(/\s+/g, ' ').trim();
  if (clean.endsWith('-')) clean = clean.slice(0, -1).trim();
  if (clean.startsWith('-')) clean = clean.slice(1).trim();
  
  const splitMatch = clean.split(/\s*-\s*/);
  
  let artist = "Unknown Artist";
  let title = clean;

  if (splitMatch.length >= 2) {
    artist = splitMatch[0].trim();
    title = splitMatch.slice(1).join(' - ').trim();
  }

  return { title: title || clean, artist: artist || "Unknown Artist", cleanName: clean };
}
