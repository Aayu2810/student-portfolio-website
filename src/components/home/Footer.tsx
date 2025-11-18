export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 py-12 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              CampusCred
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Digital Document Management for Academic Excellence
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 CampusCred. Built by RV Students.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              Phase 1 - Design Thinking Lab Project
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}