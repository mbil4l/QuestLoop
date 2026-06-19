/**
 * Renders a country flag as an image (flagcdn.com) rather than an emoji.
 * Windows doesn't render regional-indicator flag emoji, so images are the only
 * cross-platform option. `code` is a 2-letter ISO country code.
 */
export function Flag({ code, className }: { code?: string; className?: string }) {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return null;
  const cc = code.toLowerCase();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/24x18/${cc}.png`}
      srcSet={`https://flagcdn.com/48x36/${cc}.png 2x`}
      width={20}
      height={15}
      alt={code.toUpperCase()}
      className={className}
      loading="lazy"
    />
  );
}
