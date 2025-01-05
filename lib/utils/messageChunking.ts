const MAX_CHUNK_SIZE = 8000; // Leave buffer for Pusher's 10KB limit

export function chunkMessage(content: string): string[] {
  if (content.length <= MAX_CHUNK_SIZE) {
    return [content];
  }

  const chunks: string[] = [];
  let remaining = content;

  while (remaining.length > 0) {
    // Find a good break point
    let breakPoint = MAX_CHUNK_SIZE;
    if (remaining.length > MAX_CHUNK_SIZE) {
      // Try to break at last space before limit
      const lastSpace = remaining.lastIndexOf(' ', MAX_CHUNK_SIZE);
      if (lastSpace > 0) {
        breakPoint = lastSpace;
      }
    }

    chunks.push(remaining.slice(0, breakPoint));
    remaining = remaining.slice(breakPoint).trim();
  }

  return chunks;
}