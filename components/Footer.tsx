import React from 'react';
import {
  SpotifyIcon,
  AppleMusicIcon,
  YouTubeMusicIcon,
  AmazonMusicIcon,
  InstagramIcon,
  TikTokIcon,
} from './icons';

interface FooterProps {
    // FIX: Changed 't' prop type to an object to align with its usage in App.tsx.
    t: { [key: string]: string };
}

const socialLinks = [
  {
    name: 'Spotify',
    Icon: SpotifyIcon,
    href: '#',
  },
  {
    name: 'Apple Music',
    Icon: AppleMusicIcon,
    href: '#',
  },
  {
    name: 'YouTube Music',
    Icon: YouTubeMusicIcon,
    href: '#',
  },
  {
    name: 'Amazon Music',
    Icon: AmazonMusicIcon,
    href: '#',
  },
  {
    name: 'Instagram',
    Icon: InstagramIcon,
    href: '#',
  },
  {
    name: 'TikTok',
    Icon: TikTokIcon,
    href: '#',
  },
];

const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="bg-gray-800 p-4 mt-8">
      <div className="container mx-auto text-center">
        {/* FIX: Changed from function call to property access to match the updated 't' prop type. */}
        <h2 className="text-sm font-semibold text-gray-400 mb-4">{t.findUsOn}</h2>
        <div className="flex justify-center items-center space-x-6">
          {socialLinks.map(({ name, Icon, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Find us on ${name}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Icon className="h-6 w-6" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
