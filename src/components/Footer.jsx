import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6 mt-12">
      <div className="max-w-6xl mx-auto flex justify-center items-center space-x-4">
        <a 
          href="https://github.com/atharv96k" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Github size={24} className="mr-2" />
          GitHub
        </a>
      </div>
      <p className="text-center text-gray-500 text-sm mt-2">
        &copy; {new Date().getFullYear()} Fake News Detection Platform. All rights reserved.
      </p>
    </footer>
  );
}
