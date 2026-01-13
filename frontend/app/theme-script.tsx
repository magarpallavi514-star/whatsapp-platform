export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            // FORCE LIGHT MODE ONLY - Never sync with OS theme
            localStorage.setItem('theme', 'light');
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
          } catch (e) {}
        `,
      }}
    />
  );
}
