import React from "react";

export const BrandingLogo: React.FC = () => {
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <a
        href="https://automateitplease.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center">
          <img
            src="https://www.automateitplease.com/images/logo512.png"
            alt="AutomateItPlease"
            width={24}
            height={24}
          />
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
          Made with ❤️ by AutomateItPlease!
        </span>
        <svg
          className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
};
