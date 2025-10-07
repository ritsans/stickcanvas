export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} StickCanvas. All rights reserved.
          </div>

          <nav className="flex gap-6 text-sm">
            <a href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </a>
            <a href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms
            </a>
            <a href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy
            </a>
            <a href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
