const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">🎓 SkillSwap IIT</h3>
            <p className="text-gray-300 text-sm">
              Connecting students to exchange skills and build meaningful learning relationships.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
              <li><a href="/browse" className="text-gray-300 hover:text-white">Browse Mentors</a></li>
              <li><a href="/faq" className="text-gray-300 hover:text-white">FAQ</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-300 text-sm">
              Email: support@skillswap.iit.ac.in<br />
              Phone: +91 XXX XXX XXXX
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; 2026 SkillSwap IIT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
