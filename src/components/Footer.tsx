export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E5E7EB] dark:border-gray-800 bg-white dark:bg-gray-900 py-4 px-4">
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Invocraft
          {import.meta.env.APP_VERSION && `${import.meta.env.APP_VERSION}`}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          © {new Date().getFullYear()} Invocraft. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
