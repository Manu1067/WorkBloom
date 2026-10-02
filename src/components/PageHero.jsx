import { useState } from 'react';

import dashboardHero from '../images/dashboard_hero.png';
import wellnessHero from '../images/wellness_hero.png';
import learningHero from '../images/Learning_hero.png';
import impactHero from '../images/impact_hero.png';
import analyticsHero from '../images/Analytics_hero.png';
import appreciationHero from '../images/Appreciation_hero.png';
import communityHero from '../images/Community_hero.png';
import buddyHero from '../images/buddy_hero.png';
import clubsHero from '../images/clubsimage_hero.png';
import eventsHero from '../images/Events_hero.png';

/**
 * One place that maps each page to its supplied hero banner in src/images.
 * (Vite bundles + hashes these imports, so they resolve on direct navigation
 * and refresh. Filenames are case-sensitive on Linux/CI - keep them exact.)
 */
const HEROES = {
  dashboard: { src: dashboardHero, alt: 'Welcome to WorkBloom: a laptop showing the wellbeing dashboard among plants and notes of encouragement' },
  wellness: { src: wellnessHero, alt: 'AI Wellness: a person meditating at a desk with a wellness score and mood check-in beside them' },
  learning: { src: learningHero, alt: 'Learning: colleagues studying together at a laptop with books on leadership, technology and growth' },
  impact: { src: impactHero, alt: 'Make an Impact: colleagues in green WorkBloom shirts planting a young tree together' },
  analytics: { src: analyticsHero, alt: 'Analytics: a colleague presenting workplace insight charts to a team' },
  appreciation: { src: appreciationHero, alt: 'The Wall of Appreciation: a board of thank-you notes beside a small trophy' },
  community: { src: communityHero, alt: 'Our Community: a board of shared photos and notes about belonging and ideas' },
  buddy: { src: buddyHero, alt: 'Buddy Connections: a board of photos of colleagues supporting each other' },
  clubs: { src: clubsHero, alt: 'Clubs: a board of photos of colleagues enjoying music, art and shared hobbies' },
  events: { src: eventsHero, alt: 'Events: a board of photos from workplace gatherings, workshops and celebrations' },
};

/**
 * Page banner. The supplied banners already contain their own headline, so
 * no text is overlaid. They are 2048x768 (8:3): the box keeps that ratio so
 * the artwork is never cropped through its lettering, and `object-fit: cover`
 * only matters if a differently-shaped image is dropped in later.
 * If the file fails to load the banner simply disappears and the page's own
 * heading card (which stays below it) carries the page.
 */
export function PageHero({ page }) {
  const [failed, setFailed] = useState(false);
  const hero = HEROES[page];
  if (!hero || failed) return null;

  return (
    <img
      src={hero.src}
      alt={hero.alt}
      decoding="async"
      onError={() => setFailed(true)}
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        aspectRatio: '2048 / 768',
        objectFit: 'cover',
        borderRadius: 18,
        marginBottom: 22,
        background: 'hsl(var(--paper-warm))',
        boxShadow: '0 10px 26px hsl(var(--shadow) / .08)',
      }}
    />
  );
}

export default PageHero;
