const Footer = () => {
  return (
    <footer className="py-4">
      <p className="text-sm leading-loose text-muted-foreground md:text-left">
        Built by{' '}
        <a
          href="https://stormix.dev"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          Stormix
        </a>
        . The source code is available on{' '}
        <a
          href="https://github.com/Stormix/msn"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          GitHub
        </a>
        .
      </p>
    </footer>
  )
}

export default Footer
