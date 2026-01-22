import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-border bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold">Custom Artwork</h3>
            <p className="text-muted-foreground max-w-xs text-sm">
              Turn a place you love into a timeless artwork. Hand-drawn and
              printed in the UK.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/create"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Create Your Artwork
              </Link>
              <Link
                href="/#how-it-works"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="/#gallery"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Gallery
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Contact</h4>
            <p className="text-muted-foreground text-sm">
              Questions about your commission?
              <br />
              <a
                href="mailto:hello@customartwork.co.uk"
                className="text-primary hover:underline"
              >
                hello@customartwork.co.uk
              </a>
            </p>
          </div>
        </div>

        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Custom Artwork. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Designed & printed in the UK 🇬🇧
          </p>
        </div>
      </div>
    </footer>
  )
}
