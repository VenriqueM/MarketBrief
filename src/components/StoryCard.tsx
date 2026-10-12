import { useState } from 'react';
import type { Story } from '../types';
import { timeAgo } from '../lib/format';

export function StoryCard({ story, bookmarked, note, onBookmark, onNote }: { story: Story; bookmarked: boolean; note: string; onBookmark: () => void; onNote: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  return <article className="story-card">
    <div className="story-meta"><span className="category-tag">{story.category}</span><span>{story.source}</span><span aria-label={new Date(story.publishedAt).toLocaleString()}>{timeAgo(story.publishedAt)}</span></div>
    <h3>{story.headline}</h3><p className="story-description">{story.description}</p>
    <div className="story-actions">{story.mode === 'live' && /^https:\/\//.test(story.url) ? <a className="read-link" href={story.url} target="_blank" rel="noreferrer">Read original <span aria-hidden="true">↗</span></a> : <span className="read-link" aria-disabled="true">Demo story</span>}<div className="action-buttons"><button className={bookmarked ? 'active' : ''} onClick={onBookmark} aria-pressed={bookmarked} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark story'}>{bookmarked ? '★ Saved' : '☆ Save'}</button><button className={editing ? 'active' : ''} onClick={() => setEditing(!editing)} aria-expanded={editing}>✎ Note</button></div></div>
    {editing && <label className="note-field">Private note<textarea value={note} onChange={event => onNote(event.target.value)} placeholder="Add your research note…" rows={2} /></label>}
    {!editing && note && <p className="saved-note"><span>PRIVATE NOTE</span> {note}</p>}
  </article>;
}
